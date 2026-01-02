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
      calendar_categories: {
        Row: {
          access_role: string | null
          calendar_id: string | null
          calendar_name: string | null
          created_at: string
          default_reminders: Json | null
          email: string | null
          id: number
          time_zone_of_calendar: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_role?: string | null
          calendar_id?: string | null
          calendar_name?: string | null
          created_at?: string
          default_reminders?: Json | null
          email?: string | null
          id?: number
          time_zone_of_calendar?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_role?: string | null
          calendar_id?: string | null
          calendar_name?: string | null
          created_at?: string
          default_reminders?: Json | null
          email?: string | null
          id?: number
          time_zone_of_calendar?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      conversation_embeddings: {
        Row: {
          chat_id: number | null
          content: string
          created_at: string
          embedding: string | null
          id: number
          message_id: number | null
          metadata: Json | null
          source: string | null
          update_at: string | null
          user_id: number | null
        }
        Insert: {
          chat_id?: number | null
          content: string
          created_at?: string
          embedding?: string | null
          id?: number
          message_id?: number | null
          metadata?: Json | null
          source?: string | null
          update_at?: string | null
          user_id?: number | null
        }
        Update: {
          chat_id?: number | null
          content?: string
          created_at?: string
          embedding?: string | null
          id?: number
          message_id?: number | null
          metadata?: Json | null
          source?: string | null
          update_at?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_embeddings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_telegram_links"
            referencedColumns: ["telegram_user_id"]
          },
        ]
      }
      conversation_state: {
        Row: {
          chat_id: number | null
          context_window: Json | null
          created_at: string
          id: number
          last_message_id: number | null
          last_summarized_at: string | null
          message_count: number
          metadata: Json | null
          source: string | null
          telegram_user_id: number | null
          update_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chat_id?: number | null
          context_window?: Json | null
          created_at?: string
          id?: number
          last_message_id?: number | null
          last_summarized_at?: string | null
          message_count?: number
          metadata?: Json | null
          source?: string | null
          telegram_user_id?: number | null
          update_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chat_id?: number | null
          context_window?: Json | null
          created_at?: string
          id?: number
          last_message_id?: number | null
          last_summarized_at?: string | null
          message_count?: number
          metadata?: Json | null
          source?: string | null
          telegram_user_id?: number | null
          update_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_state_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "user_telegram_links"
            referencedColumns: ["chat_id"]
          },
          {
            foreignKeyName: "conversation_state_telegram_user_id_fkey"
            columns: ["telegram_user_id"]
            isOneToOne: false
            referencedRelation: "user_telegram_links"
            referencedColumns: ["telegram_user_id"]
          },
        ]
      }
      conversation_summaries: {
        Row: {
          chat_id: number
          created_at: string
          first_message_id: number
          id: number
          last_message_id: number
          message_count: number
          metadata: Json | null
          source: string | null
          summary_text: string
          telegram_user_id: number | null
          update_at: string | null
          user_id: string | null
        }
        Insert: {
          chat_id: number
          created_at?: string
          first_message_id: number
          id?: number
          last_message_id: number
          message_count: number
          metadata?: Json | null
          source?: string | null
          summary_text: string
          telegram_user_id?: number | null
          update_at?: string | null
          user_id?: string | null
        }
        Update: {
          chat_id?: number
          created_at?: string
          first_message_id?: number
          id?: number
          last_message_id?: number
          message_count?: number
          metadata?: Json | null
          source?: string | null
          summary_text?: string
          telegram_user_id?: number | null
          update_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_summaries_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "user_telegram_links"
            referencedColumns: ["chat_id"]
          },
          {
            foreignKeyName: "conversation_summaries_telegram_user_id_fkey"
            columns: ["telegram_user_id"]
            isOneToOne: false
            referencedRelation: "user_telegram_links"
            referencedColumns: ["telegram_user_id"]
          },
        ]
      }
      user_calendar_tokens: {
        Row: {
          access_token: string | null
          created_at: string
          email: string | null
          expiry_date: number | null
          id: number
          id_token: string | null
          is_active: boolean | null
          refresh_token: string | null
          refresh_token_expires_in: number | null
          scope: string | null
          source: string | null
          timezone: string | null
          token_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          email?: string | null
          expiry_date?: number | null
          id?: number
          id_token?: string | null
          is_active?: boolean | null
          refresh_token?: string | null
          refresh_token_expires_in?: number | null
          scope?: string | null
          source?: string | null
          timezone?: string | null
          token_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          email?: string | null
          expiry_date?: number | null
          id?: number
          id_token?: string | null
          is_active?: boolean | null
          refresh_token?: string | null
          refresh_token_expires_in?: number | null
          scope?: string | null
          source?: string | null
          timezone?: string | null
          token_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_telegram_links: {
        Row: {
          chat_id: number | null
          created_at: string
          email: string | null
          first_name: string | null
          id: number
          language_code: string | null
          telegram_user_id: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          chat_id?: number | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: number
          language_code?: string | null
          telegram_user_id?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          chat_id?: number | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: number
          language_code?: string | null
          telegram_user_id?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_telegram_links_email_fkey"
            columns: ["email"]
            isOneToOne: true
            referencedRelation: "user_calendar_tokens"
            referencedColumns: ["email"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_conversation_embeddings: {
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
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
