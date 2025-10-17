# Phase 4: Advanced Features Migration Manual

## Overview

**Duration**: 2 weeks
**Priority**: 🟡 Medium
**Team**: 2-3 Full-stack developers
**Dependencies**: Phase 1, 2, & 3 completion

Phase 4 focuses on migrating advanced features including customer support system, newsletter management, user account management, and performance optimizations. These features enhance the platform's functionality and user experience.

## Architecture Analysis

### Current Next.js Advanced Features

#### 1. **Customer Support System**
- **Live Chat** - Real-time chat with WebSocket connections
- **Support Tickets** - Ticket creation, assignment, and management
- **Chat Analytics** - Chat metrics and performance tracking
- **Customer Support Dashboard** - Comprehensive support management

#### 2. **Newsletter System**
- **Campaign Management** - Create and schedule email campaigns
- **Subscriber Management** - Handle subscriptions and preferences
- **Email Templates** - Customizable email templates
- **Newsletter Analytics** - Track campaign performance

#### 3. **User Account Management**
- **Profile Management** - User profile customization
- **Account Settings** - Privacy and notification preferences
- **Order History** - Customer purchase history
- **Account Security** - Password management and 2FA

#### 4. **Performance & SEO Features**
- **Advanced SEO** - Meta tags, structured data, sitemaps
- **Performance Optimization** - Lazy loading, code splitting
- **Analytics Integration** - Google Analytics and custom tracking
- **Caching Strategies** - Browser and server-side caching

### Target SvelteKit Advanced Features

#### 1. **Support System Structure**
```
src/routes/
├── support/
│   ├── +page.svelte              # Support portal
│   ├── chat/
│   │   ├── +page.svelte          # Live chat interface
│   │   └── [sessionId]/
│   │       └── +page.svelte      # Chat session
│   └── tickets/
│       ├── +page.svelte          # Ticket listing
│       ├── new/
│       │   └── +page.svelte      # Create ticket
│       └── [ticketId]/
│           └── +page.svelte      # Ticket details
```

#### 2. **Newsletter System Structure**
```
src/routes/admin/newsletter/
├── +page.svelte                  # Newsletter dashboard
├── campaigns/
│   ├── +page.svelte              # Campaign listing
│   ├── new/
│   │   └── +page.svelte          # Create campaign
│   └── [campaignId]/
│       └── +page.svelte          # Campaign editor
└── subscribers/
    └── +page.svelte              # Subscriber management
```

## Implementation Guide

### Week 1: Customer Support & Newsletter Systems

#### Day 1-3: Customer Support System

