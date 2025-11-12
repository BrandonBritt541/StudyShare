export type Database = {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          domain: string;
          city: string;
          state: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['schools']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['schools']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          school_id: string;
          first_name: string | null;
          last_initial: string | null;
          major: string | null;
          college_year: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate' | null;
          grad_year: number | null;
          photo_url: string | null;
          referral_code: string;
          points_total: number;
          role: 'student' | 'moderator' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      listings: {
        Row: {
          id: string;
          seller_id: string;
          school_id: string;
          title: string;
          description: string | null;
          type: 'textbook' | 'lab_supplies' | 'calculator' | 'electronics' | 'notebook' | 'other';
          quality: 'new' | 'like_new' | 'good' | 'fair';
          price_cents: number;
          currency: string;
          course_code: string | null;
          course_title: string | null;
          professor: string | null;
          major: string | null;
          images: string[];
          status: 'active' | 'sold';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['listings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['listings']['Insert']>;
      };
      message_threads: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          school_id: string;
          created_at: string;
          last_message_at: string;
        };
        Insert: Omit<Database['public']['Tables']['message_threads']['Row'], 'id' | 'created_at' | 'last_message_at'>;
        Update: Partial<Database['public']['Tables']['message_threads']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          school_id: string;
          query_text: string;
          expires_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          payload: Record<string, unknown>;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      user_schedules: {
        Row: {
          id: string;
          user_id: string;
          school_id: string;
          image_urls: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_schedules']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_schedules']['Insert']>;
      };
      courses: {
        Row: {
          id: string;
          school_id: string;
          code: string;
          title: string | null;
          professor_names: string[];
          common_materials: string[];
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['courses']['Insert']>;
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          category: string;
          notes: string | null;
          status: 'open' | 'in_review' | 'resolved' | 'dismissed';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
      };
      referrals: {
        Row: {
          id: string;
          referrer_user_id: string;
          referred_user_id: string;
          referral_code: string;
          points_awarded: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['referrals']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['referrals']['Insert']>;
      };
    };
  };
};
