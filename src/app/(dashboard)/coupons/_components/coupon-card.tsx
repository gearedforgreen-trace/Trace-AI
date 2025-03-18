import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SiteButton } from '@/components/ui/site-button';
import Image from 'next/image';
interface Coupon {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface CouponCardProps {
  coupon: Coupon;
}

export default function CouponCard({ coupon }: CouponCardProps) {
  return (
    <Card className="flex flex-col items-center p-6">
      <CardContent className="pt-4 px-0 w-full flex flex-col items-center">
        <Image
          src={coupon.avatar}
          alt={coupon.name}
          width={100}
          height={100}
          className="rounded-full aspect-square object-cover"
        />

        <h4 className="mt-3 font-mulish">{coupon.name}</h4>
        <p className="text-muted-foreground text-sm mb-8">{coupon.email}</p>

        <div className="w-full space-y-2.5">
          <SiteButton variant="solid" size="sm" className="w-full rounded-full">
            Manage
          </SiteButton>
          <SiteButton
            variant="solid"
            color="destructive"
            size="sm"
            className="w-full rounded-full"
          >
            Remove
          </SiteButton>
        </div>
      </CardContent>
    </Card>
  );
}
