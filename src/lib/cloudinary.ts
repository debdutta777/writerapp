import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dgvw0cops',
  api_key: '454663558645472',
  api_secret: 'agfVnuVN4HVH-NPdasVNaFIckRs',
});

/**
 * Uploads an image to Cloudinary
 * @param file The file to upload
 * @param folderPath The folder path to upload to
 * @returns The URL of the uploaded image
 */
export async function uploadImage(file: File, folderPath: string): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert buffer to base64
    const base64Data = buffer.toString('base64');
    const base64File = `data:${file.type};base64,${base64Data}`;
    
    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        base64File,
        {
          folder: folderPath,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
    
    return uploadResult.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
}

export default cloudinary; 