"use client";

import { StoresByOrganization } from "@/lib/api/services/analytics-api";
import React from 'react';
import { MapPin, Store as StoreIcon } from 'lucide-react';

interface StoresByOrganizationMapProps {
  data: StoresByOrganization[];
}

// Since we don't have actual store coordinates in our analytics data
// and react-simple-maps might cause issues, we'll use a simplified representation
export default function StoresByOrganizationMap({ data }: StoresByOrganizationMapProps) {
  // Sort organizations by store count
  const sortedOrganizations = [...data].sort((a, b) => b.storeCount - a.storeCount);
  
  // Color palette for organizations
  const organizationColors = [
    "#22c55e", // Green
    "#3b82f6", // Blue
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#8b5cf6", // Purple
    "#ef4444", // Red
    "#06b6d4", // Cyan
  ];

  return (
    <div className="h-[500px] w-full relative overflow-hidden">
      {/* Simple visualization instead of actual map */}
      <div className="absolute inset-0 bg-gray-100 rounded-xl">
        <div className="p-4 h-full relative">
          {/* Visualize organizations as circles */}
          <div className="grid grid-cols-3 gap-4 h-[400px]">
            {sortedOrganizations.map((org, index) => {
              // Calculate circle size based on store count
              const size = Math.max(20, Math.min(80, 30 + org.storeCount * 8));
              
              return (
                <div 
                  key={org.organizationId} 
                  className="flex flex-col items-center justify-center"
                >
                  <div 
                    className="relative flex items-center justify-center rounded-full mb-2"
                    style={{ 
                      width: `${size}px`, 
                      height: `${size}px`,
                      backgroundColor: organizationColors[index % organizationColors.length],
                    }}
                  >
                    <StoreIcon className="text-white" size={size/3} />
                    <span className="absolute text-white font-bold">
                      {org.storeCount}
                    </span>
                  </div>
                  <span className="text-xs text-center font-medium">
                    {org.organizationName}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-md">
            <h4 className="text-sm font-bold mb-1">Organizations</h4>
            <div className="space-y-1">
              {sortedOrganizations.slice(0, 5).map((org, index) => (
                <div key={org.organizationId} className="flex items-center text-xs">
                  <div 
                    className="w-3 h-3 rounded-full mr-1"
                    style={{ backgroundColor: organizationColors[index % organizationColors.length] }}
                  />
                  <span>{org.organizationName}: {org.storeCount} stores</span>
                </div>
              ))}
              {sortedOrganizations.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  +{sortedOrganizations.length - 5} more organizations
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer about visualization */}
      <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-muted-foreground">
        <p className="italic">This visualization shows organization store counts</p>
      </div>
    </div>
  );
}