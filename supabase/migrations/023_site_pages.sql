-- Site pages (about, etc.) — editable content
CREATE TABLE IF NOT EXISTS site_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  lang text NOT NULL DEFAULT 'fr',
  title text,
  subtitle text,
  tag text,
  sections jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(slug, lang)
);

ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pages viewable by everyone" ON site_pages
  FOR SELECT USING (true);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  lang text NOT NULL DEFAULT 'fr',
  title text NOT NULL,
  excerpt text,
  body text,
  cover_image text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts viewable by everyone" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_lang ON blog_posts(lang);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_site_pages_slug_lang ON site_pages(slug, lang);
