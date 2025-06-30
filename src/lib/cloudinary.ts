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
    folder: 'store/coupon-images',
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
        fetch_format: 'webp'
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
