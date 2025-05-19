import { ApiService } from '../api-service';
import type { Organization } from '@/types';

export const organizationsApi = new ApiService<Organization>('/organizations');