-- ============================================
-- Phase 5: Simplify roles + demand system
-- ============================================
-- Everyone is client, only admin is special
-- Remove payment, add demand/request system
-- New categories: gamification, marketing, event materials, etc.
-- Flexible pricing: fixed, negotiable, suggestion

-- STEP 1: Add pricing_type to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS pricing_type text NOT NULL DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'negotiable', 'suggestion'));

-- STEP 2: Update categories to new ones
DELETE FROM products;
DELETE FROM categories;

INSERT INTO categories (id, name, slug) VALUES
  (uuid_generate_v4(), 'Gamification Interactive', 'gamification-interactive'),
  (uuid_generate_v4(), 'Marketing & Activation', 'marketing-activation'),
  (uuid_generate_v4(), 'Matériel Événementiel', 'materiel-evenementiel'),
  (uuid_generate_v4(), 'Photo & Vidéo', 'photo-video'),
  (uuid_generate_v4(), 'Son & Éclairage', 'son-eclairage'),
  (uuid_generate_v4(), 'Décoration & Mobilier', 'decoration-mobilier'),
  (uuid_generate_v4(), 'Animation & Spectacle', 'animation-spectacle'),
  (uuid_generate_v4(), 'Traiteur & Restauration', 'traiteur-restauration')
ON CONFLICT (slug) DO NOTHING;

-- STEP 3: Insert demo products with new categories and pricing types
DO $$
DECLARE
  v_admin_id uuid;
  v_cat_gaming uuid;
  v_cat_marketing uuid;
  v_cat_materiel uuid;
  v_cat_photo uuid;
  v_cat_son uuid;
  v_cat_deco uuid;
  v_cat_anim uuid;
  v_cat_traiteur uuid;
