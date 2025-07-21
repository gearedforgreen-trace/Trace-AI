import { ApiService } from '@/lib/api/api-service';

// User interface
export interface Recycle {
  id: string;
  userId: string;
  binId: string;
  points: number;
  mediaUrl: string;
  totalCount: number;
  createdAt: Date;
  updatedAt: Date;
  bin: {
    id: string;
    number: string;
    materialId: string;
    storeId: string;
    description: string;
    imageUrl: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    material: {
      id: string;
      name: string;
      description: string;
      createdAt: Date;
      updatedAt: Date;
      rewardRuleId: string;
    };
    store: {
      id: string;
      name: string;
      address1: string;
      address2: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  };
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    displayUsername: string;
    image: string | null;
    banned: boolean;
    role: string;
    status: string;
    emailVerified: boolean;
    username: string;
    address: string;
    postalCode: string;
  };
}

export interface RecycleFilterParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchMaterial?: string;
  userId?: string;
  materialId?: string;
  storeId?: string;
  binId?: string;
}

export class RecyclesApiService extends ApiService<Recycle> {
  constructor() {
    super('recycles');
  }

  // Get single user by ID
  async getRecycles(filters: RecycleFilterParams = {}): Promise<Recycle[]> {
    try {
      const response = await this.request<{ data: Recycle[] }>(
        'GET',
        `/`,
        filters
      );
      return response.data;
    } catch (error) {
      console.error('Error in getRecycles:', error);
      throw error;
    }
  }
}
