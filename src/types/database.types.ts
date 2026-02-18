export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appliances: {
        Row: {
          brand: string | null
          created_at: string | null
          expected_life: number | null
          id: string
          location: string | null
          model: string | null
          name: string
          notes: string | null
          photo_url: string | null
          purchase_date: string | null
          serial_number: string | null
          sku: string | null
          status: Database["public"]["Enums"]["appliance_status"] | null
          type: string | null
          updated_at: string | null
          user_id: string
          warranty_expiry: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          expected_life?: number | null
          id?: string
          location?: string | null
          model?: string | null
          name: string
          notes?: string | null
          photo_url?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          sku?: string | null
          status?: Database["public"]["Enums"]["appliance_status"] | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          warranty_expiry?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          expected_life?: number | null
          id?: string
          location?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          photo_url?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          sku?: string | null
          status?: Database["public"]["Enums"]["appliance_status"] | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          warranty_expiry?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          created_at: string | null
          id: string
          image_url: string | null
          location: string | null
          low_stock_threshold: number | null
          name: string
          notes: string | null
          sku: string | null
          stock: number | null
          unit_cost: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          low_stock_threshold?: number | null
          name: string
          notes?: string | null
          sku?: string | null
          stock?: number | null
          unit_cost?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          low_stock_threshold?: number | null
          name?: string
          notes?: string | null
          sku?: string | null
          stock?: number | null
          unit_cost?: number | null
        }
        Relationships: []
      }
      inventory_activity: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          id: string
          inventory_id: string | null
          item_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          inventory_id?: string | null
          item_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          inventory_id?: string | null
          item_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_activity_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          created_at: string | null
          low_stock_threshold: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          low_stock_threshold?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          low_stock_threshold?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_locations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_stock_locations: {
        Row: {
          created_at: string | null
          id: string
          inventory_id: string
          location: string
          parent_location: string | null
          quantity: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_id: string
          location: string
          parent_location?: string | null
          quantity?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_id?: string
          location?: string
          parent_location?: string | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_locations_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      password_failed_verification_attempts: {
        Row: {
          last_failed_at: string | null
          user_id: string
        }
        Insert: {
          last_failed_at?: string | null
          user_id: string
        }
        Update: {
          last_failed_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string | null
          device_info: string | null
          endpoint: string
          id: string
          subscription: Json
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: string | null
          endpoint: string
          id?: string
          subscription: Json
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: string | null
          endpoint?: string
          id?: string
          subscription?: Json
          user_id?: string
        }
        Relationships: []
      }
      repairs: {
        Row: {
          appliance_id: string
          cost: number | null
          created_at: string | null
          description: string
          id: string
          parts: Json | null
          repair_date: string | null
          service_provider: string | null
        }
        Insert: {
          appliance_id: string
          cost?: number | null
          created_at?: string | null
          description: string
          id?: string
          parts?: Json | null
          repair_date?: string | null
          service_provider?: string | null
        }
        Update: {
          appliance_id?: string
          cost?: number | null
          created_at?: string | null
          description?: string
          id?: string
          parts?: Json | null
          repair_date?: string | null
          service_provider?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repairs_appliance_id_fkey"
            columns: ["appliance_id"]
            isOneToOne: false
            referencedRelation: "appliances"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          avatar_url: string | null
          compact_view: boolean | null
          created_at: string | null
          dark_mode: boolean | null
          display_name: string | null
          email_alerts: boolean | null
          id: string
          language: string | null
          low_stock_threshold: number | null
          mfa_enabled: boolean | null
          notifications: boolean | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          compact_view?: boolean | null
          created_at?: string | null
          dark_mode?: boolean | null
          display_name?: string | null
          email_alerts?: boolean | null
          id?: string
          language?: string | null
          low_stock_threshold?: number | null
          mfa_enabled?: boolean | null
          notifications?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          compact_view?: boolean | null
          created_at?: string | null
          dark_mode?: boolean | null
          display_name?: string | null
          email_alerts?: boolean | null
          id?: string
          language?: string | null
          low_stock_threshold?: number | null
          mfa_enabled?: boolean | null
          notifications?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      hook_password_verification_attempt: {
        Args: { event: Json }
        Returns: Json
      }
    }
    Enums: {
      appliance_status: "functional" | "needs_service" | "broken"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      appliance_status: ["functional", "needs_service", "broken"],
    },
  },
} as const

