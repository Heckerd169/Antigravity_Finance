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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      app_config: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      card_fragment_links: {
        Row: {
          card_id: string
          created_at: string
          fragment_id: string
          id: string
          month: string
          origin: Database["public"]["Enums"]["link_origin"]
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          fragment_id: string
          id?: string
          month: string
          origin: Database["public"]["Enums"]["link_origin"]
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          fragment_id?: string
          id?: string
          month?: string
          origin?: Database["public"]["Enums"]["link_origin"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_fragment_links_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_fragment_links_fragment_id_fkey"
            columns: ["fragment_id"]
            isOneToOne: true
            referencedRelation: "fragments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_fragment_links_fragment_id_fkey"
            columns: ["fragment_id"]
            isOneToOne: true
            referencedRelation: "fragments_with_status"
            referencedColumns: ["id"]
          },
        ]
      }
      card_monthly_states: {
        Row: {
          adjusted_amount: number | null
          adjustment_scope: string | null
          card_id: string
          closed_at: string | null
          created_at: string
          id: string
          manually_paid: boolean
          month: string
          updated_at: string
          user_id: string
        }
        Insert: {
          adjusted_amount?: number | null
          adjustment_scope?: string | null
          card_id: string
          closed_at?: string | null
          created_at?: string
          id?: string
          manually_paid?: boolean
          month: string
          updated_at?: string
          user_id: string
        }
        Update: {
          adjusted_amount?: number | null
          adjustment_scope?: string | null
          card_id?: string
          closed_at?: string | null
          created_at?: string
          id?: string
          manually_paid?: boolean
          month?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_monthly_states_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_planned_timeline: {
        Row: {
          card_id: string
          created_at: string
          effective_month: string
          id: string
          planned_amount: number
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          effective_month: string
          id?: string
          planned_amount: number
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          effective_month?: string
          id?: string
          planned_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_planned_timeline_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          attribution: Database["public"]["Enums"]["card_attribution"]
          created_at: string
          deleted_at: string | null
          first_active_month: string
          frequency: Database["public"]["Enums"]["card_frequency"]
          id: string
          last_active_month: string | null
          name: string
          type: Database["public"]["Enums"]["card_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          attribution: Database["public"]["Enums"]["card_attribution"]
          created_at?: string
          deleted_at?: string | null
          first_active_month: string
          frequency: Database["public"]["Enums"]["card_frequency"]
          id?: string
          last_active_month?: string | null
          name: string
          type: Database["public"]["Enums"]["card_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          attribution?: Database["public"]["Enums"]["card_attribution"]
          created_at?: string
          deleted_at?: string | null
          first_active_month?: string
          frequency?: Database["public"]["Enums"]["card_frequency"]
          id?: string
          last_active_month?: string | null
          name?: string
          type?: Database["public"]["Enums"]["card_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deleted_entities: {
        Row: {
          created_at: string
          deleted_at: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["deleted_entity_type"]
          expires_at: string
          id: string
          payload: Json
          restored_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string
          entity_id: string
          entity_type: Database["public"]["Enums"]["deleted_entity_type"]
          expires_at: string
          id?: string
          payload: Json
          restored_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["deleted_entity_type"]
          expires_at?: string
          id?: string
          payload?: Json
          restored_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fragments: {
        Row: {
          amount: number
          confidence: number | null
          created_at: string
          description: string
          hash: string
          id: string
          imported_at: string
          suggested_card_id: string | null
          transaction_date: string
          user_id: string
        }
        Insert: {
          amount: number
          confidence?: number | null
          created_at?: string
          description: string
          hash: string
          id?: string
          imported_at?: string
          suggested_card_id?: string | null
          transaction_date: string
          user_id: string
        }
        Update: {
          amount?: number
          confidence?: number | null
          created_at?: string
          description?: string
          hash?: string
          id?: string
          imported_at?: string
          suggested_card_id?: string | null
          transaction_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fragments_suggested_card_id_fkey"
            columns: ["suggested_card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      income_timeline: {
        Row: {
          created_at: string
          effective_month: string
          gross_annual: number
          id: string
          net_monthly: number
          person: Database["public"]["Enums"]["person_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          effective_month: string
          gross_annual: number
          id?: string
          net_monthly: number
          person: Database["public"]["Enums"]["person_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          effective_month?: string
          gross_annual?: number
          id?: string
          net_monthly?: number
          person?: Database["public"]["Enums"]["person_role"]
          user_id?: string
        }
        Relationships: []
      }
      net_estimation_brackets: {
        Row: {
          gross_annual_max: number | null
          gross_annual_min: number
          id: string
          net_factor: number
          notes: string | null
          tax_class: number
          tax_year: number
        }
        Insert: {
          gross_annual_max?: number | null
          gross_annual_min: number
          id?: string
          net_factor: number
          notes?: string | null
          tax_class: number
          tax_year: number
        }
        Update: {
          gross_annual_max?: number | null
          gross_annual_min?: number
          id?: string
          net_factor?: number
          notes?: string | null
          tax_class?: number
          tax_year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          onboarded_at: string | null
          partner_name: string | null
          tax_class: number | null
          tax_year: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          onboarded_at?: string | null
          partner_name?: string | null
          tax_class?: number | null
          tax_year?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          onboarded_at?: string | null
          partner_name?: string | null
          tax_class?: number | null
          tax_year?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      fragments_with_status: {
        Row: {
          amount: number | null
          assigned_card_id: string | null
          assigned_month: string | null
          confidence: number | null
          created_at: string | null
          description: string | null
          hash: string | null
          id: string | null
          imported_at: string | null
          status: string | null
          suggested_card_id: string | null
          transaction_date: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_fragment_links_card_id_fkey"
            columns: ["assigned_card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fragments_suggested_card_id_fkey"
            columns: ["suggested_card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      amount_match: {
        Args: { p_fragment_amount: number; p_planned_amount: number }
        Returns: number
      }
      calculate_card_amount_for_month: {
        Args: { p_card_id: string; p_month: string }
        Returns: number
      }
      calculate_match_confidence: {
        Args: { p_card_id: string; p_fragment_id: string }
        Returns: number
      }
      calculate_planned_sparrate_for_month: {
        Args: { p_month: string; p_user_id: string }
        Returns: number
      }
      calculate_sparrate_for_month: {
        Args: { p_month: string; p_user_id: string }
        Returns: number
      }
      estimate_net_monthly: {
        Args: {
          p_gross_annual: number
          p_tax_class: number
          p_tax_year: number
        }
        Returns: number
      }
      frequency_match: {
        Args: { p_card_id: string; p_transaction_date: string }
        Returns: number
      }
      get_net_monthly_for_month: {
        Args: {
          p_month: string
          p_person: Database["public"]["Enums"]["person_role"]
          p_user_id: string
        }
        Returns: number
      }
      get_planned_amount_for_month: {
        Args: { p_card_id: string; p_month: string }
        Returns: number
      }
      get_split_factor: {
        Args: { p_month: string; p_user_id: string }
        Returns: number
      }
      is_card_active_in_month: {
        Args: { p_card_id: string; p_month: string }
        Returns: boolean
      }
      name_similarity: {
        Args: { p_card_name: string; p_description: string }
        Returns: number
      }
      restore_deletion: { Args: { p_id: string }; Returns: boolean }
      schedule_deletion: {
        Args: {
          p_entity_id: string
          p_entity_type: Database["public"]["Enums"]["deleted_entity_type"]
          p_payload: Json
        }
        Returns: string
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      card_attribution: "ICH" | "GEMEINSAM"
      card_frequency: "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "ANNUAL" | "ONCE"
      card_type: "FIXED_COST" | "BUDGET" | "INCOME"
      deleted_entity_type:
        | "CARD_END"
        | "CARD"
        | "CARD_FRAGMENT_LINK"
        | "FRAGMENT"
      link_origin: "AUTO_ABSORBED" | "MANUAL_DROP"
      person_role: "ICH" | "PARTNER"
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
      card_attribution: ["ICH", "GEMEINSAM"],
      card_frequency: ["MONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL", "ONCE"],
      card_type: ["FIXED_COST", "BUDGET", "INCOME"],
      deleted_entity_type: [
        "CARD_END",
        "CARD",
        "CARD_FRAGMENT_LINK",
        "FRAGMENT",
      ],
      link_origin: ["AUTO_ABSORBED", "MANUAL_DROP"],
      person_role: ["ICH", "PARTNER"],
    },
  },
} as const
