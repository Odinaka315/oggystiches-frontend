/**
 * Configuration for backend server connectivity and hosting environments.
 *
 * TOGGLE GUIDE:
 * - Render Free Tier (Cold Starts): Set VITE_COLD_START_WARMUP=true in .env
 * - Paid Hosting (Always-on / 0s cold start): Set VITE_COLD_START_WARMUP=false (or remove it)
 */

const apiUrl = import.meta.env.VITE_API_URL || "https://oggystiches-backend.onrender.com/api/v1";

// Derive backend base origin (e.g., https://oggystiches-backend.onrender.com)
export const getBackendOrigin = (): string => {
  try {
    const url = new URL(apiUrl);
    return url.origin;
  } catch {
    return "https://oggystiches-backend.onrender.com";
  }
};

export const SERVER_CONFIG = {
  /**
   * Master toggle for cold-start detection and proactive background warmup.
   * When false (e.g. paid tier): all warmup pinging and cold-start banners are 100% disabled.
   */
  isColdStartMode: import.meta.env.VITE_COLD_START_WARMUP === "true",

  /**
   * Root ping URL (FastAPI root '/' returns 200 with minimal overhead).
   */
  pingUrl: `${getBackendOrigin()}/`,

  /**
   * Threshold in milliseconds after which the backend is considered sleeping / waking up.
   */
  coldStartThresholdMs: 3000,

  /**
   * Typical cold-start duration on Render free tier in seconds.
   */
  estimatedWakeSeconds: 50,
};
