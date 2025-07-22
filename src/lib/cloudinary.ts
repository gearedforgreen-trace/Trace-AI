import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadCouponImageToCloudinary(
  imagePath: string,
  publicId: string
): Promise<{
  public_id: string;
  original_url: string;
}> {
  const options = {
    folder: 'coupon-images',
    public_id: publicId,
    overwrite: true,
    use_filename: true,
    format: 'webp',
    transformation: [
      {
        width: 600,
        height: 300,
        crop: 'fill',
        quality: 'auto:eco',
        fetch_format: 'webp',
      },
    ],
  };

  // Pass the raw imagePath straight to Cloudinary
  const result = await cloudinary.uploader.upload(imagePath, options);

  return {
    public_id: result.public_id,
    original_url: result.secure_url,
  };
}

export async function uploadAnalyzeMaterialImageToCloudinary(
  imagePath: string,
  publicId?: string
): Promise<{
  public_id: string;
  fixed_size_url: string;
} | null> {
  try {
    const options = {
      folder: 'analyze-material-images',
      public_id: publicId,
      overwrite: true,
      use_filename: true,
      format: 'webp',
      transformation: [
        {
          width: 800,
          height: 450,
          crop: 'fill', // Resize and crop to exactly 800x450
          quality: 'auto:eco', // Optimize quality for smaller size
          fetch_format: 'webp', // Ensure WebP format for efficiency
        },
      ],
    };

    const result = await cloudinary.uploader.upload(imagePath, options);

    return {
      public_id: result.public_id,
      fixed_size_url: result.secure_url, // URL of resized & cropped image
    };
  } catch (error) {
    console.log('Cloudinary upload failed:', error);
    return null;
  }
}

export async function deleteImageFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.log('Cloudinary delete failed:', error);
    return false;
  }
}
