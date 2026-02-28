-- ===== TOYKING SUPABASE DATABASE SCHEMA =====

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    age TEXT NOT NULL DEFAULT '+3 anos',
    image_url TEXT DEFAULT '',
    badge TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active',
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BANNERS TABLE
CREATE TABLE IF NOT EXISTS banners (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    image_mobile_url TEXT DEFAULT '',
    link TEXT DEFAULT 'produtos.html',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MANUALS TABLE
CREATE TABLE IF NOT EXISTS manuals (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    product_code TEXT DEFAULT '',
    has_manual BOOLEAN DEFAULT FALSE,
    has_video BOOLEAN DEFAULT FALSE,
    manual_url TEXT DEFAULT '',
    video_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== ENABLE ROW LEVEL SECURITY =====
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES (Public Read, Authenticated Write) =====

-- Products: anyone can read
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Public delete products" ON products FOR DELETE USING (true);

-- Banners: anyone can read
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (true);
CREATE POLICY "Public insert banners" ON banners FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update banners" ON banners FOR UPDATE USING (true);
CREATE POLICY "Public delete banners" ON banners FOR DELETE USING (true);

-- Categories: anyone can read
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Public delete categories" ON categories FOR DELETE USING (true);

-- Manuals: anyone can read
CREATE POLICY "Public read manuals" ON manuals FOR SELECT USING (true);
CREATE POLICY "Public insert manuals" ON manuals FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update manuals" ON manuals FOR UPDATE USING (true);
CREATE POLICY "Public delete manuals" ON manuals FOR DELETE USING (true);

-- Settings: anyone can read
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public insert settings" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update settings" ON settings FOR UPDATE USING (true);
CREATE POLICY "Public delete settings" ON settings FOR DELETE USING (true);

-- ===== INSERT DEFAULT DATA =====

-- Default Categories
INSERT INTO categories (name, sort_order) VALUES
    ('Encartelados', 1),
    ('Display', 2),
    ('Didáticos', 3),
    ('Brinquedos a Pilha', 4),
    ('Verão', 5),
    ('Patinetes', 6)
ON CONFLICT (name) DO NOTHING;

-- Default Settings
INSERT INTO settings (key, value) VALUES
    ('site_name', 'ToyKing'),
    ('primary_color', '#1A8BD6'),
    ('phone', '(11) 3000-0000'),
    ('email', 'contato@toyking.com.br'),
    ('instagram', ''),
    ('facebook', ''),
    ('youtube', '')
ON CONFLICT (key) DO NOTHING;