BEGIN
  SELECT id INTO v_cat_gaming FROM categories WHERE slug = 'gamification-interactive';
  SELECT id INTO v_cat_marketing FROM categories WHERE slug = 'marketing-activation';
  SELECT id INTO v_cat_materiel FROM categories WHERE slug = 'materiel-evenementiel';
  SELECT id INTO v_cat_photo FROM categories WHERE slug = 'photo-video';
  SELECT id INTO v_cat_son FROM categories WHERE slug = 'son-eclairage';
  SELECT id INTO v_cat_deco FROM categories WHERE slug = 'decoration-mobilial';
  SELECT id INTO v_cat_anim FROM categories WHERE slug = 'animation-spectacle';
  SELECT id INTO v_cat_traiteur FROM categories WHERE slug = 'traiteur-restauration';

  -- Get or create admin user
  SELECT id INTO v_admin_id FROM profiles WHERE role = 'admin' LIMIT 1;

  IF v_admin_id IS NULL THEN
    -- Try to get any existing user
    SELECT id INTO v_admin_id FROM profiles LIMIT 1;
    IF v_admin_id IS NOT NULL THEN
      UPDATE profiles SET role = 'admin' WHERE id = v_admin_id;
    END IF;
  END IF;

  IF v_admin_id IS NOT NULL THEN
    -- Gamification Interactive
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, video_url, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_gaming, 'Quiz IA Projection', 'Jeu de quiz projeté contrôlé par les gestes du public. Questions personnalisables, scoring en temps réel. Jusqu''à 100 participants.', 600.00, NULL, 0, 2, true, ARRAY['https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'fixed', '[]', 1),
    (v_admin_id, v_cat_gaming, 'Mur Interactif LED 3m', 'Écran LED géant réactif au geste. Contenu brandé en temps réel, effets interactifs personnalisables.', 800.00, NULL, 0, 2, true, ARRAY['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'negotiable', '[]', 1),
    (v_admin_id, v_cat_gaming, 'Bike Interactif Brandé', 'Vélo générateur connecté à un écran interactif. Animation originale pour salons et événements.', 350.00, NULL, 0, 4, true, ARRAY['https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'fixed', '[]', 1),
    (v_admin_id, v_cat_gaming, 'Borne Sondage Smart', 'Borne de feedback client temps réel avec dashboard cloud. Design moderne et compact.', 200.00, NULL, 0, 6, true, ARRAY['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'fixed', '[]', 1);

    -- Marketing & Activation
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, video_url, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_marketing, 'Photobooth 360', 'Plateforme rotative 360° avec caméra HD. Impressions instantanées, partage réseaux sociaux. Inclut animateur.', 450.00, NULL, 0, 3, true, ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'fixed', '[]', 1),
    (v_admin_id, v_cat_marketing, 'Kiosque Photo Instantané', 'Cabine photo compacte avec impression instantanée. Filtres beauté, stickers AR, partage direct.', 300.00, NULL, 0, 5, true, ARRAY['https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'fixed', '[]', 1),
    (v_admin_id, v_cat_marketing, 'Totem Interactif Brandé', 'Totem tactile 55 pouces pour navigation interactive. Branding complet, contenu personnalisable.', 250.00, NULL, 0, 4, true, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'negotiable', '[]', 1);

    -- Matériel Événementiel
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, video_url, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_materiel, 'Chaises Design (x50)', 'Lot de 50 chaises design contemporain. Confortables et élégantes pour vos événements.', 150.00, NULL, 0, 10, true, ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'fixed', '[]', 1),
    (v_admin_id, v_cat_materiel, 'Tables Cocktail (x20)', 'Lot de 20 tables cocktail hautes. Design moderne, robustes et élégantes.', 120.00, NULL, 0, 8, true, ARRAY['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'fixed', '[]', 1),
    (v_admin_id, v_cat_materiel, 'Tente Modulaire 6x6m', 'Tente modulaire pour événements extérieurs. Structure aluminium, toile imperméable.', 400.00, NULL, 0, 3, true, ARRAY['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'negotiable', '[]', 1);

    -- Photo & Vidéo
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, video_url, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_photo, 'Drone DJI Mavic 3', 'Drone professionnel pour prise de vue aérienne. 4K/120fps, 43min d''autonomie. Opérateur inclus.', 350.00, NULL, 0, 2, true, ARRAY['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'suggestion', '[]', 1),
    (v_admin_id, v_cat_photo, 'Caméra Streaming Multi-angle', 'Kit de 3 caméras HD pour streaming live. Inclut mélangeur et encodeur.', 500.00, NULL, 0, 2, true, ARRAY['https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'suggestion', '[]', 1);

    -- Son & Éclairage
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, video_url, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_son, 'Système Son JBL 5000W', 'Enceintes JBL professionnelles 5000W. Idéal pour événements de 200 à 500 personnes.', 600.00, NULL, 0, 3, true, ARRAY['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'fixed', '[]', 1),
    (v_admin_id, v_cat_son, 'Pack Éclairage LED Complet', '20 spots LED RGB + console DMX + trépieds. Programmation lumière incluse.', 450.00, NULL, 0, 4, true, ARRAY['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'fixed', '[]', 1);

    -- Décoration & Mobilier
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, video_url, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_deco, 'Arche Florale Géante', 'Arche décorative en fleurs artificielles. 3m de haut, personnalisable couleurs.', 200.00, NULL, 0, 3, true, ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'suggestion', '[]', 1),
    (v_admin_id, v_cat_deco, 'Mobilier Lounge VIP', 'Canapés, fauteuils et tables basses design. Ambiance lounge premium pour vos événements.', 500.00, NULL, 0, 5, true, ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'negotiable', '[]', 1);

    -- Animation & Spectacle
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, video_url, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_anim, 'DJ Set Professionnel', 'Équipement DJ complet + DJ expérimenté. Playlist personnalisable, son et lumières.', 800.00, NULL, 0, 3, true, ARRAY['https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'suggestion', '[]', 1),
    (v_admin_id, v_cat_anim, 'Spectacle Feu & Acrobatie', 'Spectacle de feu et acrobaties pour clôturer vos événements. Durée 30min.', 1200.00, NULL, 0, 1, true, ARRAY['https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'suggestion', '[]', 1);

    -- Traiteur & Restauration
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, video_url, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_traiteur, 'Food Truck Gastronomique', 'Food truck avec cuisine ouverte. Menu personnalisable de 50 à 300 couverts.', 1500.00, NULL, 0, 2, true, ARRAY['https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'suggestion', '[]', 1),
    (v_admin_id, v_cat_traiteur, 'Bar à Cocktails Mobile', 'Bar mobile avec bartender professionnel. Carte cocktails personnalisable. 100 personnes.', 700.00, NULL, 0, 2, true, ARRAY['https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=750&fit=crop'], NULL, 'Tunis', 'rental', 'suggestion', '[]', 1);

    RAISE NOTICE 'Inserted demo products for admin %', v_admin_id;
  END IF;
END $$;

-- STEP 4: Add index on pricing_type
CREATE INDEX IF NOT EXISTS idx_products_pricing_type ON products(pricing_type);
