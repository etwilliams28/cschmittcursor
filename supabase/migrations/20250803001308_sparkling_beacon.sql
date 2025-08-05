/*
  # Initial Schema for C. Schmitt Custom Build and Renovation

  1. New Tables
    - `business_settings` - Stores business info (name, phone, email, hours, address)
    - `shed_listings` - Custom shed inventory with specifications and images
    - `past_projects` - Portfolio of completed work with images and descriptions
    - `reviews` - Customer testimonials and ratings
    - `blog_posts` - Blog content with WYSIWYG editor support
    - `quote_requests` - Customer quote submissions with specifications
    - `contact_submissions` - General contact form submissions
    - `home_content` - Editable home page content sections
    - `video_carousel` - Manages video content for home page

  2. Security
    - Enable RLS on all tables
    - Admin and public access policies
    - File upload policies for authenticated users

  3. Storage
    - Images bucket for project photos, shed images, blog images
    - Videos bucket for video carousel content
*/

-- Business Settings Table
CREATE TABLE IF NOT EXISTS business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL DEFAULT 'C. Schmitt Custom Build and Renovation',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  hours jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shed Listings Table
CREATE TABLE IF NOT EXISTS shed_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  material_type text NOT NULL,
  color text NOT NULL,
  size text NOT NULL,
  shed_style text NOT NULL,
  price decimal(10,2),
  images text[] DEFAULT '{}',
  specifications jsonb DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Past Projects Table
CREATE TABLE IF NOT EXISTS past_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  project_type text NOT NULL,
  images text[] DEFAULT '{}',
  completion_date date,
  location text DEFAULT '',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  project_type text DEFAULT '',
  is_featured boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text DEFAULT '',
  content text NOT NULL,
  featured_image text DEFAULT '',
  author text DEFAULT 'C. Schmitt',
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quote Requests Table
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  project_type text NOT NULL,
  material_type text DEFAULT '',
  color text DEFAULT '',
  size text DEFAULT '',
  shed_style text DEFAULT '',
  description text DEFAULT '',
  budget_range text DEFAULT '',
  timeline text DEFAULT '',
  status text DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  subject text DEFAULT '',
  message text NOT NULL,
  status text DEFAULT 'unread',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Home Content Table
CREATE TABLE IF NOT EXISTS home_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name text UNIQUE NOT NULL,
  title text DEFAULT '',
  subtitle text DEFAULT '',
  content text DEFAULT '',
  image_url text DEFAULT '',
  cta_text text DEFAULT '',
  cta_link text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Video Carousel Table
CREATE TABLE IF NOT EXISTS video_carousel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  video_url text NOT NULL,
  thumbnail_url text DEFAULT '',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shed_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE past_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_carousel ENABLE ROW LEVEL SECURITY;

-- Public read policies for content tables
CREATE POLICY "Public can read business settings"
  ON business_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read active shed listings"
  ON shed_listings FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public can read past projects"
  ON past_projects FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read approved reviews"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

CREATE POLICY "Public can read published blog posts"
  ON blog_posts FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Public can read active home content"
  ON home_content FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public can read active video carousel"
  ON video_carousel FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Public insert policies for forms
CREATE POLICY "Anyone can submit quote requests"
  ON quote_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can submit contact forms"
  ON contact_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin full access policies
CREATE POLICY "Authenticated users can manage all data"
  ON business_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage shed listings"
  ON shed_listings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage past projects"
  ON past_projects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage blog posts"
  ON blog_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read quote requests"
  ON quote_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update quote requests"
  ON quote_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read contact submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update contact submissions"
  ON contact_submissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage home content"
  ON home_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage video carousel"
  ON video_carousel FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default business settings
INSERT INTO business_settings (business_name, phone, email, address, hours) VALUES 
('C. Schmitt Custom Build and Renovation', '(519) 123-4567', 'info@cschmittbuilds.com', 'Ontario, Canada', 
'{"monday": "7:00 AM - 6:00 PM", "tuesday": "7:00 AM - 6:00 PM", "wednesday": "7:00 AM - 6:00 PM", "thursday": "7:00 AM - 6:00 PM", "friday": "7:00 AM - 6:00 PM", "saturday": "8:00 AM - 4:00 PM", "sunday": "Closed"}');

-- Insert default home content sections
INSERT INTO home_content (section_name, title, subtitle, content, cta_text, cta_link) VALUES 
('hero', 'Quality Craftsmanship You Can Trust', 'Custom Builds & Renovations in Ontario', 'From custom sheds and garages to home additions and exterior renovations, we bring your vision to life with exceptional quality and attention to detail.', 'Get Your Free Quote', '/contact'),
('services', 'What We Do', 'Professional Construction Services', 'We specialize in a wide range of construction and renovation services, delivering quality results that stand the test of time.', 'View Our Work', '/projects');

-- Insert sample shed listings
INSERT INTO shed_listings (title, description, material_type, color, size, shed_style, price, specifications, is_featured) VALUES 
('Premium Gable Shed 8x10', 'High-quality gable roof shed perfect for storage and organization', 'Wood', 'Natural', '8x10', 'Gable', 2500.00, '{"roof": "Gable", "doors": "Double", "windows": "2", "floor": "Plywood"}', true),
('Modern Lean-To 6x8', 'Space-efficient lean-to design ideal for smaller yards', 'Metal', 'Gray', '6x8', 'Lean-To', 1800.00, '{"roof": "Lean-To", "doors": "Single", "windows": "1", "floor": "Concrete Pad"}', true),
('Classic Barn Style 10x12', 'Traditional barn-style shed with extra headroom', 'Wood', 'Red', '10x12', 'Barn', 3200.00, '{"roof": "Gambrel", "doors": "Double Wide", "windows": "3", "floor": "Treated Plywood"}', true);

-- Insert sample past projects
INSERT INTO past_projects (title, description, project_type, completion_date, location, is_featured) VALUES 
('Custom 3-Car Garage Addition', 'Complete garage addition with workshop space and storage loft', 'Garage', '2024-08-15', 'London, ON', true),
('Exterior Home Renovation', 'Full siding, soffit, fascia, and eavestrough replacement', 'Exterior Renovation', '2024-07-20', 'Kitchener, ON', true),
('Custom Workshop Shed', 'Large workshop shed with electrical and concrete floor', 'Custom Shed', '2024-06-10', 'Cambridge, ON', true);

-- Insert sample reviews
INSERT INTO reviews (customer_name, rating, review_text, project_type, is_featured, is_approved) VALUES 
('Sarah Johnson', 5, 'Outstanding work on our garage addition. Chris and his team were professional, timely, and the quality exceeded our expectations.', 'Garage Addition', true, true),
('Mike Thompson', 5, 'Had our entire exterior renovated including new siding and eavestroughs. Looks amazing and great attention to detail.', 'Exterior Renovation', true, true),
('Lisa Chen', 5, 'Custom shed build was exactly what we wanted. Great communication throughout the project and fair pricing.', 'Custom Shed', true, true);