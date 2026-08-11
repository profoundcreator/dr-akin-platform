export type AdminRole =
  | "super_admin"
  | "admin_manager"
  | "technical_admin"
  | "executive_assistant"
  | "executive_reviewer"
  | "inbox_manager"
  | "resource_manager"
  | "read_only_auditor";

export type EventType = "hosted_by_dr_akin" | "featured_appearance" | "org_brand";

export type EventBrand =
  | "dr_akin"
  | "aald"
  | "erudio"
  | "performx"
  | "tc_resource"
  | "other";

export type EventStatus = "draft" | "pending_approval" | "published" | "hidden";

export type LibraryBookStatus = "draft" | "pending_approval" | "published" | "hidden";

export type InsightArticleStatus = "draft" | "pending_approval" | "published" | "hidden";

export type WorkOrgStatus = "draft" | "pending_approval" | "published" | "hidden";

export type ContentPlanStatus = "draft" | "pending_review" | "approved";

export type HomepageHeroMode = "portrait" | "banner" | "minimal";

export type AdminAccountState = "invited" | "active" | "suspended" | "revoked";

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  account_state: AdminAccountState;
  is_founder?: boolean;
  invited_by: string | null;
  invited_at: string | null;
  last_sign_in_at: string | null;
  session_revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbBookingRequest {
  id: string;
  reference: string;
  access_token: string;
  organizer_email: string;
  status: string;
  internal_status: string;
  priority: string;
  assigned_ea_id: string | null;
  conflict_detected: boolean;
  submission_source: string;
  form_data: Record<string, unknown>;
  admin_notified_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_ea?: { full_name: string } | null;
}

export interface DbBookingStatusEvent {
  id: string;
  booking_request_id: string;
  previous_status: string | null;
  new_status: string;
  actor: string;
  internal_reason: string | null;
  organizer_message: string | null;
  created_at: string;
}

