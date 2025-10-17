import { createClientClient } from '../server/supabase';

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
}

export async function getOptimizedImageUrl(
  imageUrl: string,
  options: ImageOptions = {}
): Promise<string> {
  // If using a service like Cloudinary or Imgix
  if (imageUrl.includes('cloudinary') || imageUrl.includes('imgix')) {
    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    if (options.fit) params.set('fit', options.fit);
    
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}${params.toString()}`;
  }
  
  // For Supabase storage, use their image transformation API
  if (imageUrl.includes('supabase.co/storage')) {
    const params = new URLSearchParams();
    
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.quality) params.set('quality', options.quality.toString());
    if (options.format) params.set('format', options.format);
    
    return `${imageUrl}?${params.toString()}`;
  }
  
  // Fallback to original image
  return imageUrl;
}