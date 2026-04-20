import { supabase } from '../lib/supabase';
import type { DbMessage } from '../types/database.types';
import type { ServiceResult } from '../types/auth.types';

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string | null;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export const messageService = {
  async getMessages(requestId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey (name)
      `)
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data.map((m: Record<string, unknown>) => {
      const sender = m.sender as Record<string, unknown> | null;
      const db = m as unknown as DbMessage;
      return {
        id: db.id,
        requestId: db.request_id,
        senderId: db.sender_id,
        senderName: sender?.name as string | null,
        content: db.content,
        createdAt: db.created_at,
        isRead: db.is_read,
      };
    });
  },

  async sendMessage(
    requestId: string,
    senderId: string,
    content: string,
  ): Promise<ServiceResult<boolean>> {
    const { error } = await supabase
      .from('messages')
      .insert({
        request_id: requestId,
        sender_id: senderId,
        content,
        message_type: 'text',
      });

    if (error) return { data: null, error: 'errors.generic' };
    return { data: true, error: null };
  },
};
