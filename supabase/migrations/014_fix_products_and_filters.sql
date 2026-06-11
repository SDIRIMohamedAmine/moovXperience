-- ============================================
-- Fix products: mode=both, more products, availability
-- ============================================

-- Update all existing products to have mode='both' so clients can choose rent or buy
UPDATE products SET mode = 'both' WHERE mode = 'rental';

-- Add price_purchase for products that don't have it
UPDATE products SET price_purchase = price_per_day * 15 WHERE price_purchase IS NULL;

-- Update some products to have different pricing types for variety
UPDATE products SET pricing_type = 'negotiable' WHERE name IN ('Mur Interactif LED 3m', 'Totem Interactif Brandé', 'Mobilier Lounge VIP');
UPDATE products SET pricing_type = 'suggestion' WHERE name IN ('Drone DJI Mavic 3', 'Caméra Streaming Multi-angle', 'Spectacle Feu & Acrobatie', 'DJ Set Professionnel', 'Food Truck Gastronomique', 'Bar à Cocktails Mobile');

-- Add more products inspired by Interactive Party catalog
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
  SELECT id INTO v_admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  SELECT id INTO v_cat_gaming FROM categories WHERE slug = 'gamification-interactive';
  SELECT id INTO v_cat_marketing FROM categories WHERE slug = 'marketing-activation';
  SELECT id INTO v_cat_materiel FROM categories WHERE slug = 'materiel-evenementiel';
  SELECT id INTO v_cat_photo FROM categories WHERE slug = 'photo-video';
  SELECT id INTO v_cat_son FROM categories WHERE slug = 'son-eclairage';
  SELECT id INTO v_cat_deco FROM categories WHERE slug = 'decoration-mobilier';
  SELECT id INTO v_cat_anim FROM categories WHERE slug = 'animation-spectacle';
  SELECT id INTO v_cat_traiteur FROM categories WHERE slug = 'traiteur-restauration';

  IF v_admin_id IS NOT NULL THEN
    -- More Gamification Interactive products
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_gaming, 'Réalité Virtuelle Immersive', 'Casques VR Meta Quest 3 avec contenu personnalisé. Expériences immersives pour 1 à 10 utilisateurs simultanés.', 800.00, 12000.00, 0, 5, true, ARRAY['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&h=750&fit=crop'], 'Tunis', 'both', 'fixed', '[]', 1),
    (v_admin_id, v_cat_gaming, 'Simulateur de Course', 'Simulateur professionnel avec écran incurvé 49" et retour de force. Parfait pour activations corporate.', 600.00, 9500.00, 0, 2, true, ARRAY['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=750&fit=crop'], 'Tunis', 'both', 'negotiable', '[]', 1),
    (v_admin_id, v_cat_gaming, 'Borne Arcade Rétro', 'Borne arcade multi-jeux avec 5000+ classiques. Design rétro LED, 2 joueurs. Parfait pour animations nostalgiques.', 150.00, 2500.00, 0, 8, true, ARRAY['https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=750&fit=crop'], 'Tunis', 'both', 'fixed', '[]', 1),
    (v_admin_id, v_cat_gaming, 'Table Tactile Interactive', 'Table tactile 55" pour jeux interactifs, sondages, et navigation. Parfait pour salons et espaces d''accueil.', 400.00, 7000.00, 0, 3, true, ARRAY['https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=750&fit=crop'], 'Tunis', 'both', 'fixed', '[]', 1);

    -- More Marketing & Activation products
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_marketing, 'Stand d''Exposition Modulaire', 'Stand modulaire 3x3m avec panneaux graphiques, éclairage LED et comptoir. Montage inclus.', 500.00, 8000.00, 0, 4, true, ARRAY['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=750&fit=crop'], 'Tunis', 'both', 'negotiable', '[]', 1),
    (v_admin_id, v_cat_marketing, 'Roll-up Premium (x5)', 'Lot de 5 roll-ups 85x200cm impression haute qualité. Structure aluminium, transport souple inclus.', 80.00, 150.00, 0, 20, true, ARRAY['https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=750&fit=crop'], 'Tunis', 'both', 'fixed', '[]', 1),
    (v_admin_id, v_cat_marketing, 'Drapeaux Plage (x10)', 'Lot de 10 drapeaux plage 2.5m avec impression recto. Pieds à eau ou sable inclus.', 120.00, 200.00, 0, 15, true, ARRAY['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=750&fit=crop'], 'Tunis', 'both', 'fixed', '[]', 1);

    -- More Matériel Événementiel
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_materiel, 'Barrière Clôturée (x20)', 'Lot de 20 barrières métalliques pour délimiter espaces et files d''attente. Hauteur 1m.', 100.00, 180.00, 0, 10, true, ARRAY['https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=750&fit=crop'], 'Tunis', 'both', 'fixed', '[]', 1),
    (v_admin_id, v_cat_materiel, 'Tapis Rouge 20m', 'Tapis rouge premium 1.5m x 20m avec bordures dorées. Parfait pour inaugurations et galas.', 200.00, 350.00, 0, 5, true, ARRAY['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=750&fit=crop'], 'Tunis', 'both', 'fixed', '[]', 1),
    (v_admin_id, v_cat_materiel, 'Scène Modulaire 6x4m', 'Scène modulaire avec escaliers, rampes et plancher antidérapant. Hauteur réglable 40-100cm.', 800.00, 15000.00, 0, 2, true, ARRAY['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=750&fit=crop'], 'Tunis', 'both', 'negotiable', '[]', 1);

    -- More Photo & Vidéo
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_photo, 'Photographe Professionnel', 'Service de photographe professionnel pour couverture événementielle. 4h minimum, retouches incluses.', 400.00, NULL, 0, 5, true, ARRAY['https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=750&fit=crop'], 'Tunis', 'rental', 'suggestion', '[]', 1),
    (v_admin_id, v_cat_photo, 'Cabine Photo 360°', 'Cabine photo 360° avec plateau rotatif, éclairage LED et impression instantanée. Animateur inclus.', 700.00, 12000.00, 0, 2, true, ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=750&fit=crop'], 'Tunis', 'both', 'fixed', '[]', 1);

    -- More Son & Éclairage
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_son, 'Micros Sans Fil (x8)', 'Lot de 8 micros sans fil professionnels Shure. Batteries rechargeables et récepteurs inclus.', 250.00, 4000.00, 0, 4, true, ARRAY['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=750&fit=crop'], 'Tunis', 'both', 'fixed', '[]', 1),
    (v_admin_id, v_cat_son, 'Projecteur Laser RGB', 'Projecteur laser RGB haute puissance pour spectacles lumineux. Contrôleur DMX inclus.', 350.00, 6000.00, 0, 3, true, ARRAY['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=750&fit=crop'], 'Tunis', 'both', 'fixed', '[]', 1);

    -- More Décoration & Mobilier
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_deco, 'Guirlande Lumineuse 50m', 'Guirlande lumineuse LED 50m avec ampoules chaudes. Parfait pour événements extérieurs et mariages.', 100.00, 180.00, 0, 10, true, ARRAY['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=750&fit=crop'], 'Tunis', 'both', 'fixed', '[]', 1),
    (v_admin_id, v_cat_deco, 'Plantes Artificielles (lot)', 'Lot de 20 plantes artificielles décoratives (fougères, palmiers, succulentes). Pots élégants inclus.', 150.00, 250.00, 0, 8, true, ARRAY['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=750&fit=crop'], 'Tunis', 'both', 'fixed', '[]', 1);

    -- More Animation & Spectacle
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_anim, 'Magicien Close-up', 'Service de magicien close-up pour animations cocktail et réceptions. 2h minimum.', 500.00, NULL, 0, 3, true, ARRAY['https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&h=750&fit=crop'], 'Tunis', 'rental', 'suggestion', '[]', 1),
    (v_admin_id, v_cat_anim, 'Photographe Polaroïd', 'Service de photographe polaroïd vintage pour événements. Films illimités, cadres personnalisés.', 300.00, NULL, 0, 2, true, ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=750&fit=crop'], 'Tunis', 'rental', 'fixed', '[]', 1);

    -- More Traiteur & Restauration
    INSERT INTO products (supplier_id, category_id, name, description, price_per_day, price_purchase, deposit, stock, is_available, images, location, mode, pricing_type, options, min_duration) VALUES
    (v_admin_id, v_cat_traiteur, 'Machine à Pop-corn', 'Machine à pop-corn professionnelle avec chariot vintage. Inclut maïs et sachets pour 100 portions.', 120.00, 2000.00, 0, 5, true, ARRAY['https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=600&h=750&fit=crop'], 'Tunis', 'both', 'fixed', '[]', 1),
    (v_admin_id, v_cat_traiteur, 'Fontaine à Chocolat', 'Fontaine à chocolat 3 étages avec chauffe-plat. Inclut 5kg de chocolat et biscuits.', 180.00, 3000.00, 0, 3, true, ARRAY['https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&h=750&fit=crop'], 'Tunis', 'both', 'fixed', '[]', 1);

    RAISE NOTICE 'Added more demo products';
  END IF;
END $$;
