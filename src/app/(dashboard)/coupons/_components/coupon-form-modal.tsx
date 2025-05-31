/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CalendarIcon,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useGetOrganizationsQuery } from '@/store/api/organizationsApi';
import type { Coupon } from '@/types';

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  onSave: (coupon: Partial<Coupon>) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

interface CouponFormData {
  name: string;
  description: string;
  imageUrl: string;
  couponType: 'FIXED' | 'PERCENTAGE';
  dealType: 'NOPOINTS' | 'POINTS';
  isFeatured: boolean;
  discountAmount: number;
  pointsToRedeem: number;
  startDate: Date | undefined;
  endDate: Date | undefined;
  organizationId: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

export function CouponFormModal({
  isOpen,
  onClose,
  coupon,
  onSave,
  isLoading = false,
  error,
}: CouponFormModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CouponFormData>({
    name: '',
    description: '',
    imageUrl: '',
    couponType: 'FIXED',
    dealType: 'POINTS',
    isFeatured: false,
    discountAmount: 0,
    pointsToRedeem: 0,
    startDate: undefined,
    endDate: undefined,
    organizationId: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<CouponFormData>>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  // Get organizations for the dropdown
  const { data: organizationsResponse } = useGetOrganizationsQuery({
    page: 1,
    perPage: 100,
  });

  const organizations = organizationsResponse?.data || [];

  // Initialize form data when coupon changes
  useEffect(() => {
    if (coupon) {
      setFormData({
        name: coupon.name || '',
        description: coupon.description || '',
        imageUrl: coupon.imageUrl || '',
        couponType: coupon.couponType || 'FIXED',
        dealType: coupon.dealType || 'POINTS',
        isFeatured: coupon.isFeatured || false,
        discountAmount: coupon.discountAmount || 0,
        pointsToRedeem: coupon.pointsToRedeem || 0,
        startDate: coupon.startDate ? new Date(coupon.startDate) : undefined,
        endDate: coupon.endDate ? new Date(coupon.endDate) : undefined,
        organizationId: coupon.organizationId || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        couponType: 'FIXED',
        dealType: 'POINTS',
        isFeatured: false,
        discountAmount: 0,
        pointsToRedeem: 0,
        startDate: undefined,
        endDate: undefined,
        organizationId: '',
      });
    }
    setFormErrors({});
  }, [coupon, isOpen]);

  // Handle form field changes
  const handleChange = (field: keyof CouponFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle image file upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description:
          'Please select a valid image file (JPEG, PNG, WebP, or GIF)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImage(true);
    try {
      // Convert to data URL
      const dataUrl = await fileToDataUrl(file);
      handleChange('imageUrl', dataUrl);
      toast({
        title: 'Image uploaded successfully',
        description: `${file.name} has been uploaded`,
      });
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Failed to process the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Convert file to data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    handleChange('imageUrl', '');
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<CouponFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Coupon name is required';
    }

    if (!formData.organizationId) {
      errors.organizationId = 'Organization is required';
    }

    if (formData.discountAmount < 0) {
      errors.discountAmount = 'Discount amount cannot be negative';
    }

    if (formData.couponType === 'PERCENTAGE' && formData.discountAmount > 100) {
      errors.discountAmount = 'Percentage discount cannot exceed 100%';
    }

    if (formData.pointsToRedeem < 0) {
      errors.pointsToRedeem = 'Points to redeem cannot be negative';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate >= formData.endDate
    ) {
      errors.endDate = 'End date must be after start date';
    }

    if (formData.imageUrl && !formData.imageUrl.startsWith('data:image/')) {
      errors.imageUrl = 'Please upload a valid image file';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Convert dates to ISO strings for API
      const couponData: Partial<Coupon> = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        imageUrl: formData.imageUrl.trim() || null,
        couponType: formData.couponType,
        dealType: formData.dealType,
        isFeatured: formData.isFeatured,
        discountAmount: formData.discountAmount,
        pointsToRedeem: formData.pointsToRedeem,
        startDate: formData.startDate!.toISOString(),
        endDate: formData.endDate!.toISOString(),
        organizationId: formData.organizationId,
      };

      await onSave(couponData);
    } catch (err) {
      // Error handling is done in parent component
      console.error('Error saving coupon:', err);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {coupon ? 'Edit Coupon' : 'Create New Coupon'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Coupon Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter coupon name"
                disabled={isLoading}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationId">Organization *</Label>
              <Select
                value={formData.organizationId}
                onValueChange={(value) => handleChange('organizationId', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.organizationId && (
                <p className="text-sm text-red-500">
                  {formErrors.organizationId}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Coupon Image</Label>

            {/* Image Upload Area */}
            {!formData.imageUrl ? (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isLoading || uploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={cn(
                    'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors'
                  )}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingImage ? (
                      <Loader2 className="w-8 h-8 mb-2  animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 mb-2 " />
                    )}
                    <p className="mb-2 text-sm ">
                      {uploadingImage ? (
                        <span>Processing image...</span>
                      ) : (
                        <span>
                          <span className="font-semibold">Click to upload</span>{' '}
                          or drag and drop
                        </span>
                      )}
                    </p>
                    <p className="text-xs ">
                      PNG, JPG, WebP, or GIF (max 10MB)
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              /* Image Preview */
              <div className="relative">
                <div className="relative w-full h-32  rounded-lg overflow-hidden">
                  <img
                    src={formData.imageUrl}
                    alt="Coupon preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isLoading}
                    className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm  flex items-center">
                    <ImageIcon className="w-4 h-4 mr-1" />
                    Image uploaded successfully
                  </p>
                  <label
                    htmlFor="image-replace"
                    className="text-sm dark:text-blue-400
                    text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Replace image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isLoading || uploadingImage}
                    className="hidden"
                    id="image-replace"
                  />
                </div>
              </div>
            )}

            {formErrors.imageUrl && (
              <p className="text-sm text-red-500">{formErrors.imageUrl}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter coupon description"
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Coupon Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="couponType">Coupon Type *</Label>
              <Select
                value={formData.couponType}
                onValueChange={(value) => handleChange('couponType', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dealType">Deal Type *</Label>
              <Select
                value={formData.dealType}
                onValueChange={(value) => handleChange('dealType', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select deal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POINTS">Requires Points</SelectItem>
                  <SelectItem value="NOPOINTS">No Points Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center ">
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => handleChange('isFeatured', checked)}
              disabled={isLoading}
            />
            <Label htmlFor="isFeatured">Featured Coupon</Label>
          </div>

          {/* Discount and Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountAmount">
                Discount Amount * (
                {formData.couponType === 'PERCENTAGE' ? '%' : '$'})
              </Label>
              <Input
                id="discountAmount"
                type="number"
                min="0"
                max={formData.couponType === 'PERCENTAGE' ? '100' : undefined}
                value={formData.discountAmount}
                onChange={(e) =>
                  handleChange('discountAmount', Number(e.target.value))
                }
                placeholder="0"
                disabled={isLoading}
              />
              {formErrors.discountAmount && (
                <p className="text-sm text-red-500">
                  {formErrors.discountAmount}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pointsToRedeem">Points to Redeem *</Label>
              <Input
                id="pointsToRedeem"
                type="number"
                min="0"
                value={formData.pointsToRedeem}
                onChange={(e) =>
                  handleChange('pointsToRedeem', Number(e.target.value))
                }
                placeholder="0"
                disabled={isLoading}
              />
              {formErrors.pointsToRedeem && (
                <p className="text-sm text-red-500">
                  {formErrors.pointsToRedeem}
                </p>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.startDate && 'text-muted-foreground'
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, 'PPP')
                    ) : (
                      <span>Pick start date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => handleChange('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formErrors.startDate && (
                <p className="text-sm text-red-500">{formErrors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.endDate && 'text-muted-foreground'
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, 'PPP')
                    ) : (
                      <span>Pick end date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => handleChange('endDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formErrors.endDate && (
                <p className="text-sm text-red-500">{formErrors.endDate}</p>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <DialogFooter>
            <div className="mt-4 flex sm:flex-row flex-col items-center gap-2 ">
           <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="max-sm:w-full"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="max-sm:w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {coupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
           </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
