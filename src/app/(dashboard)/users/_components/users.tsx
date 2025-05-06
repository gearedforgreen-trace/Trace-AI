'use client';

import React, { useEffect } from 'react';
import ViewTable from '@/components/view-table';
import { authClient } from '@/lib/auth-client';

export default function Users() {

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await authClient.admin.listUsers({
        query: {
          limit: 10,
        },
      });
      console.log(users);
    };
    fetchUsers();
  }, []);


  const columns = [
    { key: 'userName', header: 'User Name' },
    { key: 'emailAddress', header: 'Email Address' },
    { key: 'userRole', header: 'User Role' },
    { key: 'phoneNumber', header: 'Phone Number' },
    { key: 'state', header: 'State' },
    { key: 'postalCode', header: 'Postal Code' },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span
          className={`font-medium ${
            value === 'Active' ? 'text-primary' : 'text-red-500'
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  const mockUsers = [
    {
      userName: 'Aiden Callisto',
      emailAddress: 'aiden@gmail.com',
      userRole: 'ADMIN',
      phoneNumber: '09124325432',
      state: 'FL',
      postalCode: '21441',
      status: 'Active',
    },
    {
      userName: 'Seraphine Amara',
      emailAddress: 'seraphine@gmail.com',
      userRole: 'NORMAL_USER',
      phoneNumber: '09124325432',
      state: 'FL',
      postalCode: '21441',
      status: 'Active',
    },
    {
      userName: 'Elias North',
      emailAddress: 'elias@gmail.com',
      userRole: 'BUSINESS_USER',
      phoneNumber: '09124325432',
      state: 'FL',
      postalCode: '21441',
      status: 'Active',
    },
    {
      userName: 'Lorian Vance',
      emailAddress: 'lorian@gmail.com',
      userRole: 'NORMAL_USER',
      phoneNumber: '09124325432',
      state: 'FL',
      postalCode: '21441',
      status: 'Active',
    },
    {
      userName: 'Althea Claris',
      emailAddress: 'althea@gmail.com',
      userRole: 'STORE_MANAGER',
      phoneNumber: '09124325432',
      state: 'FL',
      postalCode: '21441',
      status: 'Active',
    },
  ];


  return <ViewTable columns={columns} data={mockUsers} />;
}