export interface DbEnquiry {
  id: string;
  source: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  organization: string | null;
  subject: string | null;
  message: string | null;
  status: string;
  priority: string;
  assigned_admin_id: string | null;
  booking_request_id: string | null;
  payload: Record<string, unknown> | null;
  admin_notified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAuditEvent {
  id: string;
  actor_id: string | null;
  actor_role: AdminRole | null;
  event_type: string;
  target_type: string | null;
  target_id: string | null;
  summary: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface DbOrganizerResourceFile {
  id: string;
  logical_key: string;
  title: string;
  category: string;
  audience_variant: "professional" | "christian" | "universal";
  version: number;
  file_name: string;
  object_path: string;
  mime_type: string;
  size_bytes: number;
  status: "available" | "retired";
  is_current: boolean;
  created_by: string;
  created_at: string;
  retired_by: string | null;
  retired_at: string | null;
}

export interface DbBookingResourceGrant {
  id: string;
  booking_request_id: string;
  resource_file_id: string;
  granted_by: string;
  granted_at: string;
  expires_at: string | null;
  revoked_by: string | null;
  revoked_at: string | null;
  revoke_reason: string | null;
}

export interface DbEvent {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  seo_description: string | null;
  event_type: EventType;
  brand: EventBrand;
  starts_at: string;
  ends_at: string;
  timezone: string;
  location: string | null;
  location_type: string;
  cover_image_path: string | null;
  registration_url: string | null;
  registration_embed_url: string | null;
  payment_url: string | null;
  payment_label: string | null;
  status: EventStatus;
  manually_hidden: boolean;
  is_homepage_featured: boolean;
  submitted_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbLibraryBook {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  year: string | null;
  category: string;
  description: string;
  cover_image_path: string | null;
  purchase_links: unknown;
  is_featured: boolean;
  sort_order: number;
  status: LibraryBookStatus;
  manually_hidden: boolean;
  submitted_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbInsightArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  seo_description: string | null;
  body: string;
  hero_image_path: string | null;
  social_image_alt: string | null;
  source_label: string | null;
  source_url: string | null;
  published_at: string | null;
  sort_order: number;
  is_homepage_featured: boolean;
  homepage_feature_order: number | null;
  status: InsightArticleStatus;
  manually_hidden: boolean;
  submitted_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbWorkOrg {
  id: string;
  slug: string;
  brand_key: string;
  page_title: string;
  pillar_title: string;
  brand_label: string;
  kicker: string;
  headline: string;
  headline_secondary: string | null;
  description: string;
  hub_card_description: string;
  sections: unknown;
  cta_label: string | null;
  cta_href: string | null;
  secondary_cta_label: string | null;
  secondary_cta_href: string | null;
  related_links: unknown;
  hero_image_path: string | null;
  logo_image_path: string | null;
  external_url: string | null;
  sort_order: number;
  status: WorkOrgStatus;
  manually_hidden: boolean;
  submitted_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbContentPlan {
  slug: string;
  title: string;
  variables: unknown;
  decisions: unknown;
  section_approvals: unknown;
  checklist: unknown;
  pages: unknown;
  status: ContentPlanStatus;
  approval_note: string;
  updated_by: string | null;
  updated_at: string;
}

export interface DbSiteSettings {
  id: boolean;
  homepage_events_enabled: boolean;
  homepage_hero_mode: HomepageHeroMode;
  homepage_banner_image_path: string | null;
  homepage_portrait_image_path: string | null;
  hidden_preloaded_insight_slugs: string[];
  hidden_preloaded_book_slugs: string[];
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbFeaturedPodcastEpisode {
  id: string;
  title: string;
  description: string | null;
  spotify_url: string;
  episode_date: string | null;
  duration_label: string | null;
  sort_order: number;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingResult {
  id: string;
  reference: string;
  access_token: string;
}

export interface Database {
  public: {
    Tables: {
      admin_profiles: {
        Row: AdminProfile;
        Insert: Partial<AdminProfile> & Pick<AdminProfile, "id" | "email" | "full_name" | "role">;
        Update: Partial<AdminProfile>;
      };
      booking_requests: {
        Row: DbBookingRequest;
        Insert: never;
        Update: Partial<DbBookingRequest>;
      };
      booking_status_events: {
        Row: DbBookingStatusEvent;
        Insert: Partial<DbBookingStatusEvent>;
        Update: never;
      };
      enquiries: {
        Row: DbEnquiry;
        Insert: Partial<DbEnquiry>;
        Update: Partial<DbEnquiry>;
      };
      audit_events: {
        Row: DbAuditEvent;
        Insert: Partial<DbAuditEvent>;
        Update: never;
      };
      organizer_resource_files: {
        Row: DbOrganizerResourceFile;
        Insert: never;
        Update: never;
      };
      booking_resource_grants: {
        Row: DbBookingResourceGrant;
        Insert: never;
        Update: never;
      };
      featured_podcast_episodes: {
        Row: DbFeaturedPodcastEpisode;
        Insert: Partial<DbFeaturedPodcastEpisode> &
          Pick<DbFeaturedPodcastEpisode, "title" | "spotify_url">;
        Update: Partial<DbFeaturedPodcastEpisode>;
      };
      events: {
        Row: DbEvent;
        Insert: Partial<DbEvent> & Pick<DbEvent, "slug" | "title" | "starts_at" | "ends_at">;
        Update: Partial<DbEvent>;
      };
      site_settings: {
        Row: DbSiteSettings;
        Insert: Partial<DbSiteSettings> & Pick<DbSiteSettings, "id">;
        Update: Partial<DbSiteSettings>;
      };
      library_books: {
        Row: DbLibraryBook;
        Insert: Partial<DbLibraryBook> & Pick<DbLibraryBook, "slug" | "title" | "category" | "description">;
        Update: Partial<DbLibraryBook>;
      };
      insights_articles: {
        Row: DbInsightArticle;
        Insert: Partial<DbInsightArticle> &
          Pick<DbInsightArticle, "slug" | "title" | "category" | "summary">;
        Update: Partial<DbInsightArticle>;
      };
      work_orgs: {
        Row: DbWorkOrg;
        Insert: Partial<DbWorkOrg> &
          Pick<
            DbWorkOrg,
            | "slug"
            | "brand_key"
            | "page_title"
            | "pillar_title"
            | "brand_label"
            | "kicker"
            | "headline"
            | "description"
            | "hub_card_description"
          >;
        Update: Partial<DbWorkOrg>;
      };
      content_plans: {
        Row: DbContentPlan;
        Insert: Partial<DbContentPlan> & Pick<DbContentPlan, "slug" | "title">;
        Update: Partial<DbContentPlan>;
      };
    };
    Functions: {
      create_booking_request: {
        Args: { p_form: Record<string, unknown>; p_source?: string };
        Returns: CreateBookingResult;
      };
      submit_general_enquiry: {
        Args: {
          p_name: string;
          p_email: string;
          p_organization?: string;
          p_subject: string;
          p_message: string;
          p_privacy_agreed: boolean;
          p_website?: string;
        };
        Returns: string;
      };
      get_booking_for_organizer: {
        Args: { p_reference: string; p_access_token: string };
        Returns: Record<string, unknown> | null;
      };
      log_audit_event: {
        Args: {
          p_event_type: string;
          p_target_type?: string;
          p_target_id?: string;
          p_summary?: Record<string, unknown>;
          p_metadata?: Record<string, unknown>;
        };
        Returns: string;
      };
      update_admin_team_member: {
        Args: {
          p_target_id: string;
          p_role?: AdminRole;
          p_account_state?: AdminAccountState;
          p_full_name?: string;
        };
        Returns: AdminProfile;
      };
      mark_admin_as_founder: {
        Args: { p_target_id: string };
        Returns: AdminProfile;
      };
      list_audit_events: {
        Args: { p_limit?: number; p_offset?: number };
        Returns: {
          id: string;
          actor_id: string | null;
          actor_role: AdminRole | null;
          actor_name: string | null;
          actor_email: string | null;
          event_type: string;
          target_type: string | null;
          target_id: string | null;
          summary: Record<string, unknown> | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        }[];
      };
      register_organizer_resource: {
        Args: {
          p_logical_key: string;
          p_title: string;
          p_category: string;
          p_file_name: string;
          p_object_path: string;
          p_mime_type: string;
          p_size_bytes: number;
        };
        Returns: DbOrganizerResourceFile;
      };
      retire_organizer_resource: {
        Args: { p_resource_file_id: string };
        Returns: DbOrganizerResourceFile;
      };
      grant_booking_resource: {
        Args: {
          p_booking_request_id: string;
          p_resource_file_id: string;
          p_expires_at?: string;
        };
        Returns: DbBookingResourceGrant;
      };
      revoke_booking_resource: {
        Args: { p_grant_id: string; p_reason?: string };
        Returns: DbBookingResourceGrant;
      };
      get_organizer_resources: {
        Args: { p_reference: string; p_access_token: string };
        Returns: Record<string, unknown> | null;
      };
      record_organizer_resource_access: {
        Args: {
          p_reference: string;
          p_access_token: string;
          p_resource_file_id: string;
        };
        Returns: boolean;
      };
    };
  };
}
