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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chatbot_rate_limits: {
        Row: {
          created_at: string
          id: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          identifier: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      eglise_announcements: {
        Row: {
          announcement_type: string
          author_id: string
          church_id: string
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          announcement_type?: string
          author_id: string
          church_id: string
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          announcement_type?: string
          author_id?: string
          church_id?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      eglise_chat_conversations: {
        Row: {
          created_at: string
          id: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      eglise_chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "eglise_chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      eglise_chatbot_rate_limits: {
        Row: {
          created_at: string
          id: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          identifier: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      eglise_church_donations: {
        Row: {
          amount: number
          church_id: string
          created_at: string
          currency: string | null
          donation_type: string | null
          donor_email: string | null
          donor_name: string
          donor_phone: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          church_id: string
          created_at?: string
          currency?: string | null
          donation_type?: string | null
          donor_email?: string | null
          donor_name: string
          donor_phone?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          church_id?: string
          created_at?: string
          currency?: string | null
          donation_type?: string | null
          donor_email?: string | null
          donor_name?: string
          donor_phone?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "church_donations_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "eglise_churches"
            referencedColumns: ["id"]
          },
        ]
      }
      eglise_churches: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      eglise_contact_messages: {
        Row: {
          appointment_date: string | null
          company: string | null
          contact_type: string | null
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          phone: string | null
          preferred_contact: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          appointment_date?: string | null
          company?: string | null
          contact_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          preferred_contact?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          appointment_date?: string | null
          company?: string | null
          contact_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          preferred_contact?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      eglise_donations: {
        Row: {
          amount: number
          campaign: string | null
          created_at: string
          currency: string | null
          donor_email: string
          donor_name: string
          donor_phone: string | null
          id: string
          message: string | null
          payment_method: string | null
          payment_status: string | null
          paystack_reference: string
          paystack_transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          campaign?: string | null
          created_at?: string
          currency?: string | null
          donor_email: string
          donor_name: string
          donor_phone?: string | null
          id?: string
          message?: string | null
          payment_method?: string | null
          payment_status?: string | null
          paystack_reference: string
          paystack_transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          campaign?: string | null
          created_at?: string
          currency?: string | null
          donor_email?: string
          donor_name?: string
          donor_phone?: string | null
          id?: string
          message?: string | null
          payment_method?: string | null
          payment_status?: string | null
          paystack_reference?: string
          paystack_transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      eglise_event_participants: {
        Row: {
          attendance_status: string | null
          event_id: string
          id: string
          participant_email: string | null
          participant_name: string
          participant_phone: string
          registration_date: string
        }
        Insert: {
          attendance_status?: string | null
          event_id: string
          id?: string
          participant_email?: string | null
          participant_name: string
          participant_phone: string
          registration_date?: string
        }
        Update: {
          attendance_status?: string | null
          event_id?: string
          id?: string
          participant_email?: string | null
          participant_name?: string
          participant_phone?: string
          registration_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "eglise_events"
            referencedColumns: ["id"]
          },
        ]
      }
      eglise_events: {
        Row: {
          church_id: string
          created_at: string
          description: string | null
          end_date: string | null
          event_type: string | null
          id: string
          location: string | null
          max_participants: number | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          church_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          church_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "eglise_churches"
            referencedColumns: ["id"]
          },
        ]
      }
      eglise_group_messages: {
        Row: {
          church_id: string
          created_at: string
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          church_id: string
          created_at?: string
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          church_id?: string
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: []
      }
      eglise_knowledge_base: {
        Row: {
          content: string
          created_at: string
          entry_type: string
          id: string
          tags: string[] | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          entry_type: string
          id?: string
          tags?: string[] | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          entry_type?: string
          id?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      eglise_members: {
        Row: {
          address: string | null
          baptism_date: string | null
          birth_date: string | null
          church_id: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          membership_status: string | null
          notes: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          baptism_date?: string | null
          birth_date?: string | null
          church_id: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          membership_status?: string | null
          notes?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          baptism_date?: string | null
          birth_date?: string | null
          church_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          membership_status?: string | null
          notes?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "eglise_churches"
            referencedColumns: ["id"]
          },
        ]
      }
      eglise_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      "eglise_OLCAP-CI_message": {
        Row: {
          appointment_date: string | null
          company: string | null
          contact_type: string | null
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          phone: string | null
          preferred_contact: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          appointment_date?: string | null
          company?: string | null
          contact_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          preferred_contact?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          appointment_date?: string | null
          company?: string | null
          contact_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          preferred_contact?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      eglise_participants_secure: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      eglise_profiles: {
        Row: {
          avatar_url: string | null
          church_id: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          church_id?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          church_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "eglise_churches"
            referencedColumns: ["id"]
          },
        ]
      }
      eglise_tradlog_contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          phone: string
          status: string | null
          subject: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          phone: string
          status?: string | null
          subject?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      eglise_user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      get_user_church: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
