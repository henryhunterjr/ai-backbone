-- Glossary auto-ingest trigger
-- Run this in the GLOSSARY project's Supabase SQL Editor
-- (project: zgxxhqbickrlqkwmkfni.supabase.co — the Crust & Crumb Glossary)
--
-- This creates a trigger that fires on new glossary_terms inserts and sends
-- the term to the AI Backbone content queue via webhook.
--
-- IMPORTANT: You must set the backbone_api_key in vault or as a config param
-- before this trigger will authenticate successfully.

-- Step 1: Enable the http extension for making HTTP requests from triggers
create extension if not exists http;

-- Step 2: Create the trigger function
create or replace function notify_backbone_new_glossary_term()
returns trigger
language plpgsql
security definer
as $$
declare
  payload jsonb;
  response_status int;
  api_key text;
begin
  -- Read the API key from Supabase vault (set via Dashboard > Settings > Vault)
  -- To add: INSERT INTO vault.secrets (name, secret) VALUES ('backbone_api_key', 'your-key-here');
  select decrypted_secret into api_key
    from vault.decrypted_secrets
    where name = 'backbone_api_key'
    limit 1;

  if api_key is null then
    raise warning 'backbone_api_key not found in vault — skipping webhook';
    return NEW;
  end if;
  payload := jsonb_build_object(
    'title', NEW.name,
    'url', 'https://crust-and-crumb-tawny.vercel.app/dictionary#' || NEW.slug,
    'content_type', 'glossary',
    'source_platform', 'glossary',
    'topic_slugs', ARRAY['glossary'],
    'performance_tier', 'strong',
    'submitted_by', 'glossary-trigger',
    'metadata', jsonb_build_object(
      'slug', NEW.slug,
      'category', NEW.category,
      'difficulty', NEW.difficulty,
      'definition', left(NEW.definition, 500)
    )
  );

  -- POST to the backbone content queue
  perform http_post(
    'https://asset-map-vert.vercel.app/api/ingest/pending',
    payload::text,
    'application/json',
    ARRAY[
      http_header('x-api-key', api_key)
    ]
  );

  return NEW;
exception
  when others then
    -- Log but don't block the insert if the webhook fails
    raise warning 'Backbone webhook failed: %', SQLERRM;
    return NEW;
end;
$$;

-- Step 3: Create the trigger
drop trigger if exists glossary_term_to_backbone on glossary_terms;

create trigger glossary_term_to_backbone
  after insert on glossary_terms
  for each row
  execute function notify_backbone_new_glossary_term();
