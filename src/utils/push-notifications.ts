import { supabase } from "../supabaseClient";
import { getDeviceInfo } from "./crypto";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

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

export async function subscribeToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported by your browser");
  }

  const registration = await navigator.serviceWorker.ready;

  // Check if we already have a subscription
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    if (!VAPID_PUBLIC_KEY) {
      throw new Error("VAPID Public Key is missing from environment variables");
    }

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
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
        subscription: subscriptionObj,
        endpoint: subscription.endpoint,
        device_info: getDeviceInfo(),
      },
      { onConflict: "user_id, endpoint" }
    );

    if (error) throw error;
  }

  return subscription;
}

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

export async function checkPushSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}
