<script lang="ts">
  import { onMount } from 'svelte';
  import { apiClient } from '$lib/api/client';
  import LiveChat from '$lib/components/support/LiveChat.svelte';
  
 interface Ticket {
    id: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
  }
  
  let tickets: Ticket[] = [];
  let loading = true;
  let error: string | null = null;
  let showChat = false;
  let activeTicket = null;
  
  onMount(async () => {
    try {
      // Load tickets
      const ticketResponse = await apiClient.support.getTickets({ page: 1, limit: 5 });
      tickets = ticketResponse.tickets;
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
  
  async function createTicket() {
    const subject = prompt('Enter ticket subject:');
    if (!subject) return;
    
    const description = prompt('Enter ticket description:');
    if (!description) return;
    
    try {
      const ticket = await apiClient.support.createTicket({
        subject,
        description,
        priority: 'medium'
      });
      
      tickets = [ticket.ticket, ...tickets];
    } catch (err: any) {
      error = err.message;
    }
  }
  
  function openChat() {
    showChat = true;
  }
</script>

<div class="max-w-6xl mx-auto p-6">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Support Center</h1>
    <p class="text-gray-600 dark:text-gray-400 mt-2">Get help with your account and services</p>
 </div>
  
  {#if error}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <p class="text-red-600 dark:text-red-40">{error}</p>
    </div>
  {/if}
  
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Left Column - Quick Actions -->
    <div class="lg:col-span-1">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        
        <div class="space-y-3">
          <button 
            on:click={createTicket}
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Ticket
          </button>
          
          <button 
            on:click={openChat}
            class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Start Live Chat
          </button>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
        
        <div class="space-y-3">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">Email Support</h3>
            <p class="text-gray-600 dark:text-gray-400">support@example.com</p>
          </div>
          
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">Phone Support</h3>
            <p class="text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
          </div>
          
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">Hours</h3>
            <p class="text-gray-600 dark:text-gray-400">Mon-Fri: 9AM - 6PM EST</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Right Column - Tickets and Chat -->
    <div class="lg:col-span-2">
      {#if showChat}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Live Support Chat</h2>
            <button 
              on:click={() => showChat = false}
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Close
            </button>
          </div>
          
          <div class="h-96">
            <LiveChat 
              sessionId="support-session-1"
              userId="current-user"
              userType="customer"
            />
          </div>
        </div>
      {/if}
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Recent Tickets</h2>
          <button 
            on:click={createTicket}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Ticket
          </button>
        </div>
        
        {#if loading}
          <div class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-50"></div>
          </div>
        {:else if tickets.length === 0}
          <div class="text-center py-8">
            <p class="text-gray-600 dark:text-gray-400">No tickets found. Create one to get started.</p>
          </div>
        {:else}
          <div class="space-y-4">
            {#each tickets as ticket}
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-medium text-gray-900 dark:text-white">{ticket.subject}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{ticket.description}</p>
                  </div>
                  <div class="text-right">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-90/20 dark:text-blue-400">
                      {ticket.status}
                    </span>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>