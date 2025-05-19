import { z } from 'zod';

export const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  slug: z.string().nullable().optional(),
  logo: z.string().url('Invalid URL format').nullable().optional(),
  metadata: z.any().optional(),
});