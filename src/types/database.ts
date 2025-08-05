export interface BusinessSettings {
  id: string;
  business_name: string;
  phone: string;
  email: string;
  address: string;
  hours: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface ShedListing {
  id: string;
  title: string;
  description: string;
  material_type: string;
  color: string;
  size: string;
  shed_style: string;
  price: number;
  images: string[];
  specifications: Record<string, any>;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PastProject {
  id: string;
  title: string;
  description: string;
  project_type: string;
  images: string[];
  completion_date: string;
  location: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  project_type: string;
  is_featured: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteRequest {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  project_type: string;
  material_type: string;
  color: string;
  size: string;
  shed_style: string;
  description: string;
  budget_range: string;
  timeline: string;
  status: string;
  notes: string;
  custom_message: string;
  inspiration_images: string[];
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface HomeContent {
  id: string;
  section_name: string;
  title: string;
  subtitle: string;
  content: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoCarousel {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}