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
          user_id: string
        }
        Insert: {
          chat_id?: number | null
          content: string
          created_at?: string
          embedding?: string | null
          id?: number
          message_id?: number | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          chat_id?: number | null
          content?: string
          created_at?: string
          embedding?: string | null
          id?: number
          message_id?: number | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          chat_id: number
          content: string
          created_at: string
          id: number
          message_id: number
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          chat_id: number
          content: string
          created_at?: string
          id?: number
          message_id: number
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          chat_id?: number
          content?: string
          created_at?: string
          id?: number
          message_id?: number
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_state: {
        Row: {
          chat_id: number
          context_window: Json | null
          created_at: string
          id: number
          last_message_id: number | null
          last_summarized_at: string | null
          message_count: number
          metadata: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chat_id: number
          context_window?: Json | null
          created_at?: string
          id?: number
          last_message_id?: number | null
          last_summarized_at?: string | null
          message_count?: number
          metadata?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chat_id?: number
          context_window?: Json | null
          created_at?: string
          id?: number
          last_message_id?: number | null
          last_summarized_at?: string | null
          message_count?: number
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          summary_text: string
          user_id: string
        }
        Insert: {
          chat_id: number
          created_at?: string
          first_message_id: number
          id?: number
          last_message_id: number
          message_count: number
          metadata?: Json | null
          summary_text: string
          user_id: string
        }
        Update: {
          chat_id?: number
          created_at?: string
          first_message_id?: number
          id?: number
          last_message_id?: number
          message_count?: number
          metadata?: Json | null
          summary_text?: string
          user_id?: string
        }
        Relationships: []
      }
      event_embeddings: {
        Row: {
          calendar_id: string | null
          content: string
          created_at: string
          embedding: string | null
          event_id: string | null
          id: number
          metadata: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calendar_id?: string | null
          content: string
          created_at?: string
          embedding?: string | null
          event_id?: string | null
          id?: number
          metadata?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calendar_id?: string | null
          content?: string
          created_at?: string
          embedding?: string | null
          event_id?: string | null
          id?: number
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          token_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_calendars: {
        Row: {
          access_role: string
          background_color: string | null
          calendars: Json | null
          created_at: string
          default_reminders: Json | null
          description: string | null
          foreground_color: string | null
          id: number
          location: string | null
          time_zone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_role: string
          background_color?: string | null
          calendars?: Json | null
          created_at?: string
          default_reminders?: Json | null
          description?: string | null
          foreground_color?: string | null
          id?: number
          location?: string | null
          time_zone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_role?: string
          background_color?: string | null
          calendars?: Json | null
          created_at?: string
          default_reminders?: Json | null
          description?: string | null
          foreground_color?: string | null
          id?: number
          location?: string | null
          time_zone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preference_embeddings: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: number
          metadata: Json | null
          preference_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
          preference_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
          preference_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_routines: {
        Row: {
          confidence_score: number | null
          created_at: string
          frequency: number | null
          id: number
          last_observed_at: string | null
          metadata: Json | null
          pattern_data: Json
          routine_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          frequency?: number | null
          id?: number
          last_observed_at?: string | null
          metadata?: Json | null
          pattern_data: Json
          routine_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          frequency?: number | null
          id?: number
          last_observed_at?: string | null
          metadata?: Json | null
          pattern_data?: Json
          routine_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_schedule_statistics: {
        Row: {
          calculated_at: string
          created_at: string
          id: number
          period_end: string
          period_start: string
          period_type: string
          statistics: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          calculated_at?: string
          created_at?: string
          id?: number
          period_end: string
          period_start: string
          period_type: string
          statistics: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          calculated_at?: string
          created_at?: string
          id?: number
          period_end?: string
          period_start?: string
          period_type?: string
          statistics?: Json
          updated_at?: string
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
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_conversation_embeddings: {
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
