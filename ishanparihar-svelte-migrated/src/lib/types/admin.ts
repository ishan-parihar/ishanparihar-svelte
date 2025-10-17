export interface AdminDashboardMetrics {
  totalUsers: number;
  userGrowth: number;
  totalBlogPosts: number;
  blogGrowth: number;
  totalComments: number;
  commentGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  openTickets: number;
  ticketChange: number;
  newsletterSubscribers: number;
  subscriberGrowth: number;
}

export interface AdminActivity {
  id: string;
  userInitials: string;
  description: string;
  timestamp: string;
  type: string;
}

export interface AdminDashboardData {
  metrics: AdminDashboardMetrics;
  recentActivities: AdminActivity[];
}