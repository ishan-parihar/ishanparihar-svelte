-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  metadata JSONB
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- Enable RLS (Row Level Security) for analytics_events table
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics_events table
-- Allow service role to insert events (for server-side tracking)
CREATE POLICY "Allow service role to insert events" ON analytics_events
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Allow service role to read events (for analytics dashboard)
CREATE POLICY "Allow service role to read events" ON analytics_events
  FOR SELECT TO service_role
  USING (true);

-- Allow authenticated users to insert their own events
CREATE POLICY "Allow users to insert their own events" ON analytics_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow admin users to read all events
CREATE POLICY "Allow admins to read all events" ON analytics_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );