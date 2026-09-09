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
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string
          body_mdx: string
          created_at: string
          dek: string | null
          hero_credit: string | null
          hero_path: string | null
          id: string
          published_at: string | null
          published_by: string | null
          rating: number | null
          related_production_id: string | null
          reviewed_company_id: string | null
          reviewed_run_id: string | null
          reviewed_venue_id: string | null
          search_vec: unknown
          section: "noticias" | "blog" | "opiniones" | "reviews" | "entrevistas"
          seen_on: string | null
          slug: string
          status:
            | "borrador"
            | "en_revision"
            | "programado"
            | "publicado"
            | "archivado"
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body_mdx?: string
          created_at?: string
          dek?: string | null
          hero_credit?: string | null
          hero_path?: string | null
          id?: string
          published_at?: string | null
          published_by?: string | null
          rating?: number | null
          related_production_id?: string | null
          reviewed_company_id?: string | null
          reviewed_run_id?: string | null
          reviewed_venue_id?: string | null
          search_vec?: unknown
          section: "noticias" | "blog" | "opiniones" | "reviews" | "entrevistas"
          seen_on?: string | null
          slug: string
          status?:
            | "borrador"
            | "en_revision"
            | "programado"
            | "publicado"
            | "archivado"
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body_mdx?: string
          created_at?: string
          dek?: string | null
          hero_credit?: string | null
          hero_path?: string | null
          id?: string
          published_at?: string | null
          published_by?: string | null
          rating?: number | null
          related_production_id?: string | null
          reviewed_company_id?: string | null
          reviewed_run_id?: string | null
          reviewed_venue_id?: string | null
          search_vec?: unknown
          section?:
            | "noticias"
            | "blog"
            | "opiniones"
            | "reviews"
            | "entrevistas"
          seen_on?: string | null
          slug?: string
          status?:
            | "borrador"
            | "en_revision"
            | "programado"
            | "publicado"
            | "archivado"
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_related_production_id_fkey"
            columns: ["related_production_id"]
            isOneToOne: false
            referencedRelation: "productions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_reviewed_company_id_fkey"
            columns: ["reviewed_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_reviewed_run_id_fkey"
            columns: ["reviewed_run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_reviewed_venue_id_fkey"
            columns: ["reviewed_venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          detail: Json
          entity: string
          entity_id: string | null
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          entity: string
          entity_id?: string | null
          id?: number
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          entity?: string
          entity_id?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      auditions: {
        Row: {
          age_max: number | null
          age_min: number | null
          city: string
          closes_at: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_type: string | null
          created_at: string
          dance_styles: string[]
          description: string | null
          how_to_apply: string | null
          id: string
          is_paid: boolean | null
          is_verified: boolean
          kind: "obra" | "representacion" | "ensamble"
          opens_at: string | null
          organizer: string
          production_id: string | null
          province: string
          requirements: string | null
          requires_arca: boolean
          roles_sought: Json
          slug: string
          source_url: string | null
          title: string
          updated_at: string
          vocal_ranges: (
            | "soprano"
            | "mezzosoprano"
            | "contralto"
            | "contratenor"
            | "tenor"
            | "baritono"
            | "bajo"
          )[]
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          city?: string
          closes_at?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_type?: string | null
          created_at?: string
          dance_styles?: string[]
          description?: string | null
          how_to_apply?: string | null
          id?: string
          is_paid?: boolean | null
          is_verified?: boolean
          kind?: "obra" | "representacion" | "ensamble"
          opens_at?: string | null
          organizer: string
          production_id?: string | null
          province?: string
          requirements?: string | null
          requires_arca?: boolean
          roles_sought?: Json
          slug: string
          source_url?: string | null
          title: string
          updated_at?: string
          vocal_ranges?: (
            | "soprano"
            | "mezzosoprano"
            | "contralto"
            | "contratenor"
            | "tenor"
            | "baritono"
            | "bajo"
          )[]
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          city?: string
          closes_at?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_type?: string | null
          created_at?: string
          dance_styles?: string[]
          description?: string | null
          how_to_apply?: string | null
          id?: string
          is_paid?: boolean | null
          is_verified?: boolean
          kind?: "obra" | "representacion" | "ensamble"
          opens_at?: string | null
          organizer?: string
          production_id?: string | null
          province?: string
          requirements?: string | null
          requires_arca?: boolean
          roles_sought?: Json
          slug?: string
          source_url?: string | null
          title?: string
          updated_at?: string
          vocal_ranges?: (
            | "soprano"
            | "mezzosoprano"
            | "contralto"
            | "contratenor"
            | "tenor"
            | "baritono"
            | "bajo"
          )[]
        }
        Relationships: [
          {
            foreignKeyName: "auditions_production_id_fkey"
            columns: ["production_id"]
            isOneToOne: false
            referencedRelation: "productions"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          founded_year: number | null
          id: string
          logo_path: string | null
          name: string
          phone: string | null
          slug: string
          socials: Json
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          founded_year?: number | null
          id?: string
          logo_path?: string | null
          name: string
          phone?: string | null
          slug: string
          socials?: Json
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          founded_year?: number | null
          id?: string
          logo_path?: string | null
          name?: string
          phone?: string | null
          slug?: string
          socials?: Json
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      credits: {
        Row: {
          billing_order: number
          character_name: string | null
          cover_type: "titular" | "alternate" | "cover" | "swing"
          created_at: string
          department: "elenco" | "musical" | "creativo" | "tecnico"
          id: string
          person_id: string
          role_name: string
          run_id: string
        }
        Insert: {
          billing_order?: number
          character_name?: string | null
          cover_type?: "titular" | "alternate" | "cover" | "swing"
          created_at?: string
          department: "elenco" | "musical" | "creativo" | "tecnico"
          id?: string
          person_id: string
          role_name: string
          run_id: string
        }
        Update: {
          billing_order?: number
          character_name?: string | null
          cover_type?: "titular" | "alternate" | "cover" | "swing"
          created_at?: string
          department?: "elenco" | "musical" | "creativo" | "tecnico"
          id?: string
          person_id?: string
          role_name?: string
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          call_closes_at: string | null
          call_opens_at: string | null
          city: string
          created_at: string
          description: string | null
          ends_on: string | null
          has_open_call: boolean
          how_to_submit: string | null
          id: string
          is_verified: boolean
          kind: "festival" | "ciclo" | "encuentro" | "premiacion" | "concurso"
          organizer: string | null
          poster_path: string | null
          province: string
          requirements: string | null
          slug: string
          source_url: string
          starts_on: string | null
          title: string
          updated_at: string
          venue_id: string | null
          website: string | null
        }
        Insert: {
          call_closes_at?: string | null
          call_opens_at?: string | null
          city?: string
          created_at?: string
          description?: string | null
          ends_on?: string | null
          has_open_call?: boolean
          how_to_submit?: string | null
          id?: string
          is_verified?: boolean
          kind: "festival" | "ciclo" | "encuentro" | "premiacion" | "concurso"
          organizer?: string | null
          poster_path?: string | null
          province?: string
          requirements?: string | null
          slug: string
          source_url: string
          starts_on?: string | null
          title: string
          updated_at?: string
          venue_id?: string | null
          website?: string | null
        }
        Update: {
          call_closes_at?: string | null
          call_opens_at?: string | null
          city?: string
          created_at?: string
          description?: string | null
          ends_on?: string | null
          has_open_call?: boolean
          how_to_submit?: string | null
          id?: string
          is_verified?: boolean
          kind?: "festival" | "ciclo" | "encuentro" | "premiacion" | "concurso"
          organizer?: string | null
          poster_path?: string | null
          province?: string
          requirements?: string | null
          slug?: string
          source_url?: string
          starts_on?: string | null
          title?: string
          updated_at?: string
          venue_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          name: string
          photo_path: string | null
          slug: string
          socials: Json
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          name: string
          photo_path?: string | null
          slug: string
          socials?: Json
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          photo_path?: string | null
          slug?: string
          socials?: Json
          updated_at?: string
        }
        Relationships: []
      }
      productions: {
        Row: {
          age_rating: string | null
          book_author: string | null
          composer: string | null
          created_at: string
          duration_min: number | null
          has_intermission: boolean | null
          id: string
          is_original_arg: boolean
          licensor: string | null
          lyricist: string | null
          original_title: string | null
          poster_path: string | null
          slug: string
          synopsis: string | null
          title: string
          translator: string | null
          updated_at: string
        }
        Insert: {
          age_rating?: string | null
          book_author?: string | null
          composer?: string | null
          created_at?: string
          duration_min?: number | null
          has_intermission?: boolean | null
          id?: string
          is_original_arg?: boolean
          licensor?: string | null
          lyricist?: string | null
          original_title?: string | null
          poster_path?: string | null
          slug: string
          synopsis?: string | null
          title: string
          translator?: string | null
          updated_at?: string
        }
        Update: {
          age_rating?: string | null
          book_author?: string | null
          composer?: string | null
          created_at?: string
          duration_min?: number | null
          has_intermission?: boolean | null
          id?: string
          is_original_arg?: boolean
          licensor?: string | null
          lyricist?: string | null
          original_title?: string | null
          poster_path?: string | null
          slug?: string
          synopsis?: string | null
          title?: string
          translator?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_path: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          role:
            | "administrador"
            | "editor"
            | "autor"
            | "colaborador"
            | "suscriptor"
          slug: string | null
          socials: Json
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id: string
          role?:
            | "administrador"
            | "editor"
            | "autor"
            | "colaborador"
            | "suscriptor"
          slug?: string | null
          socials?: Json
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          role?:
            | "administrador"
            | "editor"
            | "autor"
            | "colaborador"
            | "suscriptor"
          slug?: string | null
          socials?: Json
          updated_at?: string
        }
        Relationships: []
      }
      runs: {
        Row: {
          closes_on: string | null
          company_id: string | null
          created_at: string
          id: string
          opens_on: string
          producer: string | null
          production_id: string
          status: "anunciada" | "en_cartel" | "finalizada"
          ticket_url: string | null
          ticketing: string | null
          updated_at: string
          venue_id: string
        }
        Insert: {
          closes_on?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          opens_on: string
          producer?: string | null
          production_id: string
          status?: "anunciada" | "en_cartel" | "finalizada"
          ticket_url?: string | null
          ticketing?: string | null
          updated_at?: string
          venue_id: string
        }
        Update: {
          closes_on?: string | null
          company_id?: string | null
          created_at?: string
          id?: string
          opens_on?: string
          producer?: string | null
          production_id?: string
          status?: "anunciada" | "en_cartel" | "finalizada"
          ticket_url?: string | null
          ticketing?: string | null
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "runs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_production_id_fkey"
            columns: ["production_id"]
            isOneToOne: false
            referencedRelation: "productions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          city: string
          created_at: string
          description: string | null
          founded_year: number | null
          id: string
          logo_path: string | null
          name: string
          neighborhood: string | null
          province: string
          slug: string
          socials: Json
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          logo_path?: string | null
          name: string
          neighborhood?: string | null
          province?: string
          slug: string
          socials?: Json
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          logo_path?: string | null
          name?: string
          neighborhood?: string | null
          province?: string
          slug?: string
          socials?: Json
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      showtimes: {
        Row: {
          created_at: string
          id: string
          is_cancelled: boolean
          note: string | null
          run_id: string
          starts_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_cancelled?: boolean
          note?: string | null
          run_id: string
          starts_at: string
        }
        Update: {
          created_at?: string
          id?: string
          is_cancelled?: boolean
          note?: string | null
          run_id?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "showtimes_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          contact_email: string
          contact_name: string
          created_at: string
          id: string
          kind: string
          notes: string | null
          payload: Json
          reviewed_at: string | null
          reviewed_by: string | null
          status: "pendiente" | "aprobada" | "rechazada"
        }
        Insert: {
          contact_email: string
          contact_name: string
          created_at?: string
          id?: string
          kind: string
          notes?: string | null
          payload: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: "pendiente" | "aprobada" | "rechazada"
        }
        Update: {
          contact_email?: string
          contact_name?: string
          created_at?: string
          id?: string
          kind?: string
          notes?: string | null
          payload?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: "pendiente" | "aprobada" | "rechazada"
        }
        Relationships: [
          {
            foreignKeyName: "submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string | null
          booking_url: string | null
          circuit: "comercial" | "oficial" | "independiente" | null
          city: string
          contact_note: string | null
          created_at: string
          email: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          neighborhood: string | null
          phone: string | null
          province: string
          seats: number | null
          slug: string
          socials: Json
          updated_at: string
          website: string | null
          wheelchair_access: boolean | null
        }
        Insert: {
          address?: string | null
          booking_url?: string | null
          circuit?: "comercial" | "oficial" | "independiente" | null
          city?: string
          contact_note?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          neighborhood?: string | null
          phone?: string | null
          province?: string
          seats?: number | null
          slug: string
          socials?: Json
          updated_at?: string
          website?: string | null
          wheelchair_access?: boolean | null
        }
        Update: {
          address?: string | null
          booking_url?: string | null
          circuit?: "comercial" | "oficial" | "independiente" | null
          city?: string
          contact_note?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          neighborhood?: string | null
          phone?: string | null
          province?: string
          seats?: number | null
          slug?: string
          socials?: Json
          updated_at?: string
          website?: string | null
          wheelchair_access?: boolean | null
        }
        Relationships: []
      }
      workshops: {
        Row: {
          created_at: string
          description: string | null
          enrollment_open: boolean
          id: string
          kind: "montaje" | "carrera" | "curso" | "especializacion" | "workshop"
          school_id: string
          slug: string
          source_url: string
          title: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          enrollment_open?: boolean
          id?: string
          kind?:
            | "montaje"
            | "carrera"
            | "curso"
            | "especializacion"
            | "workshop"
          school_id: string
          slug: string
          source_url: string
          title: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          enrollment_open?: boolean
          id?: string
          kind?:
            | "montaje"
            | "carrera"
            | "curso"
            | "especializacion"
            | "workshop"
          school_id?: string
          slug?: string
          source_url?: string
          title?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshops_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
    Enums: {},
  },
} as const
