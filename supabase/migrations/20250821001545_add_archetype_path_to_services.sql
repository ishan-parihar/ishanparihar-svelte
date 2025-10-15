CREATE TYPE archetype_path AS ENUM (
  'Mastery & Achievement',
  'Connection & Intimacy',
  'Purpose & Transcendence'
);

ALTER TABLE products_services
ADD COLUMN path archetype_path;