-- Global settings table (palette, site config)
CREATE TABLE IF NOT EXISTS global_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

-- Public read (settings needed client-side for palette)
CREATE POLICY "Settings viewable by everyone" ON global_settings
  FOR SELECT USING (true);

-- Insert default palettes
INSERT INTO global_settings (key, value) VALUES
  ('palette_dark', '"berry-blaze"'::jsonb),
  ('palette_light', '"berry-blaze"'::jsonb)
ON CONFLICT (key) DO NOTHING;
