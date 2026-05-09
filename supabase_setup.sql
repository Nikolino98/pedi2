-- Setup for Pedi2 (NPM App) on Supabase

-- 1. Tables

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Extra Groups
CREATE TABLE extra_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  multi BOOLEAN DEFAULT false NOT NULL,
  required BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Extra Options
CREATE TABLE extra_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES extra_groups(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product <-> Extra Group (Many-to-Many)
CREATE TABLE product_extra_groups (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES extra_groups(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (product_id, group_id)
);

-- Category <-> Extra Group (Many-to-Many)
CREATE TABLE category_extra_groups (
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES extra_groups(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (category_id, group_id)
);

-- Payment Info (Single row table)
CREATE TABLE payment_info (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- Ensure only one row
  alias TEXT,
  cvu TEXT,
  account_name TEXT,
  whatsapp TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Storage Setup (Instructions)
-- You must create a public bucket named 'products' in Supabase Storage.

-- 3. Row Level Security (RLS)
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE extra_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE extra_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_extra_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_extra_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_info ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on extra_groups" ON extra_groups FOR SELECT USING (true);
CREATE POLICY "Allow public read access on extra_options" ON extra_options FOR SELECT USING (true);
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access on product_extra_groups" ON product_extra_groups FOR SELECT USING (true);
CREATE POLICY "Allow public read access on category_extra_groups" ON category_extra_groups FOR SELECT USING (true);
CREATE POLICY "Allow public read access on payment_info" ON payment_info FOR SELECT USING (true);

-- Create policies for authenticated users (admin) to manage data
-- Note: For simplicity, we use 'true' for now, but you should restrict this to your admin user/role.
CREATE POLICY "Allow all access for admin on categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all access for admin on extra_groups" ON extra_groups FOR ALL USING (true);
CREATE POLICY "Allow all access for admin on extra_options" ON extra_options FOR ALL USING (true);
CREATE POLICY "Allow all access for admin on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all access for admin on product_extra_groups" ON product_extra_groups FOR ALL USING (true);
CREATE POLICY "Allow all access for admin on category_extra_groups" ON category_extra_groups FOR ALL USING (true);
CREATE POLICY "Allow all access for admin on payment_info" ON payment_info FOR ALL USING (true);
