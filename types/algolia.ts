export interface ImageMetadata {
  url: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  format?: string;
  size?: number; // in bytes
}

export interface AlgoliaRecord {
  objectID: string;
  title: string;
  model_name?: string;
  brand?: string;
  company?: string;
  price: number;
  ram?: number;
  battery?: number;
  screen?: number;
  screen_size?: number;
  storage?: number;
  processor?: string;
  year?: number;
  launched_year?: number;
  weight?: number;
  front_camera?: string;
  back_camera?: string;
  display_type?: string;
  // Image fields with metadata
  image_url?: string;
  image?: string;
  photo?: string;
  image_metadata?: ImageMetadata;
  images?: string[]; // Array of additional image URLs
  _tags?: string[];
  _searchableText?: string;
  [key: string]: any;
}
