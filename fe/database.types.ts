export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.4'
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
        Relationships: [
          {
            foreignKeyName: 'agent_sessions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'agent_sessions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_active_users_with_calendar'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'agent_sessions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_user_conversation_stats'
            referencedColumns: ['user_id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'audit_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_active_users_with_calendar'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'audit_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_user_conversation_stats'
            referencedColumns: ['user_id']
          },
        ]
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
          source: Database['public']['Enums']['conversation_source'] | null
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
          source?: Database['public']['Enums']['conversation_source'] | null
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
          source?: Database['public']['Enums']['conversation_source'] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'conversation_embeddings_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'conversation_embeddings_message_id_fkey'
            columns: ['message_id']
            isOneToOne: false
            referencedRelation: 'conversation_messages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'conversation_embeddings_new_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'conversation_embeddings_new_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_active_users_with_calendar'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'conversation_embeddings_new_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_user_conversation_stats'
            referencedColumns: ['user_id']
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
          role: Database['public']['Enums']['message_role']
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
          role: Database['public']['Enums']['message_role']
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
          role?: Database['public']['Enums']['message_role']
          sequence_number?: number
          tool_call_id?: string | null
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'conversation_messages_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'conversations'
            referencedColumns: ['id']
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
            foreignKeyName: 'conversation_summaries_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'conversation_summaries_new_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'conversation_summaries_new_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_active_users_with_calendar'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'conversation_summaries_new_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_user_conversation_stats'
            referencedColumns: ['user_id']
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
          source: Database['public']['Enums']['conversation_source']
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
          source: Database['public']['Enums']['conversation_source']
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
          source?: Database['public']['Enums']['conversation_source']
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'conversations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'conversations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_active_users_with_calendar'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'conversations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_user_conversation_stats'
            referencedColumns: ['user_id']
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
          resolution_status: Database['public']['Enums']['gap_resolution_status'] | null
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
          resolution_status?: Database['public']['Enums']['gap_resolution_status'] | null
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
          resolution_status?: Database['public']['Enums']['gap_resolution_status'] | null
          resolved_at?: string | null
          resolved_event_id?: string | null
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'gap_candidates_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'gap_candidates_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_active_users_with_calendar'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'gap_candidates_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_user_conversation_stats'
            referencedColumns: ['user_id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'gap_recovery_settings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'gap_recovery_settings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'v_active_users_with_calendar'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'gap_recovery_settings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'v_user_conversation_stats'
            referencedColumns: ['user_id']
          },
        ]
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
          provider: Database['public']['Enums']['oauth_provider']
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
          provider: Database['public']['Enums']['oauth_provider']
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
          provider?: Database['public']['Enums']['oauth_provider']
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
            foreignKeyName: 'oauth_tokens_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'oauth_tokens_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_active_users_with_calendar'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'oauth_tokens_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_user_conversation_stats'
            referencedColumns: ['user_id']
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
            foreignKeyName: 'telegram_users_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'telegram_users_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_active_users_with_calendar'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'telegram_users_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_user_conversation_stats'
            referencedColumns: ['user_id']
          },
        ]
      }
      user_calendars: {
        Row: {
          access_role: Database['public']['Enums']['calendar_access_role'] | null
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
          access_role?: Database['public']['Enums']['calendar_access_role'] | null
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
          access_role?: Database['public']['Enums']['calendar_access_role'] | null
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
            foreignKeyName: 'user_calendars_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_calendars_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_active_users_with_calendar'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'user_calendars_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_user_conversation_stats'
            referencedColumns: ['user_id']
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
        Relationships: [
          {
            foreignKeyName: 'user_preferences_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_preferences_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_active_users_with_calendar'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'user_preferences_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_user_conversation_stats'
            referencedColumns: ['user_id']
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
          status: Database['public']['Enums']['user_status'] | null
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
          status?: Database['public']['Enums']['user_status'] | null
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
          status?: Database['public']['Enums']['user_status'] | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
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
        Relationships: [
          {
            foreignKeyName: 'gap_candidates_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'gap_candidates_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_active_users_with_calendar'
            referencedColumns: ['user_id']
          },
          {
            foreignKeyName: 'gap_candidates_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'v_user_conversation_stats'
            referencedColumns: ['user_id']
          },
        ]
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
      cleanup_expired_sessions: { Args: never; Returns: number }
      cleanup_expired_sessions_v2: { Args: never; Returns: number }
      cleanup_old_pending_gaps: { Args: never; Returns: number } | { Args: { days_old?: number }; Returns: number }
      cleanup_old_pending_gaps_v2: {
        Args: { days_old?: number }
        Returns: number
      }
      get_or_create_conversation:
        | {
            Args: {
              p_external_chat_id?: number
              p_source: Database['public']['Enums']['conversation_source']
              p_user_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_source?: Database['public']['Enums']['conversation_source']
              p_telegram_chat_id?: number
              p_user_id: string
            }
            Returns: string
          }
      match_conversation_embeddings:
        | {
            Args: {
              match_count?: number
              p_source?: string
              p_telegram_user_id?: number
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
              match_count: number
              match_threshold: number
              match_user_id: number
              query_embedding: string
            }
            Returns: {
              content: string
              id: number
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
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { '': string }; Returns: string[] }
    }
    Enums: {
      calendar_access_role: 'owner' | 'writer' | 'reader' | 'freeBusyReader'
      conversation_source: 'web' | 'telegram' | 'whatsapp' | 'api'
      gap_resolution_status: 'pending' | 'filled' | 'skipped' | 'dismissed' | 'expired'
      message_role: 'user' | 'assistant' | 'system' | 'tool'
      oauth_provider: 'google' | 'github' | 'telegram' | 'whatsapp'
      user_status: 'active' | 'inactive' | 'suspended' | 'pending_verification'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      calendar_access_role: ['owner', 'writer', 'reader', 'freeBusyReader'],
      conversation_source: ['web', 'telegram', 'whatsapp', 'api'],
      gap_resolution_status: ['pending', 'filled', 'skipped', 'dismissed', 'expired'],
      message_role: ['user', 'assistant', 'system', 'tool'],
      oauth_provider: ['google', 'github', 'telegram', 'whatsapp'],
      user_status: ['active', 'inactive', 'suspended', 'pending_verification'],
    },
  },
} as const
