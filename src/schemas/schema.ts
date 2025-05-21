import { z } from 'zod';

export const storeSchema = z.object({
  name: z
    .string({
      required_error: 'Store name is required',
    })
    .min(2, 'Store name must be at least 2 characters')
    .max(100, 'Store name cannot exceed 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .nullable(),
  imageUrl: z
    .string()
    .url('Please provide a valid image URL')
    .max(2048, 'Image URL cannot exceed 2048 characters')
    .optional()
    .nullable(),
  address1: z
    .string({
      required_error: 'Address line 1 is required',
    })
    .min(5, 'Address line 1 must be at least 5 characters')
    .max(200, 'Address line 1 cannot exceed 200 characters')
    .trim(),
  address2: z
    .string()
    .max(200, 'Address line 2 cannot exceed 200 characters')
    .optional()
    .nullable()
    .transform((val) => val?.trim() || null),
  city: z
    .string({
      required_error: 'City is required',
    })
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City cannot exceed 100 characters')
    .trim(),
  state: z
    .string({
      required_error: 'State is required',
    })
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State cannot exceed 100 characters')
    .trim(),
  zip: z
    .string({
      required_error: 'ZIP code is required',
    })
    .min(5, 'ZIP code must be at least 5 characters')
    .max(20, 'ZIP code cannot exceed 20 characters')
    .regex(/^[0-9-]+$/, 'ZIP code must contain only numbers and hyphens')
    .trim(),
  country: z
    .string({
      required_error: 'Country is required',
    })
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country cannot exceed 100 characters')
    .trim(),
  lat: z
    .number({
      required_error: 'Latitude is required',
      invalid_type_error: 'Latitude must be a number',
    })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z
    .number({
      required_error: 'Longitude is required',
      invalid_type_error: 'Longitude must be a number',
    })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
});

export const storeUpdateSchema = storeSchema.partial();

export const rewardRuleSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
    })
    .min(1, 'Name cannot be empty')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  point: z
    .number({
      required_error: 'Points value is required',
      invalid_type_error: 'Points must be a number',
    })
    .int('Points must be a whole number')
    .min(1, 'Points must be at least 1')
    .max(1000000, 'Points cannot exceed 1,000,000'),
  unit: z
    .number({
      required_error: 'Unit value is required',
      invalid_type_error: 'Unit must be a number',
    })
    .positive('Unit must be a positive number')
    .min(0.01, 'Unit must be at least 0.01')
    .max(1000000, 'Unit cannot exceed 1,000,000'),
  unitType: z
    .string({
      required_error: 'Unit type is required',
    })
    .min(1, 'Unit type cannot be empty')
    .max(50, 'Unit type cannot exceed 50 characters')
    .trim(),
  description: z
    .string({
      invalid_type_error: 'Description must be text',
    })
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .nullable()
    .transform((val) => val?.trim() || null),
});

export const rewardRuleUpdateSchema = rewardRuleSchema.partial();

export const materialSchema = z.object({
  name: z
    .string({
      required_error: 'Material name is required',
    })
    .min(1, 'Material name cannot be empty')
    .max(100, 'Material name cannot exceed 100 characters')
    .trim(),
  description: z
    .string({
      invalid_type_error: 'Description must be text',
    })
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .nullable()
    .transform((val) => val?.trim() || null),
  rewardRuleId: z.string({
    required_error: 'Reward rule ID is required',
  }),
});

export const materialUpdateSchema = materialSchema.partial();

