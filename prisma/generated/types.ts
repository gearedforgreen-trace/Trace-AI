import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const StoreStatus = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE"
} as const;
export type StoreStatus = (typeof StoreStatus)[keyof typeof StoreStatus];
export const BinStatus = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE"
} as const;
export type BinStatus = (typeof BinStatus)[keyof typeof BinStatus];
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
export const DealType = {
    NOPOINTS: "NOPOINTS",
    POINTS: "POINTS"
} as const;
export type DealType = (typeof DealType)[keyof typeof DealType];
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
    id: Generated<string>;
    number: string;
    materialId: string;
    storeId: string;
    description: string | null;
    imageUrl: string | null;
    status: Generated<BinStatus>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type Coupon = {
    id: Generated<string>;
    name: string;
    description: string | null;
    imageUrl: string;
    status: Generated<Status>;
    couponType: CouponType;
    dealType: DealType;
    isFeatured: boolean;
    couponCode: string;
    pointsToRedeem: number;
    startDate: Timestamp;
    endDate: Timestamp;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    organizationId: string;
};
export type FavoriteCouponList = {
    id: Generated<string>;
    userId: string;
    couponId: string;
    createdAt: Generated<Timestamp>;
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
    id: Generated<string>;
    name: string;
    description: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
    rewardRuleId: string | null;
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
export type RecycleHistory = {
    id: string;
    userId: string;
    points: number;
    mediaUrl: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type RedeemHistory = {
    id: string;
    couponId: string;
    userId: string;
    points: number;
    description: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type RewardRules = {
    id: Generated<string>;
    description: string | null;
    unitType: string;
    unit: number;
    point: number;
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
    id: Generated<string>;
    name: string;
    description: string | null;
    imageUrl: string | null;
    status: Generated<StoreStatus>;
    organizationId: string | null;
    address1: string;
    address2: string | null;
    city: string;
    state: string;
    zip: string;
    country: string;
    lat: number;
    lng: number;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
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
    username: string | null;
    displayUsername: string | null;
    phoneNumber: string | null;
    address: string | null;
    postalCode: string | null;
    status: string;
    state: string | null;
};
export type UserTotalPoint = {
    id: Generated<string>;
    userId: string;
    totalPoints: Generated<number>;
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
    bin: Bin;
    coupon: Coupon;
    favorite_coupon_list: FavoriteCouponList;
    invitation: Invitation;
    material: Material;
    member: Member;
    organization: Organization;
    RecycleHistory: RecycleHistory;
    RedeemHistory: RedeemHistory;
    reward_rules: RewardRules;
    session: Session;
    store: Store;
    user: User;
    user_total_point: UserTotalPoint;
    verification: Verification;
};
