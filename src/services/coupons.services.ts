export function generateSecureCouponCode(length = 20): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += charset[bytes[i] % charset.length];
  }
  return `COUPON-${code}`;
}
