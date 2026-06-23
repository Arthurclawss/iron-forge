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
      leads: {
        Row: {
          best_contact_time: string | null
          created_at: string
          email: string
          goal: Database["public"]["Enums"]["lead_goal"]
          id: string
          ip_hash: string | null
          name: string
          notes: string | null
          phone: string
          source: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          best_contact_time?: string | null
          created_at?: string
          email: string
          goal?: Database["public"]["Enums"]["lead_goal"]
          id?: string
          ip_hash?: string | null
          name: string
          notes?: string | null
          phone: string
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          best_contact_time?: string | null
          created_at?: string
          email?: string
          goal?: Database["public"]["Enums"]["lead_goal"]
          id?: string
          ip_hash?: string | null
          name?: string
          notes?: string | null
          phone?: string
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      user_roles: {
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
      customers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          phone: string
          birth_date: string | null
          cpf: string | null
          plan: Database["public"]["Enums"]["customer_plan"]
          plan_start: string | null
          plan_end: string | null
          status: Database["public"]["Enums"]["customer_status"]
          monthly_value: number | null
          address_street: string | null
          address_city: string | null
          address_state: string | null
          address_zip: string | null
          goal: Database["public"]["Enums"]["lead_goal"] | null
          health_notes: string | null
          personal_trainer: string | null
          lead_id: string | null
          emergency_name: string | null
          emergency_phone: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          phone: string
          birth_date?: string | null
          cpf?: string | null
          plan?: Database["public"]["Enums"]["customer_plan"]
          plan_start?: string | null
          plan_end?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          monthly_value?: number | null
          address_street?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          goal?: Database["public"]["Enums"]["lead_goal"] | null
          health_notes?: string | null
          personal_trainer?: string | null
          lead_id?: string | null
          emergency_name?: string | null
          emergency_phone?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          phone?: string
          birth_date?: string | null
          cpf?: string | null
          plan?: Database["public"]["Enums"]["customer_plan"]
          plan_start?: string | null
          plan_end?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          monthly_value?: number | null
          address_street?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip?: string | null
          goal?: Database["public"]["Enums"]["lead_goal"] | null
          health_notes?: string | null
          personal_trainer?: string | null
          lead_id?: string | null
          emergency_name?: string | null
          emergency_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
      }
      lead_notes: {
        Row: {
          id: string
          created_at: string
          lead_id: string
          author_id: string
          body: string
        }
        Insert: {
          id?: string
          created_at?: string
          lead_id: string
          author_id: string
          body: string
        }
        Update: {
          id?: string
          created_at?: string
          lead_id?: string
          author_id?: string
          body?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          lead_id: string
          booking_time: string
          status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido'
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          lead_id: string
          booking_time: string
          status?: 'agendado' | 'confirmado' | 'cancelado' | 'concluido'
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          lead_id?: string
          booking_time?: string
          status?: 'agendado' | 'confirmado' | 'cancelado' | 'concluido'
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      lead_goal:
        | "emagrecimento"
        | "hipertrofia"
        | "performance"
        | "condicionamento"
        | "outro"
      lead_status:
        | "novo"
        | "contatado"
        | "interessado"
        | "matriculado"
        | "perdido"
      customer_plan: "spark" | "forge" | "legacy" | "outro"
      customer_status: "ativo" | "inativo" | "suspenso" | "cancelado"
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
      app_role: ["admin", "user"],
      lead_goal: [
        "emagrecimento",
        "hipertrofia",
        "performance",
        "condicionamento",
        "outro",
      ],
      lead_status: [
        "novo",
        "contatado",
        "interessado",
        "matriculado",
        "perdido",
      ],
    },
  },
} as const

// ---- Tipos adicionados manualmente para customers e lead_notes ----
// (rode `supabase gen types typescript` após aplicar a migration para substituir por tipos gerados)

export type CustomerPlan = "spark" | "forge" | "legacy" | "outro";
export type CustomerStatus = "ativo" | "inativo" | "suspenso" | "cancelado";
