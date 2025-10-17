import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { requireAdmin, handleApiError } from '../../../utils';

interface Campaign {
  id: string;
  subject: string;
  content: string;
  status: string;
  scheduled_at?: string | null;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  recipients?: number;
  opens?: number;
  clicks?: number;
}

export async function GET(event: RequestEvent) {
  try {
    await requireAdmin(event);
    
    // In a real implementation, this would query the database
    // For now, we'll return mock data
    const url = new URL(event.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    
    // Mock data
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        subject: 'Welcome to Our Platform!',
        content: '<p>Thank you for joining our platform. We hope you enjoy our services.</p>',
        status: 'sent',
        created_at: '2023-05-15T10:30:00Z',
        updated_at: '2023-05-15T11:00:00Z',
        sent_at: '2023-05-15T11:00:00Z',
        recipients: 1500,
        opens: 850,
        clicks: 250
      },
      {
        id: '2',
        subject: 'New Features Available',
        content: '<p>We have launched exciting new features for our users.</p>',
        status: 'draft',
        created_at: '2023-05-10T14:20:00Z',
        updated_at: '2023-05-10T14:20:00Z',
        scheduled_at: '2023-05-20T10:00:00Z',
        recipients: 0,
        opens: 0,
        clicks: 0
      },
      {
        id: '3',
        subject: 'Monthly Newsletter',
        content: '<p>Here are the updates from this month.</p>',
        status: 'scheduled',
        created_at: '2023-05-05T09:15:00Z',
        updated_at: '2023-05-05T09:15:00Z',
        scheduled_at: '2023-05-15T10:00:00Z',
        recipients: 0,
        opens: 0,
        clicks: 0
      }
    ];
    
    const filteredCampaigns = status 
      ? mockCampaigns.filter(c => c.status === status) 
      : mockCampaigns;
    
    const total = filteredCampaigns.length;
    const offset = (page - 1) * limit;
    const paginatedCampaigns = filteredCampaigns.slice(offset, offset + limit);
    
    return json({
      campaigns: paginatedCampaigns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
 } catch (error) {
    return handleApiError(error);
 }
}

export async function POST(event: RequestEvent) {
  try {
    await requireAdmin(event);
    const data = await event.request.json();
    
    // In a real implementation, this would insert into the database
    // For now, we'll return mock data
    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      subject: data.subject,
      content: data.content,
      status: data.status || 'draft',
      scheduled_at: data.scheduledAt || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // If status is 'sending', send immediately
    if (data.status === 'sending') {
      // In a real implementation, we would call sendEmailCampaign
      // For now, we'll just update the status
      (newCampaign as any).status = 'sent';
      (newCampaign as any).sent_at = new Date().toISOString();
    }
    
    return json({ success: true, campaign: newCampaign });
  } catch (error) {
    return handleApiError(error);
 }
}