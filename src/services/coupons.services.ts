import { ulid } from 'ulid';

export function generateSecureCouponCode(): string {
  const code = ulid();
  return `COUPON-${code}`;
}
