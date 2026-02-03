-- Migration: Create public.grammar_rules table with RLS policies
-- Date: February 3, 2026
-- Purpose: Add persistent storage for grammar rules with owner-based access control

-- ============================================================================
-- CREATE GRAMMAR_RULES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.grammar_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  pattern TEXT,
  examples JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_grammar_rules_language_id ON public.grammar_rules(language_id);
CREATE INDEX IF NOT EXISTS idx_grammar_rules_owner_id ON public.grammar_rules(owner_id);
CREATE INDEX IF NOT EXISTS idx_grammar_rules_category ON public.grammar_rules(category);
CREATE INDEX IF NOT EXISTS idx_grammar_rules_language_owner ON public.grammar_rules(language_id, owner_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.grammar_rules ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Policy 1: INSERT - Users can only insert rules they own
CREATE POLICY "Users can insert grammar rules they own"
  ON public.grammar_rules
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Policy 2: SELECT - Users can only see rules they own
CREATE POLICY "Users can view their own grammar rules"
  ON public.grammar_rules
  FOR SELECT
  USING (owner_id = auth.uid());

-- Policy 3: UPDATE - Users can only update rules they own
CREATE POLICY "Users can update their own grammar rules"
  ON public.grammar_rules
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Policy 4: DELETE - Users can only delete rules they own
CREATE POLICY "Users can delete their own grammar rules"
  ON public.grammar_rules
  FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================================================
-- COMMENT FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE public.grammar_rules IS 'Grammar rules for constructed languages. Each rule belongs to a language and is owned by a user. Access is restricted to the owner.';
COMMENT ON COLUMN public.grammar_rules.id IS 'Unique identifier for the grammar rule';
COMMENT ON COLUMN public.grammar_rules.language_id IS 'Reference to the language this rule belongs to';
COMMENT ON COLUMN public.grammar_rules.owner_id IS 'Reference to the user who owns/created this rule';
COMMENT ON COLUMN public.grammar_rules.name IS 'Name of the grammar rule (e.g., "Plural Formation")';
COMMENT ON COLUMN public.grammar_rules.description IS 'Detailed description of the rule';
COMMENT ON COLUMN public.grammar_rules.category IS 'Category: morphology, phonology, syntax, pragmatics';
COMMENT ON COLUMN public.grammar_rules.rule_type IS 'Type of rule: phoneme_rule, inflection, word_order, agreement';
COMMENT ON COLUMN public.grammar_rules.pattern IS 'Pattern or regex describing the rule';
COMMENT ON COLUMN public.grammar_rules.examples IS 'JSONB array of examples: [{input: string, output: string, explanation: string}]';
COMMENT ON COLUMN public.grammar_rules.created_at IS 'Timestamp when rule was created';
COMMENT ON COLUMN public.grammar_rules.updated_at IS 'Timestamp of last update';
