-- Create test users
-- First, let's create the auth users with generated emails
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111'::uuid, 'komunikeshiniofis@akaki.gov.et', crypt('admin123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'ketemaofis@akaki.gov.et', crypt('office123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated');

-- Then create the corresponding profiles
INSERT INTO public.profiles (user_id, office_name, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111'::uuid, 'የኮሙኒኬሽን ጽህፈት ቤት', 'admin'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'የከተማ ጽህፈት ቤት', 'office');