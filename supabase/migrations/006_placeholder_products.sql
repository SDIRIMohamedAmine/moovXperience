-- ============================================
-- Placeholder products for Move Experience
-- ============================================
-- Run this AFTER creating a supplier account via the app.
-- Replace the supplier_id below with the actual UUID from auth.users.
--
-- Option A: Insert with a fixed UUID (create user with this UUID in Supabase dashboard)
-- Option B: Use the helper function at the bottom to assign to the first supplier

-- ============================================
-- STEP 1: Categories (if not already inserted)
-- ============================================
-- These slugs must match what the app uses. Adjust if needed.

INSERT INTO categories (id, name, slug) VALUES
  (uuid_generate_v4(), 'Chaises', 'chaises'),
  (uuid_generate_v4(), 'Tables', 'tables'),
  (uuid_generate_v4(), 'Mobilier lounge', 'lounge'),
  (uuid_generate_v4(), 'Bars & comptoirs', 'bars'),
  (uuid_generate_v4(), 'Éclairage', 'eclairage'),
  (uuid_generate_v4(), 'Décoration', 'decoration'),
  (uuid_generate_v4(), 'Textiles', 'textiles'),
  (uuid_generate_v4(), 'Audiovisuel', 'audio')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- STEP 2: Create a demo supplier profile
-- ============================================
-- This creates a placeholder auth user + profile.
-- Password: DemoSupplier2024!
-- You can change the email/password after.

