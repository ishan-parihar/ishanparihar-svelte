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