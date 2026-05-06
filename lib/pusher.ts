import Pusher from "pusher";

// Pusher server instance for triggering events
// If no credentials provided, we create a mock that logs events instead
let pusherServer: Pusher | null = null;

if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET) {
  pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER || "ap2",
    useTLS: true,
  });
}

export async function triggerEvent(channel: string, event: string, data: any) {
  if (pusherServer) {
    await pusherServer.trigger(channel, event, data);
  } else {
    console.log(`[Pusher Mock] Channel: ${channel}, Event: ${event}`, data);
  }
}

// Export the key and cluster for client-side usage
export const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || "";
export const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2";
