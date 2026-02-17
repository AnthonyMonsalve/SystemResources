/**
 * Compress an image file to a maximum size while maintaining aspect ratio
 * @param file - The image file to compress
 * @param maxWidthOrHeight - Maximum width or height in pixels (default: 1200)
 * @param quality - JPEG quality from 0 to 1 (default: 0.8)
 * @returns Compressed image as a Blob
 */
export async function compressImage(
  file: File,
  maxWidthOrHeight: number = 1200,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = (height * maxWidthOrHeight) / width;
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = (width * maxWidthOrHeight) / height;
            height = maxWidthOrHeight;
          }
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Could not load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images
 * @param files - Array of image files
 * @param maxWidthOrHeight - Maximum width or height in pixels
 * @param quality - JPEG quality from 0 to 1
 * @returns Array of compressed images as Blobs with original filenames
 */
export async function compressImages(
  files: File[],
  maxWidthOrHeight: number = 1200,
  quality: number = 0.8
): Promise<{ blob: Blob; filename: string }[]> {
  const compressionPromises = files.map(async (file) => {
    const blob = await compressImage(file, maxWidthOrHeight, quality);
    // Keep original filename but ensure .jpg extension
    const filename = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
    return { blob, filename };
  });

  return Promise.all(compressionPromises);
}

/**
 * Get the size of a file or blob in KB
 */
export function getFileSizeKB(file: File | Blob): number {
  return Math.round(file.size / 1024);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
