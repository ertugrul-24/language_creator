-- Migration: Create RPC function to bypass Table API issues
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.create_grammar_rule(
  p_language_id UUID,
  p_owner_id UUID,
  p_name TEXT,
  p_description TEXT,
  p_category TEXT,
  p_rule_type TEXT,
  p_pattern TEXT,
  p_examples JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges to bypass table visibility issues
SET search_path = public, auth -- Secure search path
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Optional: Enforcement that the user is who they say they are
  -- (If p_owner_id is passed from client, we should verify it)
  -- But for now, let's trust the logic or ensure auth.uid() matches if strictly needed.
  -- To be safe against spoofing if the client sends owner_id:
  IF p_owner_id IS DISTINCT FROM auth.uid() THEN
     RAISE EXCEPTION 'Unauthorized: owner_id must match authenticated user';
  END IF;

  INSERT INTO public.grammar_rules (
    language_id,
    owner_id,
    name,
    description,
    category,
    rule_type,
    pattern,
    examples
  ) VALUES (
    p_language_id,
    p_owner_id,
    p_name,
    p_description,
    p_category,
    p_rule_type,
    p_pattern,
    p_examples
  )
  RETURNING to_jsonb(grammar_rules.*) INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.create_grammar_rule TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_grammar_rule TO anon;
