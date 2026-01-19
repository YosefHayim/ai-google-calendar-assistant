export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: Json;
          category: string;
          content: string;
          created_at: string | null;
          excerpt: string;
          featured: boolean | null;
          id: string;
          image_key: string | null;
          published_at: string;
          read_time: string;
          seo: Json;
          slug: string;
          status: string;
          tags: string[] | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          author?: Json;
          category: string;
          content: string;
          created_at?: string | null;
          excerpt: string;
          featured?: boolean | null;
          id?: string;
          image_key?: string | null;
          published_at?: string;
          read_time?: string;
          seo?: Json;
          slug: string;
          status?: string;
          tags?: string[] | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          author?: Json;
          category?: string;
          content?: string;
          created_at?: string | null;
          excerpt?: string;
          featured?: boolean | null;
          id?: string;
          image_key?: string | null;
          published_at?: string;
          read_time?: string;
          seo?: Json;
          slug?: string;
          status?: string;
          tags?: string[] | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      conversation_messages: {
        Row: {
          completion_tokens: number | null;
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          metadata: Json | null;
          prompt_tokens: number | null;
          role: Database["public"]["Enums"]["message_role"];
          sequence_number: number;
          tool_call_id: string | null;
          tool_calls: Json | null;
        };
        Insert: {
          completion_tokens?: number | null;
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          prompt_tokens?: number | null;
          role: Database["public"]["Enums"]["message_role"];
          sequence_number: number;
          tool_call_id?: string | null;
          tool_calls?: Json | null;
        };
        Update: {
          completion_tokens?: number | null;
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          prompt_tokens?: number | null;
          role?: Database["public"]["Enums"]["message_role"];
          sequence_number?: number;
          tool_call_id?: string | null;
          tool_calls?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          archived_at: string | null;
          created_at: string;
          external_chat_id: number | null;
          id: string;
          is_active: boolean | null;
          last_message_at: string | null;
          message_count: number | null;
          pinned: boolean | null;
          share_expires_at: string | null;
          share_token: string | null;
          source: Database["public"]["Enums"]["conversation_source"];
          summary: string | null;
          title: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          external_chat_id?: number | null;
          id?: string;
          is_active?: boolean | null;
          last_message_at?: string | null;
          message_count?: number | null;
          pinned?: boolean | null;
          share_expires_at?: string | null;
          share_token?: string | null;
          source: Database["public"]["Enums"]["conversation_source"];
          summary?: string | null;
          title?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          external_chat_id?: number | null;
          id?: string;
          is_active?: boolean | null;
          last_message_at?: string | null;
          message_count?: number | null;
          pinned?: boolean | null;
          share_expires_at?: string | null;
          share_token?: string | null;
          source?: Database["public"]["Enums"]["conversation_source"];
          summary?: string | null;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      feature_flag_audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["feature_flag_audit_action"];
          actor_email: string | null;
          actor_id: string;
          created_at: string;
          feature_flag_id: string | null;
          feature_flag_key: string;
          id: string;
          ip_address: string | null;
          metadata: Json | null;
          new_value: Json | null;
          previous_value: Json | null;
          user_agent: string | null;
        };
        Insert: {
          action: Database["public"]["Enums"]["feature_flag_audit_action"];
          actor_email?: string | null;
          actor_id: string;
          created_at?: string;
          feature_flag_id?: string | null;
          feature_flag_key: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          new_value?: Json | null;
          previous_value?: Json | null;
          user_agent?: string | null;
        };
        Update: {
          action?: Database["public"]["Enums"]["feature_flag_audit_action"];
          actor_email?: string | null;
          actor_id?: string;
          created_at?: string;
          feature_flag_id?: string | null;
          feature_flag_key?: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          new_value?: Json | null;
          previous_value?: Json | null;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "feature_flag_audit_logs_feature_flag_id_fkey";
            columns: ["feature_flag_id"];
            isOneToOne: false;
            referencedRelation: "feature_flags";
            referencedColumns: ["id"];
          },
        ];
      };
      feature_flag_webhook_deliveries: {
        Row: {
          attempt_number: number | null;
          created_at: string;
          duration_ms: number | null;
          error_message: string | null;
          event_type: Database["public"]["Enums"]["feature_flag_audit_action"];
          feature_flag_id: string | null;
          feature_flag_key: string;
          id: string;
          payload: Json;
          response_body: string | null;
          response_status: number | null;
          success: boolean | null;
          webhook_id: string | null;
        };
        Insert: {
          attempt_number?: number | null;
          created_at?: string;
          duration_ms?: number | null;
          error_message?: string | null;
          event_type: Database["public"]["Enums"]["feature_flag_audit_action"];
          feature_flag_id?: string | null;
          feature_flag_key: string;
          id?: string;
          payload: Json;
          response_body?: string | null;
          response_status?: number | null;
          success?: boolean | null;
          webhook_id?: string | null;
        };
        Update: {
          attempt_number?: number | null;
          created_at?: string;
          duration_ms?: number | null;
          error_message?: string | null;
          event_type?: Database["public"]["Enums"]["feature_flag_audit_action"];
          feature_flag_id?: string | null;
          feature_flag_key?: string;
          id?: string;
          payload?: Json;
          response_body?: string | null;
          response_status?: number | null;
          success?: boolean | null;
          webhook_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "feature_flag_webhook_deliveries_feature_flag_id_fkey";
            columns: ["feature_flag_id"];
            isOneToOne: false;
            referencedRelation: "feature_flags";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feature_flag_webhook_deliveries_webhook_id_fkey";
            columns: ["webhook_id"];
            isOneToOne: false;
            referencedRelation: "feature_flag_webhooks";
            referencedColumns: ["id"];
          },
        ];
      };
      feature_flag_webhooks: {
        Row: {
          created_at: string;
          enabled: boolean;
          events: string[];
          headers: Json | null;
          id: string;
          last_status_code: number | null;
          last_triggered_at: string | null;
          name: string;
          retry_count: number | null;
          secret: string | null;
          timeout_ms: number | null;
          updated_at: string;
          url: string;
        };
        Insert: {
          created_at?: string;
          enabled?: boolean;
          events?: string[];
          headers?: Json | null;
          id?: string;
          last_status_code?: number | null;
          last_triggered_at?: string | null;
          name: string;
          retry_count?: number | null;
          secret?: string | null;
          timeout_ms?: number | null;
          updated_at?: string;
          url: string;
        };
        Update: {
          created_at?: string;
          enabled?: boolean;
          events?: string[];
          headers?: Json | null;
          id?: string;
          last_status_code?: number | null;
          last_triggered_at?: string | null;
          name?: string;
          retry_count?: number | null;
          secret?: string | null;
          timeout_ms?: number | null;
          updated_at?: string;
          url?: string;
        };
        Relationships: [];
      };
      feature_flags: {
        Row: {
          allowed_tiers: string[] | null;
          allowed_user_ids: string[] | null;
          created_at: string;
          description: string | null;
          enabled: boolean;
          environment: Database["public"]["Enums"]["feature_flag_environment"];
          id: string;
          key: string;
          metadata: Json | null;
          name: string;
          rollout_percentage: number | null;
          updated_at: string;
        };
        Insert: {
          allowed_tiers?: string[] | null;
          allowed_user_ids?: string[] | null;
          created_at?: string;
          description?: string | null;
          enabled?: boolean;
          environment?: Database["public"]["Enums"]["feature_flag_environment"];
          id?: string;
          key: string;
          metadata?: Json | null;
          name: string;
          rollout_percentage?: number | null;
          updated_at?: string;
        };
        Update: {
          allowed_tiers?: string[] | null;
          allowed_user_ids?: string[] | null;
          created_at?: string;
          description?: string | null;
          enabled?: boolean;
          environment?: Database["public"]["Enums"]["feature_flag_environment"];
          id?: string;
          key?: string;
          metadata?: Json | null;
          name?: string;
          rollout_percentage?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      integrations: {
        Row: {
          access_token: string | null;
          bot_user_id: string | null;
          created_at: string | null;
          id: string;
          installed_at: string | null;
          installed_by: string | null;
          integration_type: string;
          last_sync_at: string | null;
          refresh_token: string | null;
          scope: string | null;
          status: string | null;
          token_expires_at: string | null;
          updated_at: string | null;
          user_mappings: Json | null;
          workspace_data: Json;
          workspace_id: string;
        };
        Insert: {
          access_token?: string | null;
          bot_user_id?: string | null;
          created_at?: string | null;
          id?: string;
          installed_at?: string | null;
          installed_by?: string | null;
          integration_type: string;
          last_sync_at?: string | null;
          refresh_token?: string | null;
          scope?: string | null;
          status?: string | null;
          token_expires_at?: string | null;
          updated_at?: string | null;
          user_mappings?: Json | null;
          workspace_data?: Json;
          workspace_id: string;
        };
        Update: {
          access_token?: string | null;
          bot_user_id?: string | null;
          created_at?: string | null;
          id?: string;
          installed_at?: string | null;
          installed_by?: string | null;
          integration_type?: string;
          last_sync_at?: string | null;
          refresh_token?: string | null;
          scope?: string | null;
          status?: string | null;
          token_expires_at?: string | null;
          updated_at?: string | null;
          user_mappings?: Json | null;
          workspace_data?: Json;
          workspace_id?: string;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          accepted_at: string | null;
          converted_at: string | null;
          created_at: string | null;
          expires_at: string | null;
          id: string;
          invite_token: string;
          invite_type: string;
          invitee_email: string;
          invitee_id: string | null;
          inviter_email: string;
          inviter_id: string;
          metadata: Json | null;
          reward_amount: number | null;
          reward_claimed_at: string | null;
          reward_type: string | null;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          accepted_at?: string | null;
          converted_at?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          invite_token: string;
          invite_type: string;
          invitee_email: string;
          invitee_id?: string | null;
          inviter_email: string;
          inviter_id: string;
          metadata?: Json | null;
          reward_amount?: number | null;
          reward_claimed_at?: string | null;
          reward_type?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Update: {
          accepted_at?: string | null;
          converted_at?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string;
          invite_token?: string;
          invite_type?: string;
          invitee_email?: string;
          invitee_id?: string | null;
          inviter_email?: string;
          inviter_id?: string;
          metadata?: Json | null;
          reward_amount?: number | null;
          reward_claimed_at?: string | null;
          reward_type?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      lemonsqueezy_webhook_events: {
        Row: {
          created_at: string | null;
          error_message: string | null;
          event_id: string;
          event_type: string;
          id: string;
          payload: Json;
          processed: boolean | null;
          processed_at: string | null;
          retry_count: number | null;
        };
        Insert: {
          created_at?: string | null;
          error_message?: string | null;
          event_id: string;
          event_type: string;
          id?: string;
          payload: Json;
          processed?: boolean | null;
          processed_at?: string | null;
          retry_count?: number | null;
        };
        Update: {
          created_at?: string | null;
          error_message?: string | null;
          event_id?: string;
          event_type?: string;
          id?: string;
          payload?: Json;
          processed?: boolean | null;
          processed_at?: string | null;
          retry_count?: number | null;
        };
        Relationships: [];
      };
      marketing_subscriptions: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          ip_address: string | null;
          metadata: Json | null;
          name: string | null;
          source: string | null;
          status: string | null;
          subscription_types: string[] | null;
          unsubscribed_at: string | null;
          updated_at: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          name?: string | null;
          source?: string | null;
          status?: string | null;
          subscription_types?: string[] | null;
          unsubscribed_at?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          name?: string | null;
          source?: string | null;
          status?: string | null;
          subscription_types?: string[] | null;
          unsubscribed_at?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      oauth_tokens: {
        Row: {
          access_token: string;
          created_at: string;
          expires_at: string | null;
          id: string;
          id_token: string | null;
          is_valid: boolean | null;
          last_refreshed_at: string | null;
          provider: Database["public"]["Enums"]["oauth_provider"];
          provider_user_id: string | null;
          refresh_error_count: number | null;
          refresh_token: string | null;
          refresh_token_expires_at: string | null;
          scope: string | null;
          token_type: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          access_token: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          id_token?: string | null;
          is_valid?: boolean | null;
          last_refreshed_at?: string | null;
          provider: Database["public"]["Enums"]["oauth_provider"];
          provider_user_id?: string | null;
          refresh_error_count?: number | null;
          refresh_token?: string | null;
          refresh_token_expires_at?: string | null;
          scope?: string | null;
          token_type?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          access_token?: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          id_token?: string | null;
          is_valid?: boolean | null;
          last_refreshed_at?: string | null;
          provider?: Database["public"]["Enums"]["oauth_provider"];
          provider_user_id?: string | null;
          refresh_error_count?: number | null;
          refresh_token?: string | null;
          refresh_token_expires_at?: string | null;
          scope?: string | null;
          token_type?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "oauth_tokens_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "oauth_tokens_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_active_users_with_calendar";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "oauth_tokens_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_user_conversation_stats";
            referencedColumns: ["user_id"];
          },
        ];
      };
      team_members: {
        Row: {
          id: string;
          invite_id: string | null;
          invited_by: string | null;
          joined_at: string | null;
          role: string | null;
          team_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          invite_id?: string | null;
          invited_by?: string | null;
          joined_at?: string | null;
          role?: string | null;
          team_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          invite_id?: string | null;
          invited_by?: string | null;
          joined_at?: string | null;
          role?: string | null;
          team_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_members_invite_id_fkey";
            columns: ["invite_id"];
            isOneToOne: false;
            referencedRelation: "invitations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_members_invite_id_fkey";
            columns: ["invite_id"];
            isOneToOne: false;
            referencedRelation: "referrals_view";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_members_invite_id_fkey";
            columns: ["invite_id"];
            isOneToOne: false;
            referencedRelation: "team_invites_view";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      teams: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          max_members: number | null;
          name: string;
          owner_id: string;
          settings: Json | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          max_members?: number | null;
          name: string;
          owner_id: string;
          settings?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          max_members?: number | null;
          name?: string;
          owner_id?: string;
          settings?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      telegram_users: {
        Row: {
          created_at: string;
          first_name: string | null;
          id: string;
          is_bot: boolean | null;
          is_linked: boolean | null;
          language_code: string | null;
          last_activity_at: string | null;
          pending_email: string | null;
          telegram_chat_id: number | null;
          telegram_user_id: number;
          telegram_username: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          first_name?: string | null;
          id?: string;
          is_bot?: boolean | null;
          is_linked?: boolean | null;
          language_code?: string | null;
          last_activity_at?: string | null;
          pending_email?: string | null;
          telegram_chat_id?: number | null;
          telegram_user_id: number;
          telegram_username?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          first_name?: string | null;
          id?: string;
          is_bot?: boolean | null;
          is_linked?: boolean | null;
          language_code?: string | null;
          last_activity_at?: string | null;
          pending_email?: string | null;
          telegram_chat_id?: number | null;
          telegram_user_id?: number;
          telegram_username?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "telegram_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "telegram_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_active_users_with_calendar";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "telegram_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_user_conversation_stats";
            referencedColumns: ["user_id"];
          },
        ];
      };
      user_calendars: {
        Row: {
          access_role:
            | Database["public"]["Enums"]["calendar_access_role"]
            | null;
          background_color: string | null;
          calendar_id: string;
          calendar_name: string | null;
          created_at: string;
          default_reminders: Json | null;
          foreground_color: string | null;
          id: string;
          is_primary: boolean | null;
          is_visible: boolean | null;
          last_synced_at: string | null;
          notification_enabled: boolean | null;
          sync_token: string | null;
          timezone: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          access_role?:
            | Database["public"]["Enums"]["calendar_access_role"]
            | null;
          background_color?: string | null;
          calendar_id: string;
          calendar_name?: string | null;
          created_at?: string;
          default_reminders?: Json | null;
          foreground_color?: string | null;
          id?: string;
          is_primary?: boolean | null;
          is_visible?: boolean | null;
          last_synced_at?: string | null;
          notification_enabled?: boolean | null;
          sync_token?: string | null;
          timezone?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          access_role?:
            | Database["public"]["Enums"]["calendar_access_role"]
            | null;
          background_color?: string | null;
          calendar_id?: string;
          calendar_name?: string | null;
          created_at?: string;
          default_reminders?: Json | null;
          foreground_color?: string | null;
          id?: string;
          is_primary?: boolean | null;
          is_visible?: boolean | null;
          last_synced_at?: string | null;
          notification_enabled?: boolean | null;
          sync_token?: string | null;
          timezone?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_calendars_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_calendars_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_active_users_with_calendar";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "user_calendars_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_user_conversation_stats";
            referencedColumns: ["user_id"];
          },
        ];
      };
      users: {
        Row: {
          ai_interactions_used: number | null;
          avatar_url: string | null;
          created_at: string;
          credits_remaining: number | null;
          deactivated_at: string | null;
          display_name: string | null;
          email: string;
          email_verified: boolean | null;
          first_name: string | null;
          id: string;
          last_login_at: string | null;
          last_name: string | null;
          locale: string | null;
          preferences: Json | null;
          role: Database["public"]["Enums"]["user_role"];
          status: Database["public"]["Enums"]["user_status"] | null;
          timezone: string | null;
          updated_at: string;
          usage_reset_at: string | null;
        };
        Insert: {
          ai_interactions_used?: number | null;
          avatar_url?: string | null;
          created_at?: string;
          credits_remaining?: number | null;
          deactivated_at?: string | null;
          display_name?: string | null;
          email: string;
          email_verified?: boolean | null;
          first_name?: string | null;
          id?: string;
          last_login_at?: string | null;
          last_name?: string | null;
          locale?: string | null;
          preferences?: Json | null;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["user_status"] | null;
          timezone?: string | null;
          updated_at?: string;
          usage_reset_at?: string | null;
        };
        Update: {
          ai_interactions_used?: number | null;
          avatar_url?: string | null;
          created_at?: string;
          credits_remaining?: number | null;
          deactivated_at?: string | null;
          display_name?: string | null;
          email?: string;
          email_verified?: boolean | null;
          first_name?: string | null;
          id?: string;
          last_login_at?: string | null;
          last_name?: string | null;
          locale?: string | null;
          preferences?: Json | null;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["user_status"] | null;
          timezone?: string | null;
          updated_at?: string;
          usage_reset_at?: string | null;
        };
        Relationships: [];
      };
      whatsapp_message_templates: {
        Row: {
          body_text: string;
          button_count: number | null;
          created_at: string | null;
          footer_text: string | null;
          header_format: string | null;
          id: string;
          language_code: string;
          last_synced_at: string | null;
          meta_template_id: string | null;
          parameter_count: number | null;
          status: string;
          template_category: string;
          template_name: string;
          updated_at: string | null;
        };
        Insert: {
          body_text: string;
          button_count?: number | null;
          created_at?: string | null;
          footer_text?: string | null;
          header_format?: string | null;
          id?: string;
          language_code?: string;
          last_synced_at?: string | null;
          meta_template_id?: string | null;
          parameter_count?: number | null;
          status?: string;
          template_category?: string;
          template_name: string;
          updated_at?: string | null;
        };
        Update: {
          body_text?: string;
          button_count?: number | null;
          created_at?: string | null;
          footer_text?: string | null;
          header_format?: string | null;
          id?: string;
          language_code?: string;
          last_synced_at?: string | null;
          meta_template_id?: string | null;
          parameter_count?: number | null;
          status?: string;
          template_category?: string;
          template_name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      whatsapp_users: {
        Row: {
          created_at: string | null;
          first_message_at: string | null;
          id: string;
          is_linked: boolean | null;
          language_code: string | null;
          last_activity_at: string | null;
          message_count: number | null;
          onboarding_step: string | null;
          pending_email: string | null;
          updated_at: string | null;
          user_id: string | null;
          whatsapp_name: string | null;
          whatsapp_phone: string;
        };
        Insert: {
          created_at?: string | null;
          first_message_at?: string | null;
          id?: string;
          is_linked?: boolean | null;
          language_code?: string | null;
          last_activity_at?: string | null;
          message_count?: number | null;
          onboarding_step?: string | null;
          pending_email?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          whatsapp_name?: string | null;
          whatsapp_phone: string;
        };
        Update: {
          created_at?: string | null;
          first_message_at?: string | null;
          id?: string;
          is_linked?: boolean | null;
          language_code?: string | null;
          last_activity_at?: string | null;
          message_count?: number | null;
          onboarding_step?: string | null;
          pending_email?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          whatsapp_name?: string | null;
          whatsapp_phone?: string;
        };
        Relationships: [
          {
            foreignKeyName: "whatsapp_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "whatsapp_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_active_users_with_calendar";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "whatsapp_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "v_user_conversation_stats";
            referencedColumns: ["user_id"];
          },
        ];
      };
    };
    Views: {
      newsletter_subscriptions_view: {
        Row: {
          created_at: string | null;
          email: string | null;
          id: string | null;
          ip_address: string | null;
          source: string | null;
          status: string | null;
          subscribed_at: string | null;
          unsubscribed_at: string | null;
          updated_at: string | null;
          user_agent: string | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          id?: string | null;
          ip_address?: string | null;
          source?: string | null;
          status?: string | null;
          subscribed_at?: string | null;
          unsubscribed_at?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          id?: string | null;
          ip_address?: string | null;
          source?: string | null;
          status?: string | null;
          subscribed_at?: string | null;
          unsubscribed_at?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      referrals_view: {
        Row: {
          converted_at: string | null;
          created_at: string | null;
          expires_at: string | null;
          id: string | null;
          referral_code: string | null;
          referred_email: string | null;
          referred_id: string | null;
          referrer_email: string | null;
          referrer_id: string | null;
          reward_amount: number | null;
          reward_claimed_at: string | null;
          reward_type: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          converted_at?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string | null;
          referral_code?: never;
          referred_email?: never;
          referred_id?: string | null;
          referrer_email?: string | null;
          referrer_id?: string | null;
          reward_amount?: number | null;
          reward_claimed_at?: string | null;
          reward_type?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          converted_at?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string | null;
          referral_code?: never;
          referred_email?: never;
          referred_id?: string | null;
          referrer_email?: string | null;
          referrer_id?: string | null;
          reward_amount?: number | null;
          reward_claimed_at?: string | null;
          reward_type?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      team_invites_view: {
        Row: {
          accepted_at: string | null;
          created_at: string | null;
          expires_at: string | null;
          id: string | null;
          invite_token: string | null;
          invitee_email: string | null;
          invitee_id: string | null;
          inviter_email: string | null;
          inviter_id: string | null;
          message: string | null;
          role: string | null;
          status: string | null;
          team_name: string | null;
          updated_at: string | null;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string | null;
          invite_token?: string | null;
          invitee_email?: string | null;
          invitee_id?: string | null;
          inviter_email?: string | null;
          inviter_id?: string | null;
          message?: never;
          role?: never;
          status?: string | null;
          team_name?: never;
          updated_at?: string | null;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          id?: string | null;
          invite_token?: string | null;
          invitee_email?: string | null;
          invitee_id?: string | null;
          inviter_email?: string | null;
          inviter_id?: string | null;
          message?: never;
          role?: never;
          status?: string | null;
          team_name?: never;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      v_active_users_with_calendar: {
        Row: {
          display_name: string | null;
          email: string | null;
          primary_calendar_id: string | null;
          primary_calendar_name: string | null;
          timezone: string | null;
          token_expires_at: string | null;
          token_valid: boolean | null;
          user_id: string | null;
        };
        Relationships: [];
      };
      v_user_conversation_stats: {
        Row: {
          email: string | null;
          last_conversation_at: string | null;
          telegram_conversations: number | null;
          total_conversations: number | null;
          total_messages: number | null;
          user_id: string | null;
          web_conversations: number | null;
        };
        Relationships: [];
      };
      waiting_list_view: {
        Row: {
          created_at: string | null;
          email: string | null;
          id: string | null;
          invited_at: string | null;
          ip_address: string | null;
          name: string | null;
          notes: string | null;
          position: number | null;
          registered_at: string | null;
          source: string | null;
          status: string | null;
          updated_at: string | null;
          user_agent: string | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          id?: string | null;
          invited_at?: never;
          ip_address?: string | null;
          name?: string | null;
          notes?: never;
          position?: never;
          registered_at?: never;
          source?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          id?: string | null;
          invited_at?: never;
          ip_address?: string | null;
          name?: string | null;
          notes?: never;
          position?: never;
          registered_at?: never;
          source?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      check_trial_expirations: { Args: never; Returns: number };
      cleanup_expired_sessions: { Args: never; Returns: number };
      cleanup_expired_sessions_v2: { Args: never; Returns: number };
      cleanup_old_pending_gaps:
        | { Args: never; Returns: number }
        | { Args: { days_old?: number }; Returns: number };
      cleanup_old_pending_gaps_v2: {
        Args: { days_old?: number };
        Returns: number;
      };
      generate_invitation_token: { Args: never; Returns: string };
      generate_referral_code_v2: { Args: never; Returns: string };
      get_or_create_conversation:
        | {
            Args: {
              p_external_chat_id?: number;
              p_source: Database["public"]["Enums"]["conversation_source"];
              p_user_id: string;
            };
            Returns: string;
          }
        | {
            Args: {
              p_source?: Database["public"]["Enums"]["conversation_source"];
              p_telegram_chat_id?: number;
              p_user_id: string;
            };
            Returns: string;
          };
      match_conversation_embeddings: {
        Args: {
          match_count?: number;
          match_threshold?: number;
          match_user_id?: number;
          query_embedding: string;
        };
        Returns: {
          content: string;
          id: string;
          metadata: Json;
          similarity: number;
        }[];
      };
      match_conversation_embeddings_v2: {
        Args: {
          match_count?: number;
          match_threshold?: number;
          match_user_id: string;
          query_embedding: string;
        };
        Returns: {
          content: string;
          id: string;
          metadata: Json;
          similarity: number;
        }[];
      };
      match_conversation_embeddings_web:
        | {
            Args: {
              match_count?: number;
              p_user_id?: string;
              query_embedding: string;
            };
            Returns: {
              content: string;
              id: string;
              similarity: number;
            }[];
          }
        | {
            Args: {
              match_count?: number;
              match_threshold?: number;
              match_user_email: string;
              query_embedding: string;
            };
            Returns: {
              content: string;
              id: number;
              metadata: Json;
              similarity: number;
            }[];
          };
      match_event_embeddings: {
        Args: {
          match_count?: number;
          match_threshold?: number;
          match_user_id: string;
          query_embedding: string;
        };
        Returns: {
          content: string;
          id: number;
          metadata: Json;
          similarity: number;
        }[];
      };
      reset_subscription_usage: {
        Args: { p_subscription_id: string };
        Returns: undefined;
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
    };
    Enums: {
      calendar_access_role: "owner" | "writer" | "reader" | "freeBusyReader";
      conversation_source: "web" | "telegram" | "whatsapp" | "api";
      feature_flag_audit_action:
        | "created"
        | "updated"
        | "deleted"
        | "enabled"
        | "disabled"
        | "rollout_changed"
        | "tiers_changed"
        | "user_override_added"
        | "user_override_removed"
        | "environment_changed";
      feature_flag_environment:
        | "development"
        | "staging"
        | "production"
        | "all";
      gap_resolution_status:
        | "pending"
        | "filled"
        | "skipped"
        | "dismissed"
        | "expired";
      message_role: "user" | "assistant" | "system" | "tool";
      oauth_provider: "google" | "github" | "telegram" | "whatsapp";
      user_role: "user" | "admin" | "moderator" | "support";
      user_status: "active" | "inactive" | "suspended" | "pending_verification";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      calendar_access_role: ["owner", "writer", "reader", "freeBusyReader"],
      conversation_source: ["web", "telegram", "whatsapp", "api"],
      feature_flag_audit_action: [
        "created",
        "updated",
        "deleted",
        "enabled",
        "disabled",
        "rollout_changed",
        "tiers_changed",
        "user_override_added",
        "user_override_removed",
        "environment_changed",
      ],
      feature_flag_environment: ["development", "staging", "production", "all"],
      gap_resolution_status: [
        "pending",
        "filled",
        "skipped",
        "dismissed",
        "expired",
      ],
      message_role: ["user", "assistant", "system", "tool"],
      oauth_provider: ["google", "github", "telegram", "whatsapp"],
      user_role: ["user", "admin", "moderator", "support"],
      user_status: ["active", "inactive", "suspended", "pending_verification"],
    },
  },
} as const;
