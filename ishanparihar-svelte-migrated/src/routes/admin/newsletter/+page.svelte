<script lang="ts">
  import { onMount } from 'svelte';
  import { apiClient } from '$lib/api/client';
  import CampaignEditor from '$lib/components/admin/newsletter/CampaignEditor.svelte';
  
  interface Campaign {
    id: string;
    subject: string;
    content: string;
    status: string;
    created_at: string;
    sent_at?: string;
    scheduled_at?: string;
    recipients: number;
    opens: number;
    clicks: number;
  }
  
  let campaigns: Campaign[] = [];
  let loading = true;
  let error: string | null = null;
  let showEditor = false;
  let editingCampaign: Campaign | null = null;
  let stats = {
    total: 0,
    sent: 0,
    draft: 0,
    scheduled: 0
  };
  
  onMount(async () => {
    try {
      // Load campaigns
      const campaignResponse = await apiClient.admin.newsletter.getCampaigns({ page: 1, limit: 10 });
      campaigns = campaignResponse.campaigns;
      
      // Calculate stats
      stats.total = campaigns.length;
      stats.sent = campaigns.filter(c => c.status === 'sent').length;
      stats.draft = campaigns.filter(c => c.status === 'draft').length;
      stats.scheduled = campaigns.filter(c => c.status === 'scheduled').length;
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
  
  function createNewCampaign() {
    editingCampaign = null;
    showEditor = true;
  }
  
  function editCampaign(campaign: Campaign) {
    editingCampaign = campaign;
    showEditor = true;
  }
  
  function closeEditor() {
    showEditor = false;
    editingCampaign = null;
  }
</script>

<div class="max-w-7xl mx-auto p-6">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Newsletter Management</h1>
    <p class="text-gray-600 dark:text-gray-400 mt-2">Create and manage your email campaigns</p>
 </div>
  
  {#if error}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <p class="text-red-600 dark:text-red-40">{error}</p>
    </div>
  {/if}
  
  {#if showEditor}
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
        </h2>
        <button 
          on:click={closeEditor}
          class="text-gray-500 hover:text-gray-70 dark:text-gray-400 dark:hover:text-gray-20"
        >
          Close
        </button>
      </div>
      
      <CampaignEditor 
        campaign={editingCampaign}
        mode={editingCampaign ? 'edit' : 'create'}
      />
    </div>
  {/if}
  
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
      <div class="text-gray-600 dark:text-gray-400">Total Campaigns</div>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div class="text-3xl font-bold text-green-600 dark:text-green-400">{stats.sent}</div>
      <div class="text-gray-600 dark:text-gray-400">Sent</div>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-40">{stats.draft}</div>
      <div class="text-gray-600 dark:text-gray-400">Drafts</div>
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.scheduled}</div>
      <div class="text-gray-600 dark:text-gray-400">Scheduled</div>
    </div>
  </div>
  
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Campaigns</h2>
      <button 
        on:click={createNewCampaign}
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create Campaign
      </button>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    {:else if campaigns.length === 0}
      <div class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">No campaigns found. Create one to get started.</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Recipients</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Opens</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clicks</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-30 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {#each campaigns as campaign}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{campaign.subject}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    {campaign.status === 'sent' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 
                      campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 
                      campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' : 
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}">
                    {campaign.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {campaign.recipients}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-40">
                  {campaign.opens}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {campaign.clicks}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-40">
                  {new Date(campaign.created_at).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    on:click={() => editCampaign(campaign)}
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                  >
                    Edit
                  </button>
                  <button 
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
 </div>
</div>