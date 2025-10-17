<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { io } from 'socket.io-client';
  import { page } from '$app/stores';
  import { apiClient } from '$lib/api/client';
  
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
      <div class="flex {message.sender.id === userId ? 'justify-end' : 'justify-start'}">
        <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg {
          message.sender.id === userId 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
        }">
          <p>{message.message}</p>
          <p class="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
        </div>
      </div>
    {/each}
    
    {#if typingUsers.size > 0}
      <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <div class="flex space-x-1">
          {#each Array.from(typingUsers) as typingUser, i}
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: {i * 0.1}s"></div>
          {/each}
        </div>
        <span class="ml-2">typing...</span>
      </div>
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