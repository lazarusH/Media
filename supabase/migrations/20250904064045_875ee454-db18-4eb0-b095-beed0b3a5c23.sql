-- Update existing test users if they exist, otherwise create them
DO $$
BEGIN
  -- Update existing profiles if they exist
  UPDATE public.profiles 
  SET office_name = CASE 
    WHEN user_id = '11111111-1111-1111-1111-111111111111'::uuid THEN 'የኮሙኒኬሽን ጽህፈት ቤት'
    WHEN user_id = '22222222-2222-2222-2222-222222222222'::uuid THEN 'የከተማ ጽህፈት ቤት'
  END
  WHERE user_id IN ('11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid);
  
  -- Check if we updated any rows, if not create the profiles
  IF NOT FOUND THEN
    INSERT INTO public.profiles (user_id, office_name, role)
    VALUES 
      ('11111111-1111-1111-1111-111111111111'::uuid, 'የኮሙኒኬሽን ጽህፈት ቤት', 'admin'),
      ('22222222-2222-2222-2222-222222222222'::uuid, 'የከተማ ጽህፈት ቤት', 'office')
    ON CONFLICT (user_id) DO UPDATE SET
      office_name = EXCLUDED.office_name,
      role = EXCLUDED.role;
  END IF;
END $$;