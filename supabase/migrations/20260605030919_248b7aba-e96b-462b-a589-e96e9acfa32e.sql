
CREATE TABLE public.shop_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('order','membership')),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  membership_id uuid REFERENCES public.user_memberships(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  method text NOT NULL,
  phone text NOT NULL,
  reference text NOT NULL UNIQUE,
  poll_url text,
  paynow_reference text,
  status text NOT NULL DEFAULT 'sent',
  raw_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.shop_payments TO authenticated;
GRANT ALL ON public.shop_payments TO service_role;
ALTER TABLE public.shop_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY shop_payments_own_select ON public.shop_payments FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY shop_payments_own_insert ON public.shop_payments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE TRIGGER shop_payments_touch BEFORE UPDATE ON public.shop_payments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
