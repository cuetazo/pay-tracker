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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      budget_history: {
        Row: {
          archived_at: string
          categoryId: string
          exceeded: boolean
          excess_amount: number
          id: string
          interval: string
          limit_amount: number
          period_end: string
          period_start: string
          spent_amount: number
          userId: string
        }
        Insert: {
          archived_at?: string
          categoryId: string
          exceeded?: boolean
          excess_amount?: number
          id?: string
          interval: string
          limit_amount: number
          period_end: string
          period_start: string
          spent_amount?: number
          userId: string
        }
        Update: {
          archived_at?: string
          categoryId?: string
          exceeded?: boolean
          excess_amount?: number
          id?: string
          interval?: string
          limit_amount?: number
          period_end?: string
          period_start?: string
          spent_amount?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_history_categoryid_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
        ]
      }
      category: {
        Row: {
          color: string | null
          created_at: string | null
          current_spending: number
          description: string | null
          icon: string | null
          id: string
          limit_amount: number | null
          limit_interval: string | null
          name: string
          period_end: string
          period_start: string
          type: string | null
          userId: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          current_spending?: number
          description?: string | null
          icon?: string | null
          id?: string
          limit_amount?: number | null
          limit_interval?: string | null
          name: string
          period_end: string
          period_start: string
          type?: string | null
          userId: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          current_spending?: number
          description?: string | null
          icon?: string | null
          id?: string
          limit_amount?: number | null
          limit_interval?: string | null
          name?: string
          period_end?: string
          period_start?: string
          type?: string | null
          userId?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          current_month_spending: number | null
          email: string | null
          fullName: string | null
          id: string
          last_month_reset: string | null
          month_period_start: string
          monthly_income: number | null
          monthly_spending_limit: number | null
          onboarding_completed: boolean | null
          photo: string | null
          salary: number | null
          spending_limit: number | null
        }
        Insert: {
          created_at?: string | null
          current_month_spending?: number | null
          email?: string | null
          fullName?: string | null
          id: string
          last_month_reset?: string | null
          month_period_start: string
          monthly_income?: number | null
          monthly_spending_limit?: number | null
          onboarding_completed?: boolean | null
          photo?: string | null
          salary?: number | null
          spending_limit?: number | null
        }
        Update: {
          created_at?: string | null
          current_month_spending?: number | null
          email?: string | null
          fullName?: string | null
          id?: string
          last_month_reset?: string | null
          month_period_start?: string
          monthly_income?: number | null
          monthly_spending_limit?: number | null
          onboarding_completed?: boolean | null
          photo?: string | null
          salary?: number | null
          spending_limit?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number | null
          categoryId: string | null
          code: number | null
          created_at: string
          destinatary: string | null
          id: string
          origin: string | null
          type: string | null
          userId: string
        }
        Insert: {
          amount?: number | null
          categoryId?: string | null
          code?: number | null
          created_at?: string
          destinatary?: string | null
          id?: string
          origin?: string | null
          type?: string | null
          userId: string
        }
        Update: {
          amount?: number | null
          categoryId?: string | null
          code?: number | null
          created_at?: string
          destinatary?: string | null
          id?: string
          origin?: string | null
          type?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_categoryid_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_period_end: {
        Args: { interval_type: string; ref_date?: string }
        Returns: string
      }
      get_period_start: {
        Args: { interval_type: string; ref_date?: string }
        Returns: string
      }
      reset_expired_budgets: {
        Args: never
        Returns: {
          category_id: string
          category_name: string
          interval_type: string
          limit_amount: number
          old_spending: number
        }[]
      }
      reset_monthly_profile_spending: { Args: never; Returns: undefined }
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
