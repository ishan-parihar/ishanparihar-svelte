export const PERMISSION_SCOPES = {
  // Admin permissions
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_USERS: 'admin:users',
  ADMIN_SETTINGS: 'admin:settings',
  
  // Blog permissions
  BLOG_CREATE: 'blog:create',
  BLOG_EDIT: 'blog:edit',
  BLOG_DELETE: 'blog:delete',
  BLOG_PUBLISH: 'blog:publish',
  
  // Services permissions
  SERVICES_CREATE: 'services:create',
  SERVICES_EDIT: 'services:edit',
  SERVICES_DELETE: 'services:delete',
  
  // User permissions
  USER_PROFILE: 'user:profile',
  USER_SETTINGS: 'user:settings',
  
  // General permissions
  READ_PUBLIC: 'read:public',
  READ_PRIVATE: 'read:private'
} as const;

export type PermissionScope = keyof typeof PERMISSION_SCOPES;