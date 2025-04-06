export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          instruments: string[]
          notification_pref: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          instruments?: string[]
          notification_pref?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          instruments?: string[]
          notification_pref?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 