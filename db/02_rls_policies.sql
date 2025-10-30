-- Row Level Security and Policies

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_requests ENABLE ROW LEVEL SECURITY;

-- Helper: get a user's role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS public.user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert new profiles"
ON public.profiles
FOR INSERT
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- media_requests policies
CREATE POLICY "Users can view their own requests"
ON public.media_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
ON public.media_requests
FOR SELECT
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can create their own requests"
ON public.media_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending requests"
ON public.media_requests
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can update any request"
ON public.media_requests
FOR UPDATE
USING (public.get_user_role(auth.uid()) = 'admin');

