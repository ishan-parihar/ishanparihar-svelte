// User account type
export type UserAccount = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  provider: string;
  email_verified: boolean;
  newsletter_subscribed: boolean;
  manually_unsubscribed?: boolean;
  unsubscribe_token?: string;
  subscribed_at?: string;
  unsubscribed_at?: string;
  created_at: string;
  updated_at: string;
  // Suspension fields
  suspended?: boolean;
  suspended_at?: string | null;
  suspended_by?: string | null;
  suspension_reason?: string | null;
  suspension_expires_at?: string | null;
  // Spam fields
  spam_score?: number;
  is_spam_flagged?: boolean;
  spam_flagged_at?: string | null;
  spam_flagged_by?: string | null;
  // Purchase summary fields
  total_spent?: number;
  role?: string;
};

// Newsletter subscriber type
export type NewsletterSubscriber = {
  id: string;
  email: string;
  name: string | null;
  newsletter_subscribed: boolean;
  manually_unsubscribed?: boolean;
  unsubscribe_token: string;
  subscribed_at: string;
  unsubscribed_at?: string;
  updated_at: string;
};
