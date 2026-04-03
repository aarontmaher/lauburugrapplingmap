-- Private operator prompt dispatch queue
-- Separate from public suggestions and website feedback

CREATE TABLE IF NOT EXISTS prompt_jobs (
  id TEXT PRIMARY KEY,
  target_agent TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  source_client TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  claimed_by TEXT,
  claimed_at TIMESTAMPTZ,
  result_summary TEXT,
  result_artifact TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_prompt_jobs_status_created ON prompt_jobs(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_jobs_target_agent_created ON prompt_jobs(target_agent, created_at DESC);

ALTER TABLE prompt_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators can read prompt jobs"
ON prompt_jobs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.membership_status IN ('operator', 'admin')
  )
);

CREATE POLICY "Operators can insert prompt jobs"
ON prompt_jobs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.membership_status IN ('operator', 'admin')
  )
);

CREATE POLICY "Operators can update prompt jobs"
ON prompt_jobs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.membership_status IN ('operator', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.membership_status IN ('operator', 'admin')
  )
);
