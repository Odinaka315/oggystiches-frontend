import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { SERVER_CONFIG } from "../config/serverConfig";

export type ServerStatus = "idle" | "checking" | "waking" | "awake" | "error";

interface ServerWarmupContextType {
  status: ServerStatus;
  isWaking: boolean;
  isAwake: boolean;
  isColdStartMode: boolean;
  secondsElapsed: number;
  estimatedPercent: number;
  isDismissed: boolean;
  setIsDismissed: (dismissed: boolean) => void;
  retryWarmup: () => void;
}

const ServerWarmupContext = createContext<ServerWarmupContextType | null>(null);

const STORAGE_KEY = "oggy_server_last_awake";
// Render free tier spins down after 15 minutes of inactivity (900,000 ms)
const SPIN_DOWN_MS = 14 * 60 * 1000;

export function ServerWarmupProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<ServerStatus>(() => {
    if (!SERVER_CONFIG.isColdStartMode) return "awake";
    return "idle";
  });

  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thresholdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPingingRef = useRef(false);

  const clearAllTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (thresholdTimerRef.current) {
      clearTimeout(thresholdTimerRef.current);
      thresholdTimerRef.current = null;
    }
  };

  const executeWarmup = useCallback(async () => {
    // If cold start mode is toggled OFF (e.g. paid tier), do nothing and stay awake
    if (!SERVER_CONFIG.isColdStartMode) {
      setStatus("awake");
      return;
    }

    if (isPingingRef.current) return;
    isPingingRef.current = true;

    // Check if server was already awake recently in this browser session
    const lastAwakeStr = sessionStorage.getItem(STORAGE_KEY);
    if (lastAwakeStr) {
      const timeSince = Date.now() - parseInt(lastAwakeStr, 10);
      if (timeSince < SPIN_DOWN_MS) {
        // Server was verified awake less than 14 minutes ago
        setStatus("awake");
        isPingingRef.current = false;
        return;
      }
    }

    setStatus("checking");
    setSecondsElapsed(0);

    // If server takes longer than threshold (3s), mark as 'waking' to show UI
    thresholdTimerRef.current = setTimeout(() => {
      setStatus("waking");
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }, SERVER_CONFIG.coldStartThresholdMs);

    const attemptPing = async (attemptsLeft = 4): Promise<void> => {
      try {
        // Direct lightweight ping to the backend root /
        await axios.get(SERVER_CONFIG.pingUrl, {
          timeout: 70000, // Allow up to 70s for Render's container boot
          headers: { "Cache-Control": "no-cache" },
        });

        // Server responded successfully
        clearAllTimers();
        setStatus("awake");
        sessionStorage.setItem(STORAGE_KEY, Date.now().toString());

        // Invalidate product queries so fresh database items load without user refresh
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } catch (err: any) {
        // Render sometimes throws 502/503 for a brief moment while the container is launching
        if (attemptsLeft > 0) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return attemptPing(attemptsLeft - 1);
        }

        clearAllTimers();
        setStatus("error");
        console.warn("Backend warmup ping encountered an error:", err?.message || err);
      } finally {
        isPingingRef.current = false;
      }
    };

    attemptPing();
  }, [queryClient]);

  useEffect(() => {
    executeWarmup();
    return () => {
      clearAllTimers();
    };
  }, [executeWarmup]);

  const estimatedPercent =
    status === "awake"
      ? 100
      : Math.min(
          95,
          Math.max(5, Math.round((secondsElapsed / SERVER_CONFIG.estimatedWakeSeconds) * 100)),
        );

  const isWaking = status === "waking";
  const isAwake = status === "awake";

  return (
    <ServerWarmupContext.Provider
      value={{
        status,
        isWaking,
        isAwake,
        isColdStartMode: SERVER_CONFIG.isColdStartMode,
        secondsElapsed,
        estimatedPercent,
        isDismissed,
        setIsDismissed,
        retryWarmup: executeWarmup,
      }}
    >
      {children}
    </ServerWarmupContext.Provider>
  );
}

export function useServerWarmup() {
  const context = useContext(ServerWarmupContext);
  if (!context) {
    throw new Error("useServerWarmup must be used within a ServerWarmupProvider");
  }
  return context;
}
