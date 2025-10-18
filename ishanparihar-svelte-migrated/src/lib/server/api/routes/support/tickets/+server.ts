import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { requireAdmin, handleApiError } from '$lib/server/api/routes/support/utils';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  customer_id: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
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
    const priority = url.searchParams.get('priority');
    
    // Mock data
    const mockTickets: Ticket[] = [
      {
        id: '1',
        subject: 'Order not delivered',
        description: 'My order has not been delivered yet',
        status: 'open',
        priority: 'high',
        customer_id: 'customer-1',
        assigned_to: 'agent-1',
        created_at: '2023-05-15T10:30:00Z',
        updated_at: '2023-05-15T10:30:00Z'
      },
      {
        id: '2',
        subject: 'Payment issue',
        description: 'I have a problem with my payment',
        status: 'resolved',
        priority: 'medium',
        customer_id: 'customer-2',
        created_at: '2023-05-10T14:20:00Z',
        updated_at: '2023-05-11T09:15:00Z'
      },
      {
        id: '3',
        subject: 'Feature request',
        description: 'I would like to request a new feature',
        status: 'open',
        priority: 'low',
        customer_id: 'customer-3',
        created_at: '2023-05-08T11:30:00Z',
        updated_at: '2023-05-08T11:30:00Z'
      }
    ];
    
    const filteredTickets = mockTickets.filter(ticket => {
      if (status && ticket.status !== status) return false;
      if (priority && ticket.priority !== priority) return false;
      return true;
    });
    
    const total = filteredTickets.length;
    const offset = (page - 1) * limit;
    const paginatedTickets = filteredTickets.slice(offset, offset + limit);
    
    return json({
      tickets: paginatedTickets,
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
    // await requireAdmin(event);  // Regular users can create tickets
    const data = await event.request.json();
    
    // In a real implementation, this would insert into the database
    // For now, we'll return mock data
    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      subject: data.subject,
      description: data.description,
      status: 'open',
      priority: data.priority || 'medium',
      customer_id: data.customer_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return json({ success: true, ticket: newTicket });
  } catch (error) {
    return handleApiError(error);
 }
}