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
      songs: {
        Row: {
          id: string
          band_id: string
          title: string
          artist: string
          spotify_link?: string
          song_sheet_path?: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          band_id: string
          title: string
          artist: string
          spotify_link?: string
          song_sheet_path?: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          band_id?: string
          title?: string
          artist?: string
          spotify_link?: string
          song_sheet_path?: string
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "songs_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "songs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
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