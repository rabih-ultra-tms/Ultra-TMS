-- Create equipment makes
CREATE TABLE IF NOT EXISTS makes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  popularity_rank INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_makes_name_unique ON makes(name);

-- Create equipment models
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make_id UUID NOT NULL REFERENCES makes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_models_make_id ON models(make_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_models_make_name_unique ON models(make_id, name);

-- Create equipment dimensions
CREATE TABLE IF NOT EXISTS equipment_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  length_inches INTEGER,
  width_inches INTEGER,
  height_inches INTEGER,
  weight_lbs INTEGER,
  front_image_url TEXT,
  side_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_equipment_dimensions_model_unique ON equipment_dimensions(model_id);

-- Create equipment rates
CREATE TABLE IF NOT EXISTS rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make_id UUID REFERENCES makes(id) ON DELETE SET NULL,
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  dismantling_loading_cost INTEGER NOT NULL DEFAULT 0,
  loading_cost INTEGER NOT NULL DEFAULT 0,
  blocking_bracing_cost INTEGER NOT NULL DEFAULT 0,
  rigging_cost INTEGER NOT NULL DEFAULT 0,
  storage_cost INTEGER NOT NULL DEFAULT 0,
  transport_cost INTEGER NOT NULL DEFAULT 0,
  equipment_cost INTEGER NOT NULL DEFAULT 0,
  labor_cost INTEGER NOT NULL DEFAULT 0,
  permit_cost INTEGER NOT NULL DEFAULT 0,
  escort_cost INTEGER NOT NULL DEFAULT 0,
  miscellaneous_cost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rates_model_id ON rates(model_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rates_model_location_unique ON rates(model_id, location);