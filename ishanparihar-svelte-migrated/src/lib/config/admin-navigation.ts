// Admin navigation structure
export interface AdminNavigationItem {
  name: string;
  path: string;
  icon?: string;
  permission?: string;
  children?: AdminNavigationItem[];
}

export const adminNavigation: AdminNavigationItem[] = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: 'dashboard',
    permission: 'admin:dashboard'
  },
  {
    name: 'Users',
    path: '/admin/users',
    icon: 'users',
    permission: 'admin:users'
  },
  {
    name: 'Analytics',
    path: '/admin/analytics',
    icon: 'analytics',
    permission: 'admin:dashboard'
  },
  {
    name: 'Blog',
    path: '/admin/blog',
    icon: 'blog',
    permission: 'blog:edit'
  },
  {
    name: 'Comments',
    path: '/admin/comments',
    icon: 'comments',
    permission: 'blog:edit'
  },
  {
    name: 'Services',
    path: '/admin/services',
    icon: 'services',
    permission: 'services:edit'
  },
  {
    name: 'Sales',
    path: '/admin/sales',
    icon: 'sales',
    permission: 'admin:dashboard'
  },
  {
    name: 'Support',
    path: '/admin/support',
    icon: 'support',
    permission: 'admin:dashboard'
  },
  {
    name: 'Newsletter',
    path: '/admin/newsletter',
    icon: 'newsletter',
    permission: 'admin:dashboard'
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: 'settings',
    permission: 'admin:settings'
  }
];