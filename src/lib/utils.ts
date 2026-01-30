import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PmVishwakarmaFormValues } from "./schema";


/**
 * Compresses an image data URL.
 * @param dataUrl The data URL of the image to compress.
 * @param fileType The MIME type of the original file (e.g., 'image/jpeg').
 * @param quality The quality of the compressed image (0 to 1).
 * @returns A promise that resolves with the compressed image data URL.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function mapArtisanDataToForm(artisanData: any): Partial<PmVishwakarmaFormValues> {
  if (!artisanData) {
    return {};
  }
  
  return {
    state: artisanData.address?.state,
    district: artisanData.address?.district,
    subDistrict: artisanData.address?.subDistrict,
    block: artisanData.address?.block,
    village: artisanData.address?.village,
    artisanName: artisanData.name,
    gender: artisanData.gender,
    category: artisanData.category,
    artisanType: artisanData.artisanType,
    aadhaarNumber: artisanData.aadhaarNumber,
    bankName: artisanData.bank?.name,
    ifscCode: artisanData.bank?.ifsc,
    accountNumber: artisanData.bank?.accountNumber,
  };
}

export const fileToDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const compressImage = (dataUrl: string, fileType?: string, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1024;
            const MAX_HEIGHT = 1024;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Failed to get canvas context'));
            }
            ctx.drawImage(img, 0, 0, width, height);

            // Determine the output file type
            let outputFileType = 'image/jpeg'; // Default to JPEG
            if (fileType && (fileType === 'image/png' || fileType === 'image/webp')) {
                outputFileType = fileType;
            }
            
            const compressedDataUrl = canvas.toDataURL(outputFileType, quality);
            resolve(compressedDataUrl);
        };
        img.onerror = (error) => {
            reject(error);
        }
        img.src = dataUrl;
    });
};