**1. WebSocket Chat Implementation**
```typescript
// src/lib/server/websocket/chat.ts
import { Server } from 'socket.io';
import type { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { createServiceRoleClient } from '../supabase';

interface ChatEvents extends DefaultEventsMap {
  'join-room': (roomId: string) => void;
  'send-message': (data: {
    roomId: string;
    message: string;
    userId: string;
    userType: 'customer' | 'support';
  }) => void;
  'message-received': (data: {
    id: string;
    message: string;
    sender: {
      id: string;
      name: string;
      type: 'customer' | 'support';
    };
    timestamp: string;
  }) => void;
  'typing': (data: { roomId: string; userId: string; isTyping: boolean }) => void;
  'agent-joined': (data: { agentId: string; agentName: string }) => void;
  'agent-left': (data: { agentId: string }) => void;
}

export class ChatManager {
  private io: Server<ChatEvents>;
  private activeRooms = new Map<string, Set<string>>();
  private userSockets = new Map<string, string>(); // userId -> socketId
  
  constructor(io: Server<ChatEvents>) {
    this.io = io;
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected to chat:', socket.id);
      
      socket.on('join-room', async (roomId) => {
        try {
          // Verify user has access to this room
          const hasAccess = await this.verifyRoomAccess(socket.data.userId, roomId);
          if (!hasAccess) {
            socket.emit('error', 'Access denied');
            return;
          }
          
          // Join room
          socket.join(roomId);
          
          // Track active users
          if (!this.activeRooms.has(roomId)) {
            this.activeRooms.set(roomId, new Set());
          }
          this.activeRooms.get(roomId)!.add(socket.data.userId);
          this.userSockets.set(socket.data.userId, socket.id);
          
          // Notify others in room
          const userInfo = await this.getUserInfo(socket.data.userId);
          socket.to(roomId).emit('user-joined', {
            userId: socket.data.userId,
            userName: userInfo.name,
            userType: userInfo.type
          });
          
          // Send room status
          const activeUsers = Array.from(this.activeRooms.get(roomId) || []);
          socket.emit('room-status', { activeUsers });
          
        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('error', 'Failed to join room');
        }
      });
      
      socket.on('send-message', async (data) => {
        try {
          const { roomId, message, userId, userType } = data;
          
          // Save message to database
          const savedMessage = await this.saveMessage({
            chatSessionId: roomId,
            senderId: userId,
            content: message,
            messageType: userType === 'customer' ? 'customer' : 'support'
          });
          
          // Get sender info
          const senderInfo = await this.getUserInfo(userId);
          
          // Broadcast to room
          this.io.to(roomId).emit('message-received', {
            id: savedMessage.id,
            message: savedMessage.content,
            sender: {
              id: senderInfo.id,
              name: senderInfo.name,
              type: userType
            },
            timestamp: savedMessage.created_at
          });
          
          // Update typing status
          this.updateTypingStatus(roomId, userId, false);
          
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', 'Failed to send message');
        }
      });
      
      socket.on('typing', (data) => {
        const { roomId, userId, isTyping } = data;
        this.updateTypingStatus(roomId, userId, isTyping);
      });
      
      socket.on('disconnect', () => {
        console.log('User disconnected from chat:', socket.id);
        this.handleDisconnect(socket);
      });
    });
  }
  
  private async verifyRoomAccess(userId: string, roomId: string): Promise<boolean> {
    const supabase = createServiceRoleClient();
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('id, customer_id, support_agent_id')
      .eq('id', roomId)
      .or(`customer_id.eq.${userId},support_agent_id.eq.${userId}`)
      .single();
    
    return !error && !!data;
  }
  
  private async saveMessage(messageData: {
    chatSessionId: string;
    senderId: string;
    content: string;
    messageType: string;
  }) {
    const supabase = createServiceRoleClient();
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        chat_session_id: messageData.chatSessionId,
        sender_id: messageData.senderId,
        content: messageData.content,
        message_type: messageData.messageType,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
  
  private async getUserInfo(userId: string) {
    const supabase = createServiceRoleClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      type: data.role === 'admin' ? 'support' : 'customer'
    };
  }
  
  private updateTypingStatus(roomId: string, userId: string, isTyping: boolean) {
    this.io.to(roomId).emit('typing', {
      userId,
      isTyping
    });
  }
  
  private handleDisconnect(socket: any) {
    const userId = socket.data.userId;
    
    // Remove from tracking
    this.userSockets.delete(userId);
    
    // Remove from rooms
    for (const [roomId, users] of this.activeRooms.entries()) {
      if (users.has(userId)) {
        users.delete(userId);
        if (users.size === 0) {
          this.activeRooms.delete(roomId);
        } else {
          // Notify others
          socket.to(roomId).emit('user-left', { userId });
        }
      }
    }
  }
}
```

**2. Live Chat Component**
```svelte
<!-- src/components/support/LiveChat.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { io } from 'socket.io-client';
  import { page } from '$app/stores';
  import { apiClient } from '$lib/api/client';
  import MessageBubble from './MessageBubble.svelte';
  import ChatInput from './ChatInput.svelte';
  import TypingIndicator from './TypingIndicator.svelte';
  
  export let sessionId: string;
  export let userId: string;
  export let userType: 'customer' | 'support';
  
  let socket;
  let messages = [];
  let typingUsers = new Set();
  let isConnected = false;
  let error = null;
  let messageInput = '';
  let chatContainer;
  
  onMount(async () => {
    try {
      // Initialize socket connection
      socket = io('/chat', {
        auth: {
          userId,
          userType
        }
      });
      
      // Set up event listeners
      socket.on('connect', () => {
        isConnected = true;
        socket.emit('join-room', sessionId);
      });
      
      socket.on('disconnect', () => {
        isConnected = false;
      });
      
      socket.on('message-received', (message) => {
        messages = [...messages, message];
        scrollToBottom();
      });
      
      socket.on('typing', ({ userId: typingUserId, isTyping }) => {
        if (typingUserId !== userId) {
          if (isTyping) {
            typingUsers = new Set([...typingUsers, typingUserId]);
          } else {
            typingUsers = new Set([...typingUsers].filter(id => id !== typingUserId));
          }
        }
      });
      
      socket.on('error', (errorMessage) => {
        error = errorMessage;
      });
      
      // Load existing messages
      await loadMessages();
      
    } catch (err) {
      error = 'Failed to connect to chat';
      console.error('Chat connection error:', err);
    }
  });
  
  onDestroy(() => {
    if (socket) {
      socket.disconnect();
    }
  });
  
  async function loadMessages() {
    try {
      const chatMessages = await apiClient.support.getChatMessages(sessionId);
      messages = chatMessages;
      scrollToBottom();
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }
  
  function sendMessage() {
    if (!messageInput.trim() || !isConnected) return;
    
    const message = messageInput.trim();
    messageInput = '';
    
    socket.emit('send-message', {
      roomId: sessionId,
      message,
      userId,
      userType
    });
  }
  
  function handleTyping(isTyping: boolean) {
    if (socket && isConnected) {
      socket.emit('typing', {
        roomId: sessionId,
        userId,
        isTyping
      });
    }
  }
  
  function scrollToBottom() {
    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
  
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }
</script>

<div class="flex flex-col h-full bg-white dark:bg-gray-800">
  <!-- Chat Header -->
  <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center space-x-3">
      <div class="relative">
        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <span class="text-white font-medium">Support</span>
        </div>
        {#if isConnected}
          <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        {:else}
          <div class="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white dark:border-gray-800"></div>
        {/if}
      </div>
      <div>
        <h3 class="font-medium text-gray-900 dark:text-white">Live Support</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {isConnected ? 'Online' : 'Connecting...'}
        </p>
      </div>
    </div>
  </div>
  
  <!-- Messages Container -->
  <div bind:this={chatContainer} class="flex-1 overflow-y-auto p-4 space-y-4">
    {#if error}
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p class="text-red-600 dark:text-red-400">{error}</p>
      </div>
    {/if}
    
    {#each messages as message (message.id)}
      <MessageBubble 
        message={message}
        isOwn={message.sender.id === userId}
      />
    {/each}
    
    {#if typingUsers.size > 0}
      <TypingIndicator users={Array.from(typingUsers)} />
    {/if}
  </div>
  
  <!-- Message Input -->
  <div class="border-t border-gray-200 dark:border-gray-700 p-4">
    <div class="flex items-end space-x-2">
      <div class="flex-1">
        <textarea
          bind:value={messageInput}
          on:keypress={handleKeyPress}
          on:input={() => handleTyping(true)}
          on:blur={() => handleTyping(false)}
          placeholder="Type your message..."
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          rows="1"
          disabled={!isConnected}
        ></textarea>
      </div>
      
      <button 
        on:click={sendMessage}
        disabled={!messageInput.trim() || !isConnected}
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>
    </div>
  </div>
</div>
```

#### Day 4-5: Newsletter System

**1. Newsletter Campaign Management**
```typescript
// src/lib/server/api/routes/newsletter/campaigns/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { requireAdmin } from '../../../utils';
import { createServiceRoleClient } from '$lib/server/supabase';
import { sendEmailCampaign } from '$lib/server/email/newsletter';

export async function GET(event: RequestEvent) {
  try {
    await requireAdmin(event);
    const supabase = createServiceRoleClient();
    
    const url = new URL(event.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('newsletter_campaigns')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: campaigns, error, count } = await query
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return json({
      campaigns: campaigns || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(event: RequestEvent) {
  try {
    await requireAdmin(event);
    const data = await event.request.json();
    
    const supabase = createServiceRoleClient();
    
    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('newsletter_campaigns')
      .insert({
        subject: data.subject,
        content: data.content,
        status: data.status || 'draft',
        scheduled_at: data.scheduledAt || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (campaignError) throw campaignError;
    
    // If status is 'sending', send immediately
    if (data.status === 'sending') {
      try {
        await sendEmailCampaign(campaign.id);
        
        // Update campaign status
        await supabase
          .from('newsletter_campaigns')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', campaign.id);
          
      } catch (sendError) {
        console.error('Failed to send campaign:', sendError);
        
        // Update campaign status to failed
        await supabase
          .from('newsletter_campaigns')
          .update({ status: 'failed', error_message: sendError.message })
          .eq('id', campaign.id);
      }
    }
    
    return json({ success: true, campaign });
  } catch (error) {
    return handleApiError(error);
  }
}
```

**2. Campaign Editor Component**
```svelte
<!-- src/components/admin/newsletter/CampaignEditor.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiClient } from '$lib/api/client';
  import RichTextEditor from '$components/ui/RichTextEditor.svelte';
  import EmailPreview from '$components/admin/newsletter/EmailPreview.svelte';
  import SubscriberCount from '$components/admin/newsletter/SubscriberCount.svelte';
  
  export let campaign = null;
  export let mode = 'create'; // 'create' | 'edit'
  
  let formData = {
    subject: '',
    content: '',
    status: 'draft'
  };
  
  let loading = false;
  let saving = false;
  let sending = false;
  let error = null;
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
        await apiClient.admin.newsletter.updateCampaign(campaign.id, formData);
      }
    } catch (err) {
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
        await apiClient.admin.newsletter.updateCampaign(campaign.id, {
          ...formData,
          status: 'sending'
        });
      }
    } catch (err) {
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
      await apiClient.admin.newsletter.updateCampaign(campaign.id, {
        ...formData,
        status: 'scheduled',
        scheduledAt: new Date(scheduledAt).toISOString()
      });
    } catch (err) {
      error = err.message;
    } finally {
      saving = false;
    }
  }
  
  function togglePreview() {
    showPreview = !showPreview;
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
      <p class="text-red-600 dark:text-red-400">{error}</p>
    </div>
  {/if}
  
  {#if showPreview}
    <!-- Email Preview -->
    <EmailPreview 
      subject={formData.subject}
      content={formData.content}
    />
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
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Content
          </label>
          <RichTextEditor 
            bind:value={formData.content}
            placeholder="Write your email content..."
            height="400px"
          />
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
            
            {mode === 'edit' && campaign?.status !== 'sent' && (
              <button 
                on:click={handleSchedule}
                disabled={saving}
                class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
              >
                Schedule
              </button>
            )}
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
        <SubscriberCount count={subscriberCount} />
        
        <!-- Campaign Status -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 class="font-medium text-gray-900 dark:text-white mb-4">Campaign Status</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Status:</span>
              <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                {formData.status}
              </span>
            </div>
            
            {campaign?.scheduled_at && (
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Scheduled:</span>
                <span class="text-sm text-gray-900 dark:text-white">
                  {new Date(campaign.scheduled_at).toLocaleString()}
                </span>
              </div>
            )}
            
            {campaign?.sent_at && (
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Sent:</span>
                <span class="text-sm text-gray-900 dark:text-white">
                  {new Date(campaign.sent_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <!-- Tips -->
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
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
```

### Week 2: User Account Management & Performance

#### Day 6-8: User Account Management

**1. User Profile Management**
```svelte
<!-- src/routes/account/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiClient } from '$lib/api/client';
  import ProfileForm from '$components/account/ProfileForm.svelte';
  import AccountSettings from '$components/account/AccountSettings.svelte';
  import OrderHistory from '$components/account/OrderHistory.svelte';
  import NotificationSettings from '$components/account/NotificationSettings.svelte';
  
  let user = null;
  let loading = true;
  let activeTab = 'profile';
  let error = null;
  
  onMount(async () => {
    try {
      user = await apiClient.user.getProfile();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
  
  async function handleProfileUpdate(profileData) {
    try {
      const updatedUser = await apiClient.user.updateProfile(profileData);
      user = updatedUser;
    } catch (err) {
      error = err.message;
    }
  }
  
  async function handlePasswordChange(passwordData) {
    try {
      await apiClient.user.changePassword(passwordData);
      // Show success message
    } catch (err) {
      error = err.message;
    }
  }
  
  async function handleNotificationSettings(settings) {
    try {
      await apiClient.user.updateNotificationSettings(settings);
      user = { ...user, ...settings };
    } catch (err) {
      error = err.message;
    }
  }
</script>

<svelte:head>
  <title>My Account</title>
  <meta name="description" content="Manage your account settings and preferences." />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        My Account
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Manage your profile, settings, and preferences
      </p>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    {:else if error}
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p class="text-red-600 dark:text-red-400">{error}</p>
      </div>
    {:else if user}
      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8">
          {#each ['profile', 'settings', 'notifications', 'orders'] as tab}
            <button 
              on:click={() => activeTab = tab}
              class="py-2 px-1 border-b-2 font-medium text-sm transition-colors {
                activeTab === tab 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          {/each}
        </nav>
      </div>
      
      <!-- Tab Content -->
      <div class="mt-8">
        {#if activeTab === 'profile'}
          <ProfileForm 
            user={user}
            on:update={(e) => handleProfileUpdate(e.detail)}
          />
        {:else if activeTab === 'settings'}
          <AccountSettings 
            user={user}
            on:passwordChange={(e) => handlePasswordChange(e.detail)}
          />
        {:else if activeTab === 'notifications'}
          <NotificationSettings 
            user={user}
            on:update={(e) => handleNotificationSettings(e.detail)}
          />
        {:else if activeTab === 'orders'}
          <OrderHistory userId={user.id} />
        {/if}
      </div>
    {/if}
  </div>
</div>
```

#### Day 9-10: Performance & SEO Optimization

**1. SEO Enhancement**
```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// SEO metadata hook
const seoHook: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  // Add SEO headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
};

// Generate structured data for SEO
export function generateStructuredData(type: string, data: any) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };
  
  return JSON.stringify(structuredData);
}

// Generate meta tags
export function generateMetaTags(pageData: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}) {
  const metaTags = [
    { title: pageData.title },
    { name: 'description', content: pageData.description },
    { name: 'og:title', content: pageData.title },
    { name: 'og:description', content: pageData.description },
    { name: 'og:type', content: pageData.type || 'website' },
    { name: 'og:image', content: pageData.image || '/default-og-image.jpg' },
    { name: 'og:url', content: pageData.url || '' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: pageData.title },
    { name: 'twitter:description', content: pageData.description },
    { name: 'twitter:image', content: pageData.image || '/default-og-image.jpg' }
  ];
  
  return metaTags;
}

export const handle = sequence(seoHook);
```

**2. Performance Optimization**
```typescript
// src/lib/performance/image-optimization.ts
import { createClientClient } from '../server/supabase';

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
}

export async function getOptimizedImageUrl(
  imageUrl: string,
  options: ImageOptions = {}
): Promise<string> {
  // If using a service like Cloudinary or Imgix
  if (imageUrl.includes('cloudinary') || imageUrl.includes('imgix')) {
    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    if (options.fit) params.set('fit', options.fit);
    
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}${params.toString()}`;
  }
  
  // For Supabase storage, use their image transformation API
  if (imageUrl.includes('supabase.co/storage')) {
    const params = new URLSearchParams();
    
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.quality) params.set('quality', options.quality.toString());
    if (options.format) params.set('format', options.format);
    
    return `${imageUrl}?${params.toString()}`;
  }
  
  // Fallback to original image
  return imageUrl;
}

// Lazy loading image component
// src/components/ui/OptimizedImage.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { getOptimizedImageUrl } from '$lib/performance/image-optimization';
  
  export let src: string;
  export let alt: string;
  export let width?: number;
  export let height?: number;
  export let loading: 'lazy' | 'eager' = 'lazy';
  export let class: string = '';
  
  let imgElement: HTMLImageElement;
  let isLoaded = false;
  let isError = false;
  let optimizedSrc = '';
  
  onMount(async () => {
    try {
      optimizedSrc = await getOptimizedImageUrl(src, {
        width,
        height,
        quality: 80,
        format: 'webp'
      });
    } catch (error) {
      console.error('Failed to optimize image:', error);
      optimizedSrc = src;
    }
  });
  
  function handleLoad() {
    isLoaded = true;
  }
  
  function handleError() {
    isError = true;
  }
</script>

<div class="relative {class}">
  <img
    bind:this={imgElement}
    src={optimizedSrc}
    alt={alt}
    {width}
    {height}
    loading={loading}
    class="w-full h-full object-cover transition-opacity duration-300 {isLoaded ? 'opacity-100' : 'opacity-0'}"
    on:load={handleLoad}
    on:error={handleError}
  />
  
  {!isLoaded && !isError && (
    <div class="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
  )}
  
  {isError && (
    <div class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  )}
</div>
```

## Migration Strategy

### 1. **Performance Optimization**
- **Code Splitting**: Implement route-based and component-based code splitting
- **Image Optimization**: Use modern image formats and responsive images
- **Caching**: Implement browser and server-side caching strategies
- **Lazy Loading**: Implement lazy loading for images and components

### 2. **Real-time Features**
- **WebSocket Integration**: Real-time chat and notifications
- **Event-driven Architecture**: Event handling for live updates
- **Scalability**: Handle concurrent users efficiently

### 3. **SEO Enhancement**
- **Meta Tags**: Dynamic meta tag generation
- **Structured Data**: JSON-LD for search engines
- **Sitemap Generation**: Automatic sitemap generation
- **Performance Metrics**: Core Web Vitals optimization

## Common Issues & Solutions

### 1. **WebSocket Connection Issues**
**Problem**: WebSocket connections dropping frequently
**Solution**: Implement reconnection logic and heartbeat
```typescript
socket.on('disconnect', () => {
  setTimeout(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, 1000);
});
```

### 2. **Email Delivery Issues**
**Problem**: Newsletter emails not being delivered
**Solution**: Implement proper email authentication and monitoring
```typescript
// Add SPF, DKIM, and DMARC records
// Monitor bounce rates and spam complaints
```

### 3. **Performance Regression**
**Problem**: Page load times increasing after migration
**Solution**: Implement performance monitoring and optimization
```typescript
// Use Lighthouse CI for performance monitoring
// Implement bundle analysis and optimization
```

## Deliverables

### Code Deliverables
- [ ] Customer support system with live chat
- [ ] Newsletter campaign management
- [ ] User account management system
- [ ] Performance optimization suite
- [ ] SEO enhancement tools
- [ ] Analytics integration

### Documentation Deliverables
- [ ] Support system documentation
- [ ] Newsletter management guide
- [ ] Performance optimization guide
- [ ] SEO best practices documentation

### Testing Deliverables
- [ ] Real-time feature tests
- [ ] Email delivery tests
- [ ] Performance benchmarks
- [ ] SEO validation tests

## Success Criteria

### Technical Metrics
- [ ] Real-time chat latency <100ms
- [ ] Email delivery rate >95%
- [ ] Page load times <2 seconds
- [ ] Core Web Vitals scores >90
- [ ] SEO score >85

### Functional Metrics
- [ ] Live chat working smoothly
- [ ] Newsletter campaigns sending successfully
- [ ] User account management complete
- [ ] Performance improvements measurable
- [ ] SEO enhancements effective

## Next Phase Preparation

Upon completion of Phase 4, the team will have:
1. **Complete advanced features** including support and newsletter systems
2. **Optimized performance** with fast load times and high scores
3. **Enhanced SEO** with proper meta tags and structured data
4. **User account management** with full functionality
5. **Real-time capabilities** for live chat and notifications

This foundation enables the team to proceed with **Phase 5: Testing & Deployment** with a fully-featured, optimized platform.

---

**Phase 4 Status**: 🔄 Ready to Start
**Dependencies**: Phase 1, 2, & 3 completion
**Blocked By**: None
**Next Phase**: Phase 5 - Testing & Deployment
