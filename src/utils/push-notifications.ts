import { supabase } from "@/supabaseClient";

// Helper to get device info (inlined to avoid circular dependencies/mocking issues)
const getDeviceInfo = (): string => {
  try {
    const ua = navigator.userAgent;
    const match = ua.match(/\(([^)]+)\)/);
    return match ? match[1] : "Unknown Device";
  } catch {
    return "Unknown Device";
  }
};

/**
 * Converts a base64 string to a Uint8Array.
 * Used for processing VAPID public keys for push notifications.
 *
 * @param base64String - The base64 URL-safe encoded string.
 * @returns A Uint8Array representing the key.
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Requests push notification permission and subscribes the user.
 * Persists the subscription to Supabase if the user is authenticated.
 *
 * @returns {Promise<PushSubscription>} The resulting subscription object.
 * @throws {Error} if push is not supported or VAPID key is missing.
 */
export async function subscribeToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported by your browser");
  }

  const registration = await navigator.serviceWorker.ready;

  // Check if we already have a subscription
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as
      | string
      | undefined;
    if (!vapidPublicKey) {
      throw new Error("VAPID Public Key is missing from environment variables");
    }

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  // Save subscription to Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const subscriptionObj = subscription.toJSON();
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        subscription: subscriptionObj as import("../types/database.types").Json,
        endpoint: subscription.endpoint,
        device_info: getDeviceInfo(),
      },
      { onConflict: "user_id, endpoint" }
    );

    if (error) throw error;
  }

  return subscription;
}

/**
 * Unsubscribes the user from push notifications.
 * Removes the subscription from both the browser and the Supabase database.
 */
export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();

    // Remove from Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .match({ user_id: user.id, endpoint: subscription.endpoint });
    }
  }
}

/**
 * Checks if the browser currently has an active push subscription.
 *
 * @returns {Promise<boolean>} True if subscribed, false otherwise.
 */
export async function checkPushSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}
