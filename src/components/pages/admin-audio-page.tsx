"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { FeaturedEpisodesDashboard } from "@/components/admin/featured-episodes-dashboard";

export function AdminAudioPage() {
  return (
    <AdminAuthShell>
      <FeaturedEpisodesDashboard />
    </AdminAuthShell>
  );
}