DO $$
DECLARE
  v_supplier_id uuid;
  v_cat_chairs uuid;
  v_cat_tables uuid;
  v_cat_lounge uuid;
  v_cat_bars uuid;
  v_cat_lighting uuid;
  v_cat_decor uuid;
  v_cat_textiles uuid;
  v_cat_audio uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO v_cat_chairs FROM categories WHERE slug = 'chaises';
  SELECT id INTO v_cat_tables FROM categories WHERE slug = 'tables';
  SELECT id INTO v_cat_lounge FROM categories WHERE slug = 'lounge';
  SELECT id INTO v_cat_bars FROM categories WHERE slug = 'bars';
  SELECT id INTO v_cat_lighting FROM categories WHERE slug = 'eclairage';
  SELECT id INTO v_cat_decor FROM categories WHERE slug = 'decoration';
  SELECT id INTO v_cat_textiles FROM categories WHERE slug = 'textiles';
  SELECT id INTO v_cat_audio FROM categories WHERE slug = 'audio';

  -- Check if a supplier already exists, otherwise create one
  SELECT id INTO v_supplier_id FROM profiles WHERE role = 'supplier' LIMIT 1;

  IF v_supplier_id IS NULL THEN
    -- Create auth user (requires superuser or service role)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      uuid_generate_v4(),
      'demo@move-experience.tn',
      crypt('DemoSupplier2024!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}'
    )
    RETURNING id INTO v_supplier_id;

    -- Create profile
    INSERT INTO profiles (id, role, full_name, phone)
    VALUES (v_supplier_id, 'supplier', 'Move Experience Demo', '+216 71 000 000');
  END IF;

  -- ============================================
  -- STEP 3: Insert placeholder products
  -- ============================================

  -- CHAISES
  INSERT INTO products (supplier_id, category_id, name, description, price_per_day, deposit, stock, is_available, images, location) VALUES
  (v_supplier_id, v_cat_chairs,
    'Chaise Chiavari Dorée',
    'Chaise Chiavari élégante en finition dorée, idéale pour les mariages et galas. Structure aluminium robuste, coussin inclus. Hauteur totale 95cm, assise à 46cm.',
    12.00, 50.00, 200, true,
    ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=750&fit=crop'],
    'Tunis'),

  (v_supplier_id, v_cat_chairs,
    'Chaise Pliante Blanche',
    'Chaise pliante blanche en résine, légère et empilable. Parfaite pour les réceptions en extérieur. Résistante aux intempéries, facile à transporter.',
    5.00, 20.00, 300, true,
    ARRAY['https://images.unsplash.com/photo-1503602642458-232111445657?w=600&h=750&fit=crop'],
    'Tunis'),

  (v_supplier_id, v_cat_chairs,
    'Tabouret de Bar Acier',
    'Tabouret de bar moderne en acier brossé, assise rembourrée noir. Hauteur 75cm, pied central avec repose-pieds. Design contemporain pour cocktails et bars.',
    8.00, 30.00, 80, true,
    ARRAY['https://images.unsplash.com/photo-1503602642458-232111445657?w=600&h=750&fit=crop'],
    'Sousse'),

  -- TABLES
  (v_supplier_id, v_cat_tables,
    'Table Ronde 180cm',
    'Table ronde banquet 180cm de diamètre, hauteur 75cm. Plateau melamine blanc, piètement pliable. Accueille 10 convives confortablement. Idéale pour mariages et réceptions.',
    25.00, 100.00, 50, true,
    ARRAY['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&h=750&fit=crop'],
    'Tunis'),

  (v_supplier_id, v_cat_tables,
    'Table Cocktail Haute',
    'Table cocktail haute (110cm) en inox et verre trempé. Design élégant et moderne, idéale pour cocktail debout et événements corporate. Pliable pour transport facile.',
    18.00, 70.00, 40, true,
    ARRAY['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&h=750&fit=crop'],
    'Tunis'),

  (v_supplier_id, v_cat_tables,
    'Table Rectangulaire Banquet',
    'Table banquet rectangulaire 240x76cm, plateau melamine, piètement pliable robuste. Capacité 8-10 personnes. Parfaite pour les grands événements et conférences.',
    20.00, 80.00, 60, true,
    ARRAY['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&h=750&fit=crop'],
    'Sfax'),

  -- LOUNGE
  (v_supplier_id, v_cat_lounge,
    'Canapé Modulaire Gris',
    'Canapé modulaire en tissu gris anthracite, 3 modules. Configuration flexible en L ou en ligne. Idéal pour les espaces lounge et zones VIP. Housses lavables.',
    80.00, 300.00, 10, true,
    ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=750&fit=crop'],
    'Tunis'),

  (v_supplier_id, v_cat_lounge,
    'Fauteuil Lounge Blanc',
    'Fauteuil lounge design en cuir synthétique blanc. Forme enveloppante, structure en fibre de verre. Pièce maîtresse pour espaces VIP et événements haut de gamme.',
    45.00, 150.00, 15, true,
    ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=750&fit=crop'],
    'Tunis'),

  -- BARS
  (v_supplier_id, v_cat_bars,
    'Bar LED Lumineux',
    'Bar modulaire rétroéclairé LED avec changement de couleurs RGB. Dimensions 200x60x110cm. Effet wow garanti pour vos soirées et événements. Télécommande incluse.',
    120.00, 400.00, 8, true,
    ARRAY['https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=750&fit=crop'],
    'Tunis'),

  (v_supplier_id, v_cat_bars,
    'Comptoir d''Accueil Acrylic',
    'Comptoir d''accueil en acrylique translucide avec tablette intérieure éclairée. Design minimaliste et moderne. Dimensions 150x50x100cm. Parfait pour l''accueil de vos invités.',
    60.00, 200.00, 12, true,
    ARRAY['https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=750&fit=crop'],
    'Sousse'),

  -- ECLAIRAGE
  (v_supplier_id, v_cat_lighting,
    'Guirlande Lumineuse LED 20m',
    'Guirlande lumineuse LED 20 mètres, ampoules chaudes 2700K. Résistante aux intempéries (IP44). Parfaite pour créer une ambiance chaleureuse en extérieur. Kit complet avec fixation.',
    15.00, 50.00, 30, true,
    ARRAY['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=750&fit=crop'],
    'Tunis'),

  (v_supplier_id, v_cat_lighting,
    'Projecteur RGB LED',
    'Projecteur LED RGB 30W avec télécommande. Effets de couleurs, stroboscope, fade. Support trépied inclus. Idéal pour colorer vos événements et mettre en valeur votre décoration.',
    25.00, 80.00, 20, true,
    ARRAY['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=750&fit=crop'],
    'Tunis'),

  -- DECORATION
  (v_supplier_id, v_cat_decor,
    'Arche Florale Métal Doré',
    'Arche florale en métal doré, hauteur 2.5m, largeur 2m. Structure démontable et réutilisable. Base stable avec lest. Parfaite pour cérémonies, photobooths et entrées d''événement.',
    90.00, 300.00, 6, true,
    ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=750&fit=crop'],
    'Tunis'),

  (v_supplier_id, v_cat_decor,
    'Rideau de Lumière Chaud',
    'Rideau de lumière LED 3x2m, fil chaud 2700K. Créée un fond scintillant pour photo booth, scène ou mur de fond. Alimentation secteur, chaînable.',
    35.00, 100.00, 15, true,
    ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=750&fit=crop'],
    'Sousse'),

  -- TEXTILES
  (v_supplier_id, v_cat_textiles,
    'Nappe Blanche Satin 300cm',
    'Nappe en satin blanc de haute qualité, 300x150cm. Tombante élégante, tissu épais sans transparence. Lavée et repassée entre chaque location. Idéale pour tables rondes et rectangulaires.',
    8.00, 25.00, 100, true,
    ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=750&fit=crop'],
    'Tunis'),

  (v_supplier_id, v_cat_textiles,
    'Housses de Chaises Blanches',
    'Housses de chaises en extensible blanc, taille universelle. Transforme n''importe quelle chaise en assise élégante. Tissu extensible, lavable. Lot de 10.',
    3.00, 10.00, 500, true,
    ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=750&fit=crop'],
    'Tunis'),

  -- AUDIOVISUEL
  (v_supplier_id, v_cat_audio,
    'Écran Géant LED 3m',
    'Écran LED indoor 3x2m, pitch 3.9mm, luminosité 1200 nits. Contrôleur inclus, installation technique comprise. Résolution HD pour présentations, clips et visuels.',
    500.00, 2000.00, 3, true,
    ARRAY['https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=750&fit=crop'],
    'Tunis'),

  (v_supplier_id, v_cat_audio,
    'Sonorisation JBL 2000W',
    'Kit sonorisation JBL 2000W complet : 2 enceintes PRX 15", 2 subwoofers, table de mixage, câblage. Idéal pour concerts, mariages et événements jusqu''à 500 personnes. Technicien disponible.',
    200.00, 800.00, 5, true,
    ARRAY['https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=750&fit=crop'],
    'Tunis');

  RAISE NOTICE 'Inserted 18 placeholder products for supplier %', v_supplier_id;
END $$;