export const couponBaseSchema = z.object({
  name: z
    .string({
      required_error: 'Coupon name is required',
    })
    .min(1, 'Coupon name cannot be empty')
    .max(255, 'Coupon name cannot exceed 255 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .nullable(),
  imageUrl: z
    .string()
    .max(15000000, 'Image data cannot exceed 15MB when encoded') // ~10MB base64 encoded
    .refine(
      (val) => !val || val.startsWith('data:image/'),
      'Image must be a valid data URL starting with data:image/'
    )
    .optional()
    .nullable(),
  couponType: z.enum(['FIXED', 'PERCENTAGE']),
  dealType: z.enum(['NOPOINTS', 'POINTS']),
  isFeatured: z.boolean().default(false),
  discountAmount: z
    .number({
      required_error: 'Discount amount is required',
      invalid_type_error: 'Discount amount must be a number',
    })
    .int('Discount amount must be an integer')
    .min(0, 'Discount amount cannot be negative'),
  pointsToRedeem: z
    .number({
      required_error: 'Points to redeem is required',
      invalid_type_error: 'Points to redeem must be a number',
    })
    .int('Points to redeem must be an integer')
    .min(0, 'Points to redeem cannot be negative'),
  startDate: z
    .string({
      required_error: 'Start date is required',
      invalid_type_error: 'Start date must be a valid date',
    })
    .datetime({
      message: 'Start date must be a valid date',
    }),
  endDate: z
    .string({
      required_error: 'End date is required',
      invalid_type_error: 'End date must be a valid date',
    })
    .datetime({
      message: 'End date must be a valid date',
    }),
  organizationId: z
    .string()
    .uuid('Organization ID must be a valid UUID')
    .optional()
    .nullable(),
});

export const couponCreateSchema = couponBaseSchema.refine(
  (data) => {
    if (data.couponType === 'PERCENTAGE') {
      return data.discountAmount <= 100;
    }
    return true;
  },
  {
    path: ['discountAmount'],
    message: 'Discount amount must be less than 100',
  }
);

export const couponUpdateSchema = couponBaseSchema.partial().refine(
  (data) => {
    if (!data.discountAmount) {
      return true;
    }
    if (data.couponType === 'PERCENTAGE') {
      return data.discountAmount <= 100;
    }
    return true;
  },
  {
    path: ['discountAmount'],
    message: 'Discount amount must be less than 100',
  }
);

export const binSchema = z.object({
  number: z
    .string({
      required_error: 'Bin number is required',
      invalid_type_error: 'Bin number must be text',
    })
    .min(1, 'Bin number cannot be empty')
    .max(50, 'Bin number cannot exceed 50 characters')
    .trim(),
  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be text',
    })
    .min(1, 'Description cannot be empty')
    .max(500, 'Description cannot exceed 500 characters')
    .trim(),
  imageUrl: z
    .string({
      required_error: 'Image URL is required',
      invalid_type_error: 'Image URL must be text',
    })
    .url('Please provide a valid image URL')
    .max(2048, 'Image URL cannot exceed 2048 characters')
    .trim()
    .optional()
    .nullable(),
  materialId: z
    .string({
      required_error: 'Material ID is required',
      invalid_type_error: 'Material ID must be text',
    })
    .min(1, 'Material ID cannot be empty')
    .trim(),
  storeId: z
    .string({
      required_error: 'Store ID is required',
      invalid_type_error: 'Store ID must be text',
    })
    .min(1, 'Store ID cannot be empty')
    .trim(),
});

export const binUpdateSchema = binSchema.partial();

export const favouriteCouponSchema = z.object({
  couponId: z.string({
    required_error: 'Coupon ID is required',
    invalid_type_error: 'Coupon ID must be text',
  }),
});

export const recycleHistorySchema = z.object({
  binId: z.string({
    required_error: 'Bin ID is required',
    invalid_type_error: 'Bin ID must be text',
  }),
  totalCount: z.number({
    required_error: 'Total count is required',
    invalid_type_error: 'Total count must be a number',
  }),
  mediaUrl: z
    .string({
      required_error: 'Media URL is required',
      invalid_type_error: 'Media URL must be text',
    })
    .optional()
    .nullable(),
});

export const redeemHistorySchema = z.object({
  couponId: z.string({
    required_error: 'Coupon ID is required',
    invalid_type_error: 'Coupon ID must be text',
  }),
  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be text',
    })
    .min(1, 'Description cannot be empty')
    .max(500, 'Description cannot exceed 500 characters')
    .trim()
    .optional()
    .nullable(),
});
