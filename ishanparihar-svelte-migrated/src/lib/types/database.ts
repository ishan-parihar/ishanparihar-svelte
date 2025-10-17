export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string;
          cover_image?: string;
          category?: string;
          tags?: string[];
          author_user_id: string;
          draft: boolean;
          published_at?: string;
          created_at: string;
          updated_at: string;
          views_count: number;
          likes_count: number;
          comments_count: number;
          meta_title?: string;
          meta_description?: string;
          keywords?: string[];
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string;
          cover_image?: string;
          category?: string;
          tags?: string[];
          author_user_id: string;
          draft?: boolean;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
          views_count?: number;
          likes_count?: number;
          comments_count?: number;
          meta_title?: string;
          meta_description?: string;
          keywords?: string[];
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string;
          cover_image?: string;
          category?: string;
          tags?: string[];
          author_user_id?: string;
          draft?: boolean;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
          views_count?: number;
          likes_count?: number;
          comments_count?: number;
          meta_title?: string;
          meta_description?: string;
          keywords?: string[];
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          email_verified: boolean;
          picture?: string;
          permissions?: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: string;
          email_verified?: boolean;
          picture?: string;
          permissions?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          email_verified?: boolean;
          picture?: string;
          permissions?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          expires_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          expires_at: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          expires_at?: string;
        };
      };
      user_permissions: {
        Row: {
          id: string;
          user_id: string;
          permission: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          permission: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          permission?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}