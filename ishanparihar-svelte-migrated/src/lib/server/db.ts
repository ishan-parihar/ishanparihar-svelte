import { createServiceRoleClient } from './supabase';

export const supabase = createServiceRoleClient();

// Lucia adapter implementation using Supabase
export const adapter = {
  getUser: async (userId: string) => {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('sessions')
      .select('id, user_id, expires_at')
      .eq('id', sessionId)
      .gte('expires_at', new Date().toISOString())
      .single();
    
    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }
    
    return data;
  },
  
  createSession: async (sessionData: any) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        id: sessionData.id,
        user_id: sessionData.userId,
        expires_at: new Date(sessionData.expiresAt).toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }
    
    return data;
  },
  
  deleteSession: async (sessionId: string) => {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);
    
    if (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },
  
  // Additional adapter methods that Lucia might need
  updateUser: async (userId: string, attributes: any) => {
    const { data, error } = await supabase
      .from('users')
      .update(attributes)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
    
    return data;
  }
};