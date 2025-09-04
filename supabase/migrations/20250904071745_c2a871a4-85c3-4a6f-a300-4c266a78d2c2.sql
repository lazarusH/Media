-- Enable trigger to automatically create profiles for new auth users and backfill existing ones
-- 1) Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2) Backfill profiles for any existing auth users missing a profile
INSERT INTO public.profiles (user_id, office_name, role)
SELECT u.id,
       COALESCE(u.raw_user_meta_data ->> 'office_name', 'Unknown Office') AS office_name,
       COALESCE((u.raw_user_meta_data ->> 'role')::public.user_role, 'office'::public.user_role) AS role
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- 3) Ensure updated_at is maintained on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();