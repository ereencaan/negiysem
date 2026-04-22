import { supabase } from '../lib/supabase';

export const followupService = {
  async checkAndCreateFollowUps(userId: string): Promise<void> {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    const { data: requests } = await supabase
      .from('outfit_requests')
      .select('id, stylist_id, updated_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .eq('follow_up_sent', false)
      .lt('updated_at', threeDaysAgo);

    if (!requests || requests.length === 0) return;

    for (const req of requests as Array<{ id: string; stylist_id: string }>) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'follow_up',
        title: 'Kombini kullandın mı?',
        body: 'Stilistinizin önerdiği kombini denediniz mi? Deneyiminizi paylaşın!',
        data: { request_id: req.id },
      });

      await supabase
        .from('outfit_requests')
        .update({ follow_up_sent: true })
        .eq('id', req.id);
    }
  },
};
