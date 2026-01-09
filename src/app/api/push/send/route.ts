import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import webpush from 'web-push';
import type { PushNotificationPayload } from '@/lib/push/types';

// Configure web-push with VAPID details
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error('VAPID keys are not configured!');
}

webpush.setVapidDetails(
  'mailto:noreply@minhavez.com',
  vapidPublicKey,
  vapidPrivateKey
);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { targetUserId, notification } = body as {
      targetUserId: string;
      notification: PushNotificationPayload;
    };

    if (!targetUserId || !notification) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get all push subscriptions for the target user
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', targetUserId);

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No subscriptions found for user' },
        { status: 404 }
      );
    }

    // Send push notification to all user's devices
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            sub.subscription,
            JSON.stringify(notification)
          );
          return { success: true, endpoint: sub.subscription.endpoint };
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

          return { success: false, endpoint: sub.subscription.endpoint, error };
        }
      })
    );

    const successCount = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;

    return NextResponse.json({
      success: true,
      sent: successCount,
      total: subscriptions.length,
      results,
    });
  } catch (error) {
    console.error('Error in push send:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
