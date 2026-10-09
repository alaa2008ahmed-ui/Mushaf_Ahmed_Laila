import { ChatAttachment } from '../../services/communityService';

/**
 * Compress an image file to keep Firestore payload well under limits (~150-350KB)
 */
export const compressImageFile = async (
  file: File,
  maxDim = 1200,
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Read any file as a DataURL
 */
export const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Convert a File object into a ChatAttachment
 */
export const processFileForAttachment = async (file: File): Promise<ChatAttachment> => {
  const mime = file.type || '';
  const isImage = mime.startsWith('image/');
  const isVideo = mime.startsWith('video/');

  let type: 'image' | 'video' | 'file' = 'file';
  let url = '';

  if (isImage) {
    type = 'image';
    url = await compressImageFile(file);
  } else if (isVideo) {
    type = 'video';
    url = await readFileAsDataUrl(file);
  } else {
    type = 'file';
    url = await readFileAsDataUrl(file);
  }

  return {
    type,
    url,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type
  };
};
