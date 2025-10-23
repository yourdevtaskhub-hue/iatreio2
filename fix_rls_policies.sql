-- Fix RLS policies to allow payment creation from frontend

-- Update payments table RLS policy to allow inserts from anonymous users
DROP POLICY IF EXISTS "Allow insert access for authenticated users" ON public.payments;

CREATE POLICY "Allow insert for all users" ON public.payments
FOR INSERT WITH CHECK (TRUE);

-- Also update the update policy to allow updates from anonymous users
DROP POLICY IF EXISTS "Allow update access for authenticated users" ON public.payments;

CREATE POLICY "Allow update for all users" ON public.payments
FOR UPDATE USING (TRUE);

-- Keep the read policy as is (allows reading for all users)
-- Keep the delete policy as is (only authenticated users can delete)

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'payments';
