-- functions.sql
CREATE OR REPLACE FUNCTION public.create_employer_with_branch(
  p_branch_code text,
  p_company_name text,
  p_phone_number text,
  p_user_id uuid
)
RETURNS void AS $$
BEGIN
  -- Insert into employers table
  INSERT INTO public.employers (user_id, company_name, phone_number, branch_code)
  VALUES (p_user_id, p_company_name, p_phone_number, p_branch_code);

  -- Insert into branches table
  INSERT INTO public.branches (employer_id, name, branch_code)
  VALUES (p_user_id, p_company_name, p_branch_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the authenticated role
GRANT EXECUTE ON FUNCTION public.create_employer_with_branch(text, text, text, uuid) TO authenticated;
