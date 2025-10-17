import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { requireAdmin, handleApiError } from '../../../utils';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  created_at: string;
  updated_at: string;
}

export async function GET(event: RequestEvent) {
  try {
    await requireAdmin(event);
    
    // In a real implementation, this would query the database
    // For now, we'll return mock data
    const mockSubscribers: Subscriber[] = [
      {
        id: '1',
        email: 'john@example.com',
        name: 'John Doe',
        status: 'active',
        created_at: '2023-05-15T10:30:00Z',
        updated_at: '2023-05-15T10:30:00Z'
      },
      {
        id: '2',
        email: 'jane@example.com',
        name: 'Jane Smith',
        status: 'active',
        created_at: '2023-05-10T14:20:00Z',
        updated_at: '2023-05-10T14:20:00Z'
      },
      {
        id: '3',
        email: 'bob@example.com',
        name: 'Bob Johnson',
        status: 'unsubscribed',
        created_at: '2023-05-05T09:15:00Z',
        updated_at: '2023-05-08T11:45:00Z'
      }
    ];
    
    // Calculate stats
    const total = mockSubscribers.length;
    const active = mockSubscribers.filter(s => s.status === 'active').length;
    const unsubscribed = mockSubscribers.filter(s => s.status === 'unsubscribed').length;
    
    return json({
      subscribers: mockSubscribers,
      total,
      active,
      unsubscribed
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
    const newSubscriber: Subscriber = {
      id: `sub-${Date.now()}`,
      email: data.email,
      name: data.name,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return json({ success: true, subscriber: newSubscriber });
  } catch (error) {
    return handleApiError(error);
 }
}