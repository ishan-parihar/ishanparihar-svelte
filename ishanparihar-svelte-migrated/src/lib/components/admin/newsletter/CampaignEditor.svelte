<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiClient } from '$lib/api/client';
  
  interface Campaign {
    id?: string;
    subject: string;
    content: string;
    status: string;
    scheduled_at?: string;
    sent_at?: string;
  }
  
  export let campaign: Campaign | null = null;
  export let mode: 'create' | 'edit' = 'create'; // 'create' | 'edit'
  
  let formData = {
    subject: '',
    content: '',
    status: 'draft'
  };
  
  let loading = false;
  let saving = false;
  let sending = false;
  let error: string | null = null;
 let subscriberCount = 0;
  let showPreview = false;
  
  onMount(async () => {
    if (mode === 'edit' && campaign) {
      formData = {
        subject: campaign.subject,
        content: campaign.content,
        status: campaign.status
      };
    }
    
    // Load subscriber count
    try {
      const subscribers = await apiClient.admin.newsletter.getSubscribers();
      subscriberCount = subscribers.total;
    } catch (err) {
      console.error('Failed to load subscriber count:', err);
    }
  });
  
  async function handleSave() {
    try {
      saving = true;
      error = null;
      
      if (mode === 'create') {
        const result = await apiClient.admin.newsletter.createCampaign(formData);
        goto(`/admin/newsletter/campaigns/${result.campaign.id}`);
      } else {
        if (campaign) {
          await apiClient.admin.newsletter.updateCampaign(campaign.id!, formData);
        }
      }
    } catch (err: any) {
      error = err.message;
    } finally {
      saving = false;
    }
  }
  
  async function handleSend() {
    if (!confirm(`Are you sure you want to send this campaign to ${subscriberCount} subscribers?`)) {
      return;
    }
    
    try {
      sending = true;
      error = null;
      
      if (mode === 'create') {
        // Create and send
        const result = await apiClient.admin.newsletter.createCampaign({
          ...formData,
          status: 'sending'
        });
        goto(`/admin/newsletter/campaigns/${result.campaign.id}`);
      } else {
        // Update and send
        if (campaign) {
          await apiClient.admin.newsletter.updateCampaign(campaign.id!, {
            ...formData,
            status: 'sending'
          });
        }
      }
    } catch (err: any) {
      error = err.message;
    } finally {
      sending = false;
    }
  }
  
  async function handleSchedule() {
    const scheduledAt = prompt('Enter date and time to schedule (YYYY-MM-DD HH:MM):');
    if (!scheduledAt) return;
    
    try {
      saving = true;
      if (campaign) {
        await apiClient.admin.newsletter.updateCampaign(campaign.id!, {
          ...formData,
          status: 'scheduled',
          scheduledAt: new Date(scheduledAt).toISOString()
        });
      }
    } catch (err: any) {
      error = err.message;
    } finally {
      saving = false;
    }
  }
  
  function togglePreview() {
    showPreview = !showPreview;
  }
  
  // Simple rich text editor functions
 function insertBold() {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const newText = `**${selectedText}**`;
    
    formData.content = 
      formData.content.substring(0, start) + 
      newText + 
      formData.content.substring(end);
  }
  
  function insertItalic() {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const newText = `*${selectedText}*`;
    
    formData.content = 
      formData.content.substring(0, start) + 
      newText + 
      formData.content.substring(end);
  }
</script>

<div class="max-w-6xl mx-auto p-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {mode === 'create' ? 'Create Campaign' : 'Edit Campaign'}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Design and send your newsletter campaign
      </p>
    </div>
    
    <div class="flex items-center space-x-2">
      <button 
        on:click={togglePreview}
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        {showPreview ? 'Edit' : 'Preview'}
      </button>
    </div>
  </div>
  
  {#if error}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <p class="text-red-600 dark:text-red-40">{error}</p>
    </div>
  {/if}
  
  {#if showPreview}
    <!-- Email Preview -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">{formData.subject}</h2>
      <div class="prose dark:prose-invert max-w-none">
        {@html formData.content}
      </div>
    </div>
  {:else}
    <!-- Campaign Form -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Editor -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Subject -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject Line
          </label>
          <input 
            type="text"
            bind:value={formData.subject}
            placeholder="Enter email subject..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <!-- Content -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Content
            </label>
            <div class="flex space-x-2">
              <button 
                on:click={insertBold}
                class="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                type="button"
              >
                <strong>B</strong>
              </button>
              <button 
                on:click={insertItalic}
                class="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                type="button"
              >
                <em>I</em>
              </button>
            </div>
          </div>
          <textarea
            id="content-editor"
            bind:value={formData.content}
            placeholder="Write your email content..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            rows="12"
          ></textarea>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-2">
            <button 
              on:click={handleSave}
              disabled={saving}
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            
            {#if mode === 'edit' && campaign?.status !== 'sent'}
              <button 
                on:click={handleSchedule}
                disabled={saving}
                class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
              >
                Schedule
              </button>
            {/if}
          </div>
          
          <div class="flex items-center space-x-2">
            <button 
              on:click={handleSend}
              disabled={sending || !formData.subject.trim() || !formData.content.trim()}
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {sending ? 'Sending...' : 'Send Now'}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Subscriber Count -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 class="font-medium text-gray-900 dark:text-white mb-2">Subscribers</h3>
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{subscriberCount}</div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">total subscribers</p>
        </div>
        
        <!-- Campaign Status -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 class="font-medium text-gray-900 dark:text-white mb-4">Campaign Status</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Status:</span>
              <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-90/20 dark:text-blue-400 rounded-full">
                {formData.status}
              </span>
            </div>
            
            {#if campaign?.scheduled_at}
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-60 dark:text-gray-400">Scheduled:</span>
                <span class="text-sm text-gray-900 dark:text-white">
                  {new Date(campaign.scheduled_at).toLocaleString()}
                </span>
              </div>
            {/if}
            
            {#if campaign?.sent_at}
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Sent:</span>
                <span class="text-sm text-gray-900 dark:text-white">
                  {new Date(campaign.sent_at).toLocaleString()}
                </span>
              </div>
            {/if}
          </div>
        </div>
        
        <!-- Tips -->
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border-blue-200 dark:border-blue-800">
          <h3 class="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Tips</h3>
          <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Keep subject lines under 50 characters</li>
            <li>• Personalize content with subscriber names</li>
            <li>• Include a clear call-to-action</li>
            <li>• Test on mobile devices before sending</li>
          </ul>
        </div>
      </div>
    </div>
  {/if}
</div>