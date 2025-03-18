import React from 'react'
import CouponCard from './coupon-card'

interface Coupon {
  id: number
  name: string
  email: string
  avatar: string
}

interface CouponsListProps {
  coupons: Coupon[]
}

export default function CouponsList({ coupons }: CouponsListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
      {coupons.map((coupon) => (
        <CouponCard key={coupon.id} coupon={coupon} />
      ))}
    </div>
  )
}
