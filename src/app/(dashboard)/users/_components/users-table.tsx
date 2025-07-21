'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useUsers } from '@/hooks/api/use-users';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
  X,
  MoreHorizontal,
  User,
  Building2,
  Eye,
  Edit,
  Recycle,
} from 'lucide-react';
import {
  UserFilterParams,
  UsersApiService,
  User as UserType,
} from '@/lib/api/services/users-api';
import { ViewProfileModal } from './view-profile-modal';
import { EditProfileModal } from './edit-profile-modal';
import {
  UserStatusConfirmationDialog,
  UserStatusAction,
} from './user-status-confirmation-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';

export default function UsersTable() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isStatusConfirmationOpen, setIsStatusConfirmationOpen] =
    useState(false);
  const [pendingStatusAction, setPendingStatusAction] =
    useState<UserStatusAction | null>(null);
  const [userForStatusChange, setUserForStatusChange] =
    useState<UserType | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { toast } = useToast();
  const usersApi = new UsersApiService();

  const {
    users,
    isLoading,
    error,
    pagination,
    filters,
    filterOptions,
    updateFilters,
    changePage,
    refetch,
  } = useUsers();

  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchValue });
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchValue('');
    updateFilters({ search: '' });
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof UserFilterParams, value: any) => {
    if (value === 'all') {
      updateFilters({ [key]: undefined });
    } else {
      updateFilters({ [key]: value });
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    const newSortOrder =
      filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';

    updateFilters({
      sortBy: field,
      sortOrder: newSortOrder,
    });
  };

  // Handle view profile
  const handleViewProfile = (user: UserType) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // Handle edit profile
  const handleEditProfile = (user: UserType) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Handle save user changes
  const handleSaveUser = async (
    userId: string,
    userData: Partial<UserType>
  ) => {
    setIsUpdating(true);
    try {
      await usersApi.updateUser(userId, userData);
      // Refresh the users list
      await refetch();
      toast({
        title: 'Success',
        description: 'User profile updated successfully.',
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user profile. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Close modals
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  // Handle status change actions (suspend, activate, ban)
  const handleStatusChange = (user: UserType, action: UserStatusAction) => {
    setUserForStatusChange(user);
    setPendingStatusAction(action);
    setIsStatusConfirmationOpen(true);
  };

  // Handle status change confirmation
  const confirmStatusChange = async () => {
    if (!userForStatusChange || !pendingStatusAction) return;

    setIsUpdatingStatus(true);
    try {
      const newStatus =
        pendingStatusAction === 'activate'
          ? 'active'
          : pendingStatusAction === 'suspend'
            ? 'suspended'
            : 'banned';

      await usersApi.updateUserStatus(userForStatusChange.id, newStatus);

      // Refresh the users list
      await refetch();

      // Close confirmation dialog
      setIsStatusConfirmationOpen(false);
      setUserForStatusChange(null);
      setPendingStatusAction(null);

      const actionText =
        pendingStatusAction === 'activate'
          ? 'activated'
          : pendingStatusAction === 'suspend'
            ? 'suspended'
            : 'banned';

      toast({
        title: 'Success',
        description: `User has been ${actionText} successfully.`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Close status confirmation dialog
  const closeStatusConfirmation = () => {
    if (!isUpdatingStatus) {
      setIsStatusConfirmationOpen(false);
      setUserForStatusChange(null);
      setPendingStatusAction(null);
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Format role for display
  const formatRole = (role: string) => {
    if (!role) return 'User';
    return role
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Render status badge
  const renderStatus = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant:
          | 'default'
          | 'outline'
          | 'secondary'
          | 'destructive'
          | 'success';
      }
    > = {
      active: { label: 'Active', variant: 'success' },
      banned: { label: 'Banned', variant: 'destructive' },
      suspended: { label: 'Suspended', variant: 'secondary' },
    };

    const statusInfo = statusMap[status.toLowerCase()] || {
      label: status,
      variant: 'outline',
    };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  // Show error state
  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50">
        Error loading users: {error.message}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8 pr-10"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-2.5"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <button type="submit" className="sr-only">
                Search
              </button>
            </form>
          </div>

          {/* Status filter */}
          <div className="w-full sm:w-40">
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {filterOptions.statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role filter */}
          <div className="w-full sm:w-40">
            <Select
              value={filters.role || 'all'}
              onValueChange={(value) => handleFilterChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {filterOptions.roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {formatRole(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* State filter */}
          <div className="w-full sm:w-40">
            <Select
              value={filters.state || 'all'}
              onValueChange={(value) => handleFilterChange('state', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {filterOptions.states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div
                    className="flex items-center space-x-1 cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <span>User</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center space-x-1 cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <span>Email</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center space-x-1 cursor-pointer"
                    onClick={() => handleSort('role')}
                  >
                    <span>Role</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center space-x-1 cursor-pointer"
                    onClick={() => handleSort('phoneNumber')}
                  >
                    <span>Phone</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center space-x-1 cursor-pointer"
                    onClick={() => handleSort('state')}
                  >
                    <span>State</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>
                  <div
                    className="flex items-center space-x-1 cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <span>Status</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center space-x-1">
                    <span>Total Recycles</span>
                    <Recycle className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton rows
                Array.from({ length: pagination.perPage }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <User className="h-8 w-8 text-muted-foreground" />
                      <div className="text-muted-foreground">
                        No users found
                      </div>
                      {filters.search ||
                      filters.status ||
                      filters.role ||
                      filters.state ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchValue('');
                            updateFilters({
                              search: '',
                              status: undefined,
                              role: undefined,
                              state: undefined,
                            });
                          }}
                        >
                          Clear filters
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          {user.username && (
                            <div className="text-xs text-muted-foreground">
                              @{user.username}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatRole(user.role)}</TableCell>
                    <TableCell>{user.phoneNumber || '—'}</TableCell>
                    <TableCell>{user.state || '—'}</TableCell>
                    <TableCell>
                      {user.organizations.length > 0 ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 mr-1.5" />
                                <span>{user.organizations.length}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1.5">
                                {user.organizations.map((org) => (
                                  <div key={org.id} className="text-xs">
                                    <span className="font-medium">
                                      {org.name}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {' '}
                                      ({org.role})
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>{renderStatus(user.status)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/users/${user.id}/recycle-history`}
                        className="flex items-center space-x-1 hover:text-primary hover:underline"
                      >
                        <span>{user.recycleHistoryCount || 0}</span>
                        <Recycle className="h-4 w-4" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewProfile(user)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditProfile(user)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>

                          {user.status === 'active' ? (
                            <DropdownMenuItem
                              className="text-amber-600"
                              onClick={() =>
                                handleStatusChange(user, 'suspend')
                              }
                            >
                              Suspend User
                            </DropdownMenuItem>
                          ) : user.status === 'suspended' ? (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() =>
                                handleStatusChange(user, 'activate')
                              }
                            >
                              Activate User
                            </DropdownMenuItem>
                          ) : null}
                          {user.status !== 'banned' && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleStatusChange(user, 'ban')}
                            >
                              Ban User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {pagination.total > 0
              ? `Showing ${(pagination.currentPage - 1) * pagination.perPage + 1} to ${Math.min(
                  pagination.currentPage * pagination.perPage,
                  pagination.total
                )} of ${pagination.total} users`
              : 'No users found'}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Per page</p>
              <Select
                value={String(pagination.perPage)}
                onValueChange={(value) => {
                  updateFilters({ perPage: parseInt(value) });
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pagination.perPage} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={String(pageSize)}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(pagination.currentPage - 1)}
                disabled={!pagination.prev}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <div className="flex items-center">
                <p className="text-sm font-medium">
                  Page {pagination.currentPage} of {pagination.lastPage}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(pagination.currentPage + 1)}
                disabled={!pagination.next}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Modals */}
      <ViewProfileModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        user={selectedUser}
      />

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        user={selectedUser}
        onSave={handleSaveUser}
        isLoading={isUpdating}
      />

      <UserStatusConfirmationDialog
        isOpen={isStatusConfirmationOpen}
        onClose={closeStatusConfirmation}
        onConfirm={confirmStatusChange}
        user={userForStatusChange}
        action={pendingStatusAction!}
        isLoading={isUpdatingStatus}
      />
    </Card>
  );
}
