// API response types
export interface IApiResponse<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export interface IStore {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
  organizationId: string | null;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  status: string;
  storeId: string;
  category: string;
  inventory: number;
  sku: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  role: string;
  status: string;
  lastLogin: string;
  createdAt: string;
}

// New interfaces for Bins module
export interface IOrganization {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
  metadata: string | null;
}

export interface IMaterial {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  rewardRuleId: string | null;
  rewardRule?: IRewardRule;
}

export interface IRewardRule {
  id: string;
  description: string | null;
  unitType: string;
  unit: number;
  point: number;
  createdAt: string;
  updatedAt: string;
}

export interface IBin {
  id: string;
  number: string;
  materialId: string;
  storeId: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  material?: IMaterial;
  store?: IStore;
}

// Define Coupon interface
export interface ICoupon {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
  couponType: string;
  dealType: string;
  isFeatured: boolean;
  discountAmount: number;
  pointsToRedeem: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string | null;
  organization?: IOrganization;
  redeemHistory?: IRedeemHistory[];
  favouriteCoupon?: IFavouriteCoupon[];
}

// Define RecycleHistory interface
export interface IRecycleHistory {
  id: string;
  userId: string;
  binId: string;
  points: number;
  mediaUrl: string | null;
  totalCount: number;
  createdAt: string;
  updatedAt: string;
  bin?: IBin;
  user?: IUser;
}

// Define RedeemHistory interface
export interface IRedeemHistory {
  id: string;
  couponId: string;
  userId: string;
  points: number;
  description: string | null;
  couponCode: string;
  createdAt: string;
  updatedAt: string;
  coupon?: ICoupon;
  user?: IUser;
}

// Define FavouriteCoupon interface
export interface IFavouriteCoupon {
  id: string;
  userId: string;
  couponId: string;
  createdAt: string;
  coupon?: ICoupon;
  user?: IUser;
}

export type Store = IStore;
export type Product = IProduct;
export type Bin = IBin;
export type Material = IMaterial;
export type RewardRule = IRewardRule;
export type Organization = IOrganization;
export type Coupon = ICoupon;
export type RecycleHistory = IRecycleHistory;
export type RedeemHistory = IRedeemHistory;
export type FavouriteCoupon = IFavouriteCoupon;
