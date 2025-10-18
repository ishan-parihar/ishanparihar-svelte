import { createServiceRoleClient } from './supabase';
import { TimeSpan } from 'lucia';

// Create supabase client instance with lazy initialization
let _supabase: any = null;

export function getSupabase() {
  if (!_supabase) {
    _supabase = createServiceRoleClient();
  }
  return _supabase;
}

// Lucia adapter implementation using Supabase
// Complete implementation for Lucia v3 with correct return types
export const adapter = {
  // Basic methods
  getUser: async (userId: string) => {
    const { data, error } = await getSupabase()
      .from('users')
      .select('id, email, name, role, email_verified, picture, permissions')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    // Ensure permissions is always an array
    if (data && !Array.isArray(data.permissions)) {
      data.permissions = data.permissions ? [data.permissions] : [];
    }
    
    return data;
  },
  
  getSession: async (sessionId: string) => {
    const { data, error } = await getSupabase()
      .from('sessions')
      .select('id, user_id, expires_at')
      .eq('id', sessionId)
      .gte('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) {
      console.error('Error fetching session:', error);
      return null;
    }
    
    // Transform to Lucia expected format
    return {
      id: data.id,
      userId: data.user_id,
      expiresAt: new Date(data.expires_at),
      fresh: false,
      attributes: {}
    };
  },
  
  setSession: async (sessionData: { id: string; userId: string; expiresAt: Date }) => {
    const { error } = await getSupabase()
      .from('sessions')
      .insert({
        id: sessionData.id,
        user_id: sessionData.userId,
        expires_at: sessionData.expiresAt.toISOString()
      });
    
    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },
  
  updateSessionExpiration: async (sessionId: string, expiresAt: Date) => {
    const { error } = await getSupabase()
      .from('sessions')
      .update({
        expires_at: expiresAt.toISOString()
      })
      .eq('id', sessionId);
    
    if (error) {
      console.error('Error updating session expiration:', error);
      throw error;
    }
  },
  
  deleteSession: async (sessionId: string) => {
    const { error } = await getSupabase()
      .from('sessions')
      .delete()
      .eq('id', sessionId);
    
    if (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },
  
  deleteSessions: async (userId: string) => {
    const { error } = await getSupabase()
      .from('sessions')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting sessions:', error);
      throw error;
    }
  },
  
  // Additional methods required by Lucia v3
  getSessionAndUser: async (sessionId: string): Promise<[any, any] | [null, null]> => {
    // First, get the session
    const sessionResult = await getSupabase()
      .from('sessions')
      .select('id, user_id, expires_at')
      .eq('id', sessionId)
      .gte('expires_at', new Date().toISOString())
      .single();
    
    if (sessionResult.error || !sessionResult.data) {
      // Return tuple with both values as null
      return [null, null];
    }
    
    const sessionData = sessionResult.data;
    
    // Then, get the user
    const userResult = await getSupabase()
      .from('users')
      .select('id, email, name, role, email_verified, picture, permissions')
      .eq('id', sessionData.user_id)
      .single();
    
    if (userResult.error || !userResult.data) {
      // Return tuple with both values as null
      return [null, null];
    }
    
    const userData = userResult.data;
    
    // Ensure permissions is always an array
    if (userData && !Array.isArray(userData.permissions)) {
      userData.permissions = userData.permissions ? [userData.permissions] : [];
    }
    
    // Return correctly typed values
    return [{
      id: sessionData.id,
      userId: sessionData.user_id,
      expiresAt: new Date(sessionData.expires_at),
      fresh: false,
      attributes: {}
    }, userData];
  },
  
  getUserSessions: async (userId: string) => {
    const { data, error } = await getSupabase()
      .from('sessions')
      .select('id, user_id, expires_at')
      .eq('user_id', userId)
      .gte('expires_at', new Date().toISOString());
    
    if (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
    
    return data.map((session: any) => ({
      id: session.id,
      userId: session.user_id,
      expiresAt: new Date(session.expires_at),
      fresh: false,
      attributes: {}
    }));
  },
  
  deleteExpiredSessions: async () => {
    const { error } = await getSupabase()
      .from('sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());
    
    if (error) {
      console.error('Error deleting expired sessions:', error);
      throw error;
    }
  },
  
  deleteUserSessions: async (userId: string) => {
    const { error } = await getSupabase()
      .from('sessions')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting user sessions:', error);
      throw error;
    }
  }
};

// Export the db object for use in API routes
export const db = getSupabase;
