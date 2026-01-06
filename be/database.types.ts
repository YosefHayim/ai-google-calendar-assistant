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
      agent_sessions: {
        Row: {
          agent_name: string
          context: Json | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          items: Json | null
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_name: string
          context?: Json | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          items?: Json | null
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_name?: string
          context?: Json | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          items?: Json | null
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string | null
          status: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      conversation_embeddings: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          embedding: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          source: Database["public"]["Enums"]["conversation_source"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          source?: Database["public"]["Enums"]["conversation_source"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          embedding?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          source?: Database["public"]["Enums"]["conversation_source"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_embeddings_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_embeddings_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "conversation_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_embeddings_new_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_embeddings_new_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users_with_calendar"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversation_embeddings_new_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_billing_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversation_embeddings_new_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_conversation_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
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
      conversation_summaries: {
        Row: {
          conversation_id: string
          created_at: string
          first_message_sequence: number
          id: string
          last_message_sequence: number
          message_count: number
          metadata: Json | null
          summary_text: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          first_message_sequence: number
          id?: string
          last_message_sequence: number
          message_count: number
          metadata?: Json | null
          summary_text: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          first_message_sequence?: number
          id?: string
          last_message_sequence?: number
          message_count?: number
          metadata?: Json | null
          summary_text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_summaries_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_summaries_new_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_summaries_new_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users_with_calendar"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversation_summaries_new_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_billing_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversation_summaries_new_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_conversation_stats"
            referencedColumns: ["user_id"]
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
          source?: Database["public"]["Enums"]["conversation_source"]
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_packs: {
        Row: {
          created_at: string | null
          credits_purchased: number
          credits_remaining: number
          expires_at: string | null
          id: string
          price_cents: number
          purchased_at: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_purchased: number
          credits_remaining: number
          expires_at?: string | null
          id?: string
          price_cents: number
          purchased_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_purchased?: number
          credits_remaining?: number
          expires_at?: string | null
          id?: string
          price_cents?: number
          purchased_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_packs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_packs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users_with_calendar"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "credit_packs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_billing_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "credit_packs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_conversation_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      gap_candidates: {
        Row: {
          confidence_score: number | null
          created_at: string
          detected_at: string
          duration_ms: number
          end_time: string
          following_event_calendar_id: string | null
          following_event_id: string
          following_event_summary: string | null
          id: string
          inferred_context: Json | null
          preceding_event_calendar_id: string | null
          preceding_event_id: string
          preceding_event_summary: string | null
          resolution_data: Json | null
          resolution_status:
            | Database["public"]["Enums"]["gap_resolution_status"]
            | null
          resolved_at: string | null
          resolved_event_id: string | null
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          detected_at?: string
          duration_ms: number
          end_time: string
          following_event_calendar_id?: string | null
          following_event_id: string
          following_event_summary?: string | null
          id?: string
          inferred_context?: Json | null
          preceding_event_calendar_id?: string | null
          preceding_event_id: string
          preceding_event_summary?: string | null
          resolution_data?: Json | null
          resolution_status?:
            | Database["public"]["Enums"]["gap_resolution_status"]
            | null
          resolved_at?: string | null
          resolved_event_id?: string | null
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          detected_at?: string
          duration_ms?: number
          end_time?: string
          following_event_calendar_id?: string | null
          following_event_id?: string
          following_event_summary?: string | null
          id?: string
          inferred_context?: Json | null
          preceding_event_calendar_id?: string | null
          preceding_event_id?: string
          preceding_event_summary?: string | null
          resolution_data?: Json | null
          resolution_status?:
            | Database["public"]["Enums"]["gap_resolution_status"]
            | null
          resolved_at?: string | null
          resolved_event_id?: string | null
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gap_recovery_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean | null
          max_gap_minutes: number | null
          min_gap_minutes: number | null
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          max_gap_minutes?: number | null
          min_gap_minutes?: number | null
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          max_gap_minutes?: number | null
          min_gap_minutes?: number | null
          settings?: Json
          updated_at?: string
          user_id?: string
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
            referencedRelation: "v_user_billing_summary"
            referencedColumns: ["user_id"]
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
      payment_history: {
        Row: {
          amount_cents: number
          created_at: string | null
          credit_pack_id: string | null
          currency: string | null
          description: string | null
          id: string
          invoice_url: string | null
          receipt_url: string | null
          refund_reason: string | null
          refunded_amount_cents: number | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          stripe_charge_id: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          credit_pack_id?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          invoice_url?: string | null
          receipt_url?: string | null
          refund_reason?: string | null
          refunded_amount_cents?: number | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          credit_pack_id?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          invoice_url?: string | null
          receipt_url?: string | null
          refund_reason?: string | null
          refunded_amount_cents?: number | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_charge_id?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_credit_pack_id_fkey"
            columns: ["credit_pack_id"]
            isOneToOne: false
            referencedRelation: "credit_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "v_active_subscriptions"
            referencedColumns: ["subscription_id"]
          },
          {
            foreignKeyName: "payment_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users_with_calendar"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_billing_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_history_user_id_fkey"
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
      stripe_webhook_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
          processed_at: string | null
          retry_count: number | null
          stripe_event_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
          retry_count?: number | null
          stripe_event_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
          retry_count?: number | null
          stripe_event_id?: string
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
            referencedRelation: "v_user_billing_summary"
            referencedColumns: ["user_id"]
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
            referencedRelation: "v_user_billing_summary"
            referencedColumns: ["user_id"]
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
      usage_records: {
        Row: {
          action_type: string
          id: string
          metadata: Json | null
          period_end: string
          period_start: string
          quantity: number | null
          recorded_at: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          id?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          quantity?: number | null
          recorded_at?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          quantity?: number | null
          recorded_at?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "v_active_subscriptions"
            referencedColumns: ["subscription_id"]
          },
          {
            foreignKeyName: "usage_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users_with_calendar"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "usage_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_billing_summary"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "usage_records_user_id_fkey"
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
            referencedRelation: "v_user_billing_summary"
            referencedColumns: ["user_id"]
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
      user_preferences: {
        Row: {
          category: string | null
          created_at: string
          id: string
          preference_key: string
          preference_value: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          preference_key: string
          preference_value: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          preference_key?: string
          preference_value?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          status?: Database["public"]["Enums"]["user_status"] | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
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
            referencedRelation: "v_user_billing_summary"
            referencedColumns: ["user_id"]
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
      v_pending_gaps_summary: {
        Row: {
          avg_confidence: number | null
          earliest_gap: string | null
          latest_gap: string | null
          pending_count: number | null
          total_minutes_untracked: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_user_billing_summary: {
        Row: {
          credit_packs_purchased: number | null
          current_plan: string | null
          current_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          email: string | null
          total_credits_remaining: number | null
          total_paid_cents: number | null
          total_subscriptions: number | null
          user_id: string | null
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
      match_user_preference_embeddings: {
        Args: {
          match_count?: number
          match_preference_type?: string
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
      record_usage: {
        Args: { p_action_type: string; p_quantity?: number; p_user_id: string }
        Returns: boolean
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
      user_status: ["active", "inactive", "suspended", "pending_verification"],
    },
  },
} as const
