/*
# Create sensor_readings table for Eco Sentinels IoT monitoring

## Purpose
Stores environmental sensor readings (rainfall, soil moisture, smoke level) from
the ESP32 / sensor simulator, along with the scenario label and AI-computed risk
analysis snapshot. This is the single source of truth for the dashboard's data.

## New Tables
- `sensor_readings`
  - `id` (uuid, primary key)
  - `timestamp` (timestamptz, when the reading was taken — defaults to now)
  - `rainfall` (numeric, rainfall in mm)
  - `soil_moisture` (numeric, soil moisture percentage 0-100)
  - `smoke_level` (numeric, smoke / air-quality level 0-100+)
  - `scenario` (text, label for the simulation scenario: normal, heavy_rain, flood, fire, or 'live')
  - `risk_level` (text, AI-computed overall risk: low, medium, high, critical)
  - `flood_risk` (text, AI-computed flood risk)
  - `fire_risk` (text, AI-computed fire risk)
  - `landslide_risk` (text, AI-computed landslide risk)
  - `ai_analysis` (text, AI-generated explanation of the risk)
  - `recommended_action` (text, AI-generated recommended action)
  - `created_at` (timestamptz, record creation time)

## Indexes
- `idx_sensor_readings_timestamp` on `timestamp DESC` for efficient time-range queries
- `idx_sensor_readings_scenario` on `scenario` for filtering by simulation scenario

## Security
- Enable RLS on `sensor_readings`.
- This is a single-tenant prototype dashboard with no sign-in screen, so all
  CRUD is allowed for both `anon` and `authenticated` roles. The data is
  intentionally public/shared across the dashboard.
*/

CREATE TABLE IF NOT EXISTS sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  rainfall numeric NOT NULL DEFAULT 0,
  soil_moisture numeric NOT NULL DEFAULT 0,
  smoke_level numeric NOT NULL DEFAULT 0,
  scenario text NOT NULL DEFAULT 'normal',
  risk_level text NOT NULL DEFAULT 'low',
  flood_risk text NOT NULL DEFAULT 'low',
  fire_risk text NOT NULL DEFAULT 'low',
  landslide_risk text NOT NULL DEFAULT 'low',
  ai_analysis text NOT NULL DEFAULT '',
  recommended_action text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_scenario ON sensor_readings (scenario);

ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sensor_readings" ON sensor_readings;
CREATE POLICY "anon_select_sensor_readings" ON sensor_readings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sensor_readings" ON sensor_readings;
CREATE POLICY "anon_insert_sensor_readings" ON sensor_readings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sensor_readings" ON sensor_readings;
CREATE POLICY "anon_update_sensor_readings" ON sensor_readings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sensor_readings" ON sensor_readings;
CREATE POLICY "anon_delete_sensor_readings" ON sensor_readings FOR DELETE
  TO anon, authenticated USING (true);
