-- Featured podcast episodes — managed from /admin/audio, shown on /resources/audio

CREATE TABLE featured_podcast_episodes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  spotify_url     TEXT NOT NULL,
  episode_date    TEXT,
  duration_label  TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  is_published    BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX featured_podcast_episodes_sort_idx
  ON featured_podcast_episodes (is_published, sort_order ASC, created_at DESC);

CREATE TRIGGER featured_podcast_episodes_updated_at
  BEFORE UPDATE ON featured_podcast_episodes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE featured_podcast_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published podcast episodes"
  ON featured_podcast_episodes FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Active admins can read all podcast episodes"
  ON featured_podcast_episodes FOR SELECT TO authenticated
  USING (is_active_admin());

CREATE POLICY "Active admins can insert podcast episodes"
  ON featured_podcast_episodes FOR INSERT TO authenticated
  WITH CHECK (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can update podcast episodes"
  ON featured_podcast_episodes FOR UPDATE TO authenticated
  USING (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  )
  WITH CHECK (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );

CREATE POLICY "Active admins can delete podcast episodes"
  ON featured_podcast_episodes FOR DELETE TO authenticated
  USING (
    is_active_admin()
    AND NOT admin_has_role(ARRAY['read_only_auditor']::admin_role[])
  );
