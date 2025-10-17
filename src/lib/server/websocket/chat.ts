import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
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
    this.io.on('connection', (socket: Socket<DefaultEventsMap, ChatEvents>) => {
      console.log('User connected to chat:', socket.id);
      
      socket.on('join-room', async (roomId: string) => {
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
      
      socket.on('send-message', async (data: {
        roomId: string;
        message: string;
        userId: string;
        userType: 'customer' | 'support';
      }) => {
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
      
      socket.on('typing', (data: { roomId: string; userId: string; isTyping: boolean }) => {
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
  
  private handleDisconnect(socket: Socket<DefaultEventsMap, ChatEvents>) {
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