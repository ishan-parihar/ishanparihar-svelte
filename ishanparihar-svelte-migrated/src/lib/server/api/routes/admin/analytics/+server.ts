import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Mock analytics data
const mockAnalyticsData = {
  metrics: {
    totalUsers: 1250,
    userGrowth: 12,
    totalBlogPosts: 45,
    blogGrowth: 8,
    totalComments: 320,
    commentGrowth: 15,
    totalRevenue: 25000,
    revenueGrowth: 22,
    openTickets: 8,
    ticketChange: -2,
    newsletterSubscribers: 3500,
    subscriberGrowth: 5
  },
  userGrowth: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'User Growth',
        data: [10, 120, 150, 180, 220, 280, 350, 450, 600, 800, 1000, 1250],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)'
      }
    ]
  },
  pageViews: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Page Views',
        data: [1200, 1900, 1500, 1800, 2200, 1700, 2100],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      }
    ]
  },
  trafficSources: {
    labels: ['Direct', 'Social', 'Search', 'Referral'],
    datasets: [
      {
        label: 'Traffic Sources',
        data: [45, 25, 20, 10],
        backgroundColor: [
          'rgba(255, 9, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)'
        ],
        borderWidth: 1
      }
    ]
  },
  revenue: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [5000, 620, 7500, 8200, 9500, 11000, 12500, 15000, 18000, 20000, 22000, 25000],
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)'
      }
    ]
 }
};

export const GET: RequestHandler = async ({ url }) => {
  // In a real implementation, you would fetch data from your database
  // based on the date range and other parameters
  const dateFrom = url.searchParams.get('from');
  const dateTo = url.searchParams.get('to');
  
  // For now, return mock data
  return json(mockAnalyticsData);
};