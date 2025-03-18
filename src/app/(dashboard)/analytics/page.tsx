import React from 'react';
import ViewTable from '@/components/view-table';
import { ChevronDownIcon } from "lucide-react";
import { SiteButton } from "@/components/ui/site-button";

export default function RecyclingStatsPage() {
  // User recycling stats table
  const userColumns = [
    { key: 'name', header: 'Name', width: '20%', tdClassName: 'text-center bg-primary/10 text-primary-dark font-bold' },
    { key: 'plastic', header: 'Times they Recycled (Plastic)', tdClassName: 'text-center' },
    { key: 'aluminum', header: 'Times they Recycled (Aluminum)', tdClassName: 'text-center' },
    { key: 'total', header: 'Times they Recycled (Total)', tdClassName: 'text-center' },
    { key: 'timeInApp', header: 'Time in App (Minutes)', tdClassName: 'text-center' },
  ];

  const userData = [
    {
      name: 'Sample Name',
      plastic: 24,
      aluminum: 12,
      total: 36,
      timeInApp: 72,
    },
    {
      name: 'Test Name',
      plastic: 55,
      aluminum: 8,
      total: 63,
      timeInApp: 110,
    },
    {
      name: 'Demo Name',
      plastic: 3,
      aluminum: 14,
      total: 17,
      timeInApp: 54,
    },
  ];

  // Bin data table
  const binColumns = [
    { key: 'binId', header: 'Bin #', width: '20%', tdClassName: 'text-center' },
    {
      key: 'materialType',
      header: 'Type of Material',
      tdClassName: 'text-center',
    },
    { key: 'scanCount', header: 'Number of Scans', tdClassName: 'text-center' },
    { key: 'location', header: 'Location', tdClassName: 'text-center' },
    { key: 'storeName', header: 'Store Name', tdClassName: 'text-center' },
  ];

  const binData = [
    {
      binId: 17,
      materialType: 'Plastic',
      scanCount: 21,
      location: '6430 Ne 4th Ct\nMiami, FL 33138',
      storeName: 'Publix',
    },
    {
      binId: 132,
      materialType: 'Plastic',
      scanCount: 65,
      location: '848 Brickell Ave\nMiami, FL 33134',
      storeName: 'CVS',
    },
    {
      binId: 8,
      materialType: 'Aluminum',
      scanCount: 32,
      location: '6430 Ne 4th Ct\nMiami, FL 33138',
      storeName: 'Publix',
    },
  ];

  return (
    <div className="space-y-12 p-6">
      {/* User section */}
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <h2 >User</h2>
          <div className="flex flex-col">
            <span className="mr-2 text-base font-extrabold">Select Time Period:</span>
            <SiteButton className="h-8 rounded-full flex items-center" color="primaryLight" size="sm" >
              7AM - 8 AM <ChevronDownIcon className="w-4 h-4" />
            </SiteButton>
          </div>
        </div>
        <ViewTable columns={userColumns} data={userData} />
      </div>

      {/* Bin section */}
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <h2 >Bin</h2>
          <div className="flex flex-col">
            <span className="mr-2 text-base font-extrabold">Select Time Period:</span>
            <SiteButton className="h-8 rounded-full flex items-center" color="primaryLight" size="sm" >
              7AM - 8 AM <ChevronDownIcon className="w-4 h-4" />
            </SiteButton>
          </div>
        </div>
        <ViewTable columns={binColumns} data={binData} />
      </div>
    </div>
  );
}
