import type { Database } from './database';

export type User = Database['public']['Tables']['users']['Row'] & {
  phone?: string;
  bio?: string;
  marketing_emails?: boolean;
  notification_preferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
};

export interface UserProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
}

export interface UserForTable {
  id: string;
  email: string;
  name: string;
  fullName?: string; // For backward compatibility
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  registrationDate?: string;
  last_login?: string;
  lastLogin?: string; // For backward compatibility
  picture?: string;
  suspended?: boolean;
  is_spam_flagged?: boolean;
  email_verified: boolean;
  phone?: string;
  address?: string;
  orders?: number;
  totalSpent?: number;
  bio?: string;
  marketing_emails?: boolean;
  notification_preferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}