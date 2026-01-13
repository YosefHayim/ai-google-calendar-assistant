export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      conversation_messages: {
        Row: {
          completion_tokens: number | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          prompt_tokens: number | null
          role: Database["public"]["Enums"]["message_role"]
          sequence_number: number
          tool_call_id: string | null
          tool_calls: Json | null
        }
        Insert: {
          completion_tokens?: number | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          prompt_tokens?: number | null
          role: Database["public"]["Enums"]["message_role"]
          sequence_number: number
          tool_call_id?: string | null
          tool_calls?: Json | null
        }
        Update: {
          completion_tokens?: number | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          prompt_tokens?: number | null
          role?: Database["public"]["Enums"]["message_role"]
          sequence_number?: number
          tool_call_id?: string | null
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          archived_at: string | null
          created_at: string
          external_chat_id: number | null
          id: string
          is_active: boolean | null
          last_message_at: string | null
          message_count: number | null
          share_expires_at: string | null
          share_token: string | null
          source: Database["public"]["Enums"]["conversation_source"]
          summary: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          external_chat_id?: number | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          share_expires_at?: string | null
          share_token?: string | null
          source: Database["public"]["Enums"]["conversation_source"]
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          external_chat_id?: number | null
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          message_count?: number | null
          share_expires_at?: string | null
          share_token?: string | null
          source?: Database["public"]["Enums"]["conversation_source"]
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lemonsqueezy_webhook_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
          processed_at: string | null
          retry_count: number | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
          retry_count?: number | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
          retry_count?: number | null
        }
        Relationships: []
      }
      oauth_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: string
          id_token: string | null
          is_valid: boolean | null
          last_refreshed_at: string | null
          provider: Database["public"]["Enums"]["oauth_provider"]
          provider_user_id: string | null
          refresh_error_count: number | null
          refresh_token: string | null
          refresh_token_expires_at: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: string
          id_token?: string | null
          is_valid?: boolean | null
          last_refreshed_at?: string | null
          provider: Database["public"]["Enums"]["oauth_provider"]
          provider_user_id?: string | null
          refresh_error_count?: number | null
          refresh_token?: string | null
          refresh_token_expires_at?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          id_token?: string | null
          is_valid?: boolean | null
          last_refreshed_at?: string | null
          provider?: Database["public"]["Enums"]["oauth_provider"]
          provider_user_id?: string | null
          refresh_error_count?: number | null
          refresh_token?: string | null
          refresh_token_expires_at?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users_with_calendar"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "oauth_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_admin_user_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_conversation_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      plans: {
        Row: {
          action_pack_size: number | null
          ai_interactions_monthly: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_highlighted: boolean | null
          is_popular: boolean | null
          lemonsqueezy_product_id: string | null
          lemonsqueezy_variant_id_monthly: string | null
          lemonsqueezy_variant_id_yearly: string | null
          name: string
          price_monthly_cents: number | null
          price_per_use_cents: number | null
          price_yearly_cents: number | null
          slug: string
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          stripe_product_id: string | null
          updated_at: string | null
        }
        Insert: {
          action_pack_size?: number | null
          ai_interactions_monthly?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_highlighted?: boolean | null
          is_popular?: boolean | null
          lemonsqueezy_product_id?: string | null
          lemonsqueezy_variant_id_monthly?: string | null
          lemonsqueezy_variant_id_yearly?: string | null
          name: string
          price_monthly_cents?: number | null
          price_per_use_cents?: number | null
          price_yearly_cents?: number | null
          slug: string
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          action_pack_size?: number | null
          ai_interactions_monthly?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_highlighted?: boolean | null
          is_popular?: boolean | null
          lemonsqueezy_product_id?: string | null
          lemonsqueezy_variant_id_monthly?: string | null
          lemonsqueezy_variant_id_yearly?: string | null
          name?: string
          price_monthly_cents?: number | null
          price_per_use_cents?: number | null
          price_yearly_cents?: number | null
          slug?: string
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      slack_users: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          is_linked: boolean | null
          last_activity_at: string | null
          pending_email: string | null
          slack_team_id: string
          slack_user_id: string
          slack_username: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_linked?: boolean | null
          last_activity_at?: string | null
          pending_email?: string | null
          slack_team_id: string
          slack_user_id: string
          slack_username?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_linked?: boolean | null
          last_activity_at?: string | null
          pending_email?: string | null
          slack_team_id?: string
          slack_user_id?: string
          slack_username?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slack_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slack_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users_with_calendar"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "slack_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_admin_user_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slack_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_conversation_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      slack_workspaces: {
        Row: {
          app_id: string | null
          authed_user_id: string | null
          bot_token: string
          bot_user_id: string | null
          created_at: string | null
          enterprise_id: string | null
          enterprise_name: string | null
          id: string
          installed_at: string | null
          installed_by_user_id: string | null
          is_active: boolean | null
          is_enterprise_install: boolean | null
          scope: string | null
          team_id: string
          team_name: string | null
          updated_at: string | null
          webhook_channel: string | null
          webhook_channel_id: string | null
          webhook_configuration_url: string | null
          webhook_url: string | null
        }
        Insert: {
          app_id?: string | null
          authed_user_id?: string | null
          bot_token: string
          bot_user_id?: string | null
          created_at?: string | null
          enterprise_id?: string | null
          enterprise_name?: string | null
          id?: string
          installed_at?: string | null
          installed_by_user_id?: string | null
          is_active?: boolean | null
          is_enterprise_install?: boolean | null
          scope?: string | null
          team_id: string
          team_name?: string | null
          updated_at?: string | null
          webhook_channel?: string | null
          webhook_channel_id?: string | null
          webhook_configuration_url?: string | null
          webhook_url?: string | null
        }
        Update: {
          app_id?: string | null
          authed_user_id?: string | null
          bot_token?: string
          bot_user_id?: string | null
          created_at?: string | null
          enterprise_id?: string | null
          enterprise_name?: string | null
          id?: string
          installed_at?: string | null
          installed_by_user_id?: string | null
          is_active?: boolean | null
          is_enterprise_install?: boolean | null
          scope?: string | null
          team_id?: string
          team_name?: string | null
          updated_at?: string | null
          webhook_channel?: string | null
          webhook_channel_id?: string | null
          webhook_configuration_url?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          ai_interactions_used: number | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          cancellation_reason: string | null
          created_at: string | null
          credits_remaining: number | null
          current_period_end: string | null
          current_period_start: string | null
          first_payment_at: string | null
          id: string
          interval: Database["public"]["Enums"]["plan_interval"] | null
          lemonsqueezy_customer_id: string | null
          lemonsqueezy_subscription_id: string | null
          lemonsqueezy_variant_id: string | null
          metadata: Json | null
          money_back_eligible_until: string | null
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_interactions_used?: number | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          credits_remaining?: number | null
          current_period_end?: string | null
          current_period_start?: string | null
          first_payment_at?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["plan_interval"] | null
          lemonsqueezy_customer_id?: string | null
          lemonsqueezy_subscription_id?: string | null
          lemonsqueezy_variant_id?: string | null
          metadata?: Json | null
          money_back_eligible_until?: string | null
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_interactions_used?: number | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string | null
          credits_remaining?: number | null
          current_period_end?: string | null
          current_period_start?: string | null
          first_payment_at?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["plan_interval"] | null
          lemonsqueezy_customer_id?: string | null
          lemonsqueezy_subscription_id?: string | null
          lemonsqueezy_variant_id?: string | null
          metadata?: Json | null
          money_back_eligible_until?: string | null
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users_with_calendar"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_admin_user_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_conversation_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      telegram_users: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          is_bot: boolean | null
          is_linked: boolean | null
          language_code: string | null
          last_activity_at: string | null
          pending_email: string | null
          telegram_chat_id: number | null
          telegram_user_id: number
          telegram_username: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          is_bot?: boolean | null
          is_linked?: boolean | null
          language_code?: string | null
          last_activity_at?: string | null
          pending_email?: string | null
          telegram_chat_id?: number | null
          telegram_user_id: number
          telegram_username?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          is_bot?: boolean | null
          is_linked?: boolean | null
          language_code?: string | null
          last_activity_at?: string | null
          pending_email?: string | null
          telegram_chat_id?: number | null
          telegram_user_id?: number
          telegram_username?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users_with_calendar"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "telegram_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_admin_user_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_conversation_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_calendars: {
        Row: {
          access_role:
            | Database["public"]["Enums"]["calendar_access_role"]
            | null
          background_color: string | null
          calendar_id: string
          calendar_name: string | null
          created_at: string
          default_reminders: Json | null
          foreground_color: string | null
          id: string
          is_primary: boolean | null
          is_visible: boolean | null
          last_synced_at: string | null
          notification_enabled: boolean | null
          sync_token: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_role?:
            | Database["public"]["Enums"]["calendar_access_role"]
            | null
          background_color?: string | null
          calendar_id: string
          calendar_name?: string | null
          created_at?: string
          default_reminders?: Json | null
          foreground_color?: string | null
          id?: string
          is_primary?: boolean | null
          is_visible?: boolean | null
          last_synced_at?: string | null
          notification_enabled?: boolean | null
          sync_token?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_role?:
            | Database["public"]["Enums"]["calendar_access_role"]
            | null
          background_color?: string | null
          calendar_id?: string
          calendar_name?: string | null
          created_at?: string
          default_reminders?: Json | null
          foreground_color?: string | null
          id?: string
          is_primary?: boolean | null
          is_visible?: boolean | null
          last_synced_at?: string | null
          notification_enabled?: boolean | null
          sync_token?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_calendars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_calendars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users_with_calendar"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_calendars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_admin_user_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_calendars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_conversation_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          deactivated_at: string | null
          display_name: string | null
          email: string
          email_verified: boolean | null
          first_name: string | null
          id: string
          last_login_at: string | null
          last_name: string | null
          locale: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"] | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deactivated_at?: string | null
          display_name?: string | null
          email: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          last_login_at?: string | null
          last_name?: string | null
          locale?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deactivated_at?: string | null
          display_name?: string | null
          email?: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          last_login_at?: string | null
          last_name?: string | null
          locale?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_users: {
        Row: {
          created_at: string | null
          first_message_at: string | null
          id: string
          is_linked: boolean | null
          language_code: string | null
          last_activity_at: string | null
          message_count: number | null
          onboarding_step: string | null
          pending_email: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp_name: string | null
          whatsapp_phone: string
        }
        Insert: {
          created_at?: string | null
          first_message_at?: string | null
          id?: string
          is_linked?: boolean | null
          language_code?: string | null
          last_activity_at?: string | null
          message_count?: number | null
          onboarding_step?: string | null
          pending_email?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_name?: string | null
          whatsapp_phone: string
        }
        Update: {
          created_at?: string | null
          first_message_at?: string | null
          id?: string
          is_linked?: boolean | null
          language_code?: string | null
          last_activity_at?: string | null
          message_count?: number | null
          onboarding_step?: string | null
          pending_email?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_name?: string | null
          whatsapp_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users_with_calendar"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "whatsapp_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_admin_user_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_conversation_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      v_active_subscriptions: {
        Row: {
          ai_interactions_limit: number | null
          ai_interactions_remaining: number | null
          ai_interactions_used: number | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          display_name: string | null
          email: string | null
          first_payment_at: string | null
          interval: Database["public"]["Enums"]["plan_interval"] | null
          money_back_eligible_until: string | null
          plan_name: string | null
          plan_slug: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_created_at: string | null
          subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users_with_calendar"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_admin_user_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_conversation_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_active_users_with_calendar: {
        Row: {
          display_name: string | null
          email: string | null
          primary_calendar_id: string | null
          primary_calendar_name: string | null
          timezone: string | null
          token_expires_at: string | null
          token_valid: boolean | null
          user_id: string | null
        }
        Relationships: []
      }
      v_admin_user_list: {
        Row: {
          ai_interactions_used: number | null
          avatar_url: string | null
          created_at: string | null
          credits_remaining: number | null
          current_period_end: string | null
          display_name: string | null
          email: string | null
          email_verified: boolean | null
          first_name: string | null
          has_oauth_connected: boolean | null
          id: string | null
          last_name: string | null
          locale: string | null
          plan_name: string | null
          plan_slug: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          status: Database["public"]["Enums"]["user_status"] | null
          subscription_id: string | null
          subscription_interval:
            | Database["public"]["Enums"]["plan_interval"]
            | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          timezone: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_subscription_distribution: {
        Row: {
          percentage: number | null
          plan_name: string | null
          plan_slug: string | null
          subscriber_count: number | null
        }
        Relationships: []
      }
      v_user_conversation_stats: {
        Row: {
          email: string | null
          last_conversation_at: string | null
          telegram_conversations: number | null
          total_conversations: number | null
          total_messages: number | null
          user_id: string | null
          web_conversations: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_trial_expirations: { Args: never; Returns: number }
      check_user_access: {
        Args: { p_user_id: string }
        Returns: {
          credits_remaining: number
          has_access: boolean
          interactions_remaining: number
          money_back_eligible: boolean
          plan_name: string
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          trial_days_left: number
        }[]
      }
      cleanup_expired_sessions: { Args: never; Returns: number }
      cleanup_expired_sessions_v2: { Args: never; Returns: number }
      cleanup_old_pending_gaps:
        | { Args: never; Returns: number }
        | { Args: { days_old?: number }; Returns: number }
      cleanup_old_pending_gaps_v2: {
        Args: { days_old?: number }
        Returns: number
      }
      get_or_create_conversation:
        | {
            Args: {
              p_external_chat_id?: number
              p_source: Database["public"]["Enums"]["conversation_source"]
              p_user_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_source?: Database["public"]["Enums"]["conversation_source"]
              p_telegram_chat_id?: number
              p_user_id: string
            }
            Returns: string
          }
      match_conversation_embeddings: {
        Args: {
          match_count?: number
          match_threshold?: number
          match_user_id?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      match_conversation_embeddings_v2: {
        Args: {
          match_count?: number
          match_threshold?: number
          match_user_id: string
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      match_conversation_embeddings_web:
        | {
            Args: {
              match_count?: number
              p_user_id?: string
              query_embedding: string
            }
            Returns: {
              content: string
              id: string
              similarity: number
            }[]
          }
        | {
            Args: {
              match_count?: number
              match_threshold?: number
              match_user_email: string
              query_embedding: string
            }
            Returns: {
              content: string
              id: number
              metadata: Json
              similarity: number
            }[]
          }
      match_event_embeddings: {
        Args: {
          match_count?: number
          match_threshold?: number
          match_user_id: string
          query_embedding: string
        }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      reset_subscription_usage: {
        Args: { p_subscription_id: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      calendar_access_role: "owner" | "writer" | "reader" | "freeBusyReader"
      conversation_source: "web" | "telegram" | "whatsapp" | "api"
      gap_resolution_status:
        | "pending"
        | "filled"
        | "skipped"
        | "dismissed"
        | "expired"
      message_role: "user" | "assistant" | "system" | "tool"
      oauth_provider: "google" | "github" | "telegram" | "whatsapp"
      payment_status:
        | "pending"
        | "succeeded"
        | "failed"
        | "refunded"
        | "partially_refunded"
        | "disputed"
      plan_interval: "monthly" | "yearly" | "one_time"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired"
        | "paused"
      user_role: "user" | "admin" | "moderator" | "support"
      user_status: "active" | "inactive" | "suspended" | "pending_verification"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      calendar_access_role: ["owner", "writer", "reader", "freeBusyReader"],
      conversation_source: ["web", "telegram", "whatsapp", "api"],
      gap_resolution_status: [
        "pending",
        "filled",
        "skipped",
        "dismissed",
        "expired",
      ],
      message_role: ["user", "assistant", "system", "tool"],
      oauth_provider: ["google", "github", "telegram", "whatsapp"],
      payment_status: [
        "pending",
        "succeeded",
        "failed",
        "refunded",
        "partially_refunded",
        "disputed",
      ],
      plan_interval: ["monthly", "yearly", "one_time"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "unpaid",
        "incomplete",
        "incomplete_expired",
        "paused",
      ],
      user_role: ["user", "admin", "moderator", "support"],
      user_status: ["active", "inactive", "suspended", "pending_verification"],
    },
  },
} as const
