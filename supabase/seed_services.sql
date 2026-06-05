-- Insert services for Maphisa's Barber Shop with exact pricing
-- Run this in your Supabase SQL Editor

INSERT INTO services (name, category, description, duration_minutes, price_maloti, active) VALUES
-- Haircuts
('Taper Fade (Without Black Dye)', 'Haircuts', 'Clean taper fade with precision edges', 30, 30, true),
('Taper Fade (With Black Dye)', 'Haircuts', 'Taper fade with black dye treatment', 45, 50, true),
('Bald Haircut (Without Black Dye)', 'Haircuts', 'Complete bald haircut with head massage', 25, 30, true),
('Bald Haircut (With Black Dye)', 'Haircuts', 'Bald haircut with black dye treatment', 40, 50, true),
('Mohawk Haircut (Without Black Dye)', 'Haircuts', 'Bold mohawk with design', 45, 30, true),
('Mohawk Haircut (With Black Dye)', 'Haircuts', 'Mohawk with black dye treatment', 60, 50, true),
('Short Hair (Without Dye)', 'Haircuts', 'Short hair cut and style', 20, 20, true),
('Short Hair (With Black Dye)', 'Haircuts', 'Short hair with black dye treatment', 45, 60, true),
('Short Hair (With Colorful Dye)', 'Haircuts', 'Short hair with colorful dye treatment', 75, 170, true),
('Haircut & Hairwash', 'Haircuts', 'Standard haircut with wash and style', 35, 60, true),
('Haircut & Black Dye + Hairwash', 'Haircuts', 'Haircut with black dye treatment and wash', 60, 80, true),

-- Beard Services
('Beard Trim', 'Beards', 'Beard trimming and shaping', 15, 10, true),

-- Additional services (you can add more as needed)
('Hot Towel Shave', 'Shaves', 'Traditional hot towel straight razor shave', 30, 50, true),
('Kids Haircut', 'Kids', 'Basic haircut for children under 12', 25, 30, true),
('Ladies Haircut', 'Ladies', 'Professional ladies haircut and styling', 45, 60, true)
ON CONFLICT DO NOTHING;
