import React from 'react';
import CouponsList from './_components/coupons-list';
import { Plus } from 'lucide-react';
import { SiteButton } from "@/components/ui/site-button";

export default function CouponsPage() {
  const coupons = [
    { id: 1, name: 'ABC', email: 'abc@gmail.com', avatar: '/girl.jpg' },
    { id: 2, name: 'ABC', email: 'abc@gmail.com', avatar: '/girl.jpg' },
    { id: 3, name: 'ABC', email: 'abc@gmail.com', avatar: '/girl.jpg' },
    { id: 4, name: 'ABC', email: 'abc@gmail.com', avatar: '/girl.jpg' },
    { id: 5, name: 'ABC', email: 'abc@gmail.com', avatar: '/girl.jpg' },
    { id: 6, name: 'ABC', email: 'abc@gmail.com', avatar: '/girl.jpg' },
    { id: 7, name: 'ABC', email: 'abc@gmail.com', avatar: '/girl.jpg' },
    { id: 8, name: 'ABC', email: 'abc@gmail.com', avatar: '/girl.jpg' },
  ];

  return (
    <div >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 >Manage Coupons</h2>
        </div>
        <SiteButton
          variant="solid"
          color="primaryLight"
          className="rounded-full"
        >
          <Plus size={18} />
          New Company
        </SiteButton>
      </div>
      <CouponsList coupons={coupons} />
    </div>
  );
}
