import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const Status = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE"
} as const;
export type Status = (typeof Status)[keyof typeof Status];
export const CouponType = {
    FIXED: "FIXED",
    PERCENTAGE: "PERCENTAGE"
} as const;
export type CouponType = (typeof CouponType)[keyof typeof CouponType];
export type Account = {
    id: string;
    accountId: string;
    providerId: string;
    userId: string;
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
    accessTokenExpiresAt: Timestamp | null;
    refreshTokenExpiresAt: Timestamp | null;
    scope: string | null;
    password: string | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};
export type Bin = {
    id: string;
    number: string;
    typeOfMaterialId: string;
    storeId: string;
    description: string | null;
    imageUrl: string;
    status: Generated<Status>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    userId: string;
    organizationId: string;
    address1: string;
    address2: string | null;
    city: string;
    state: string;
    zip: string;
    country: string;
};
export type Coupon = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string;
    status: Generated<Status>;
    couponType: CouponType;
    couponCode: string;
    pointsToRedeem: number;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    userId: string;
    organizationId: string;
};
export type Invitation = {
    id: string;
    organizationId: string;
    email: string;
    role: string | null;
    status: string;
    expiresAt: Timestamp;
    inviterId: string;
};
export type Material = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string;
    status: Generated<Status>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    userId: string;
    organizationId: string;
};
export type Member = {
    id: string;
    organizationId: string;
    userId: string;
    role: string;
    createdAt: Timestamp;
};
export type Organization = {
    id: string;
    name: string;
    slug: string | null;
    logo: string | null;
    createdAt: Timestamp;
    metadata: string | null;
};
export type Points = {
    id: string;
    userId: string;
    points: number;
    description: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Session = {
    id: string;
    expiresAt: Timestamp;
    token: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
    impersonatedBy: string | null;
    activeOrganizationId: string | null;
};
export type Store = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string;
    status: Generated<Status>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    userId: string;
    organizationId: string;
};
export type Test = {
    id: Generated<number>;
};
export type User = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    role: string | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Timestamp | null;
    currentPoints: Generated<number>;
};
export type Verification = {
    id: string;
    identifier: string;
    value: string;
    expiresAt: Timestamp;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
};
export type DB = {
    account: Account;
    Bin: Bin;
    Coupon: Coupon;
    invitation: Invitation;
    Material: Material;
    member: Member;
    organization: Organization;
    Points: Points;
    session: Session;
    Store: Store;
    Test: Test;
    user: User;
    verification: Verification;
};
