'use server';

import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';
import type { PushNotificationPayload } from './types';

// Initialize VAPID configuration
function initializeVapid() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!vapidPublicKey || !vapidPrivateKey) {
    throw new Error('VAPID keys are not configured');
  }

  webpush.setVapidDetails(
    'mailto:noreply@minhavez.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

/**
 * Send push notification to a specific user (Server Action)
 */
export async function sendPushNotification(
  userId: string,
  notification: PushNotificationPayload
): Promise<{ success: boolean; sent?: number; total?: number; error?: string }> {
  try {
    // Initialize VAPID
    initializeVapid();

    const supabase = await createClient();

    // Get all push subscriptions for the target user
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      return { success: false, error: 'Failed to fetch subscriptions' };
    }

    if (!subscriptions || subscriptions.length === 0) {
      return { success: false, error: 'No subscriptions found for user' };
    }

    // Send push notification to all user's devices
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            sub.subscription,
            JSON.stringify(notification)
          );
          return { success: true };
        } catch (error) {
          console.error('Error sending to endpoint:', error);

          // If subscription is invalid/expired, delete it
          if (error && typeof error === 'object' && 'statusCode' in error) {
            const statusCode = (error as { statusCode: number }).statusCode;
            if (statusCode === 410 || statusCode === 404) {
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('id', sub.id);
            }
          }

          return { success: false };
        }
      })
    );

    const successCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;

    return {
      success: successCount > 0,
      sent: successCount,
      total: subscriptions.length,
    };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
