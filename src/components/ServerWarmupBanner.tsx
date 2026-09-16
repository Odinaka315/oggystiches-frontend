import { useState, useEffect } from "react";
import { Server, CheckCircle2, X, RefreshCw, AlertCircle } from "lucide-react";
import { useServerWarmup } from "../context/ServerWarmupContext";

export default function ServerWarmupBanner() {
  const {
    status,
    isWaking,
    isColdStartMode,
    secondsElapsed,
    estimatedPercent,
    isDismissed,
    setIsDismissed,
    retryWarmup,
  } = useServerWarmup();

  const [hasShownWaking, setHasShownWaking] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Track if we ever showed the waking state
  useEffect(() => {
    if (isWaking) {
      setHasShownWaking(true);
      setShouldRender(true);
      setIsFadingOut(false);
    }
  }, [isWaking]);

  // When server wakes up after having shown waking screen, show success then fade out
  useEffect(() => {
    if (status === "awake" && hasShownWaking) {
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 2500);

      const removeTimer = setTimeout(() => {
        setShouldRender(false);
      }, 3200);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [status, hasShownWaking]);

  // If cold-start mode is off, dismissed, or not needed, render nothing
  if (!isColdStartMode || isDismissed || !shouldRender) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-[9990] max-w-[380px] w-[calc(100vw-3rem)] transition-all duration-700 ease-in-out ${
        isFadingOut
          ? "opacity-0 translate-y-3 pointer-events-none scale-95"
          : "opacity-100 translate-y-0 scale-100"
      }`}
    >
      <div className="relative overflow-hidden rounded-xl border border-border-col bg-surface/90 backdrop-blur-md p-4 shadow-2xl transition-colors duration-300">
        {/* Subtle accent glow gradient */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />

        <div className="flex items-start gap-3">
          {/* Status Indicator Icon */}
          <div className="mt-0.5 shrink-0">
            {status === "awake" ? (
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            ) : status === "error" ? (
              <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            ) : (
              <div className="relative w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <Server className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center justify-between">
              <h4 className="font-display italic text-sm font-semibold text-fg">
                {status === "awake"
                  ? "Live Server Connected"
                  : status === "error"
                  ? "Connection Slow"
                  : "Waking Up Live Server"}
              </h4>
            </div>

            <p className="font-sans text-[0.72rem] text-muted leading-relaxed mt-0.5">
              {status === "awake" ? (
                "The backend is active. Real-time items and forms are fully ready."
              ) : status === "error" ? (
                <span>
                  The server is taking longer than usual to spin up.
                  <button
                    onClick={retryWarmup}
                    className="inline-flex items-center gap-1 ml-1.5 text-accent underline hover:opacity-80 cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Retry
                  </button>
                </span>
              ) : (
                "Hosted on Render free tier. Free instances spin down when idle and take ~45–50s to wake up on first visit."
              )}
            </p>

            {/* Progress bar during waking */}
            {status === "waking" && (
              <div className="mt-3">
                <div className="flex justify-between text-[0.62rem] font-sans uppercase tracking-wider text-muted mb-1">
                  <span>Starting container</span>
                  <span>{secondsElapsed}s / ~50s</span>
                </div>
                <div className="w-full h-1 bg-border-col/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-1000 ease-out"
                    style={{ width: `${estimatedPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss banner"
            className="shrink-0 p-1 text-muted hover:text-fg transition-colors rounded-md hover:bg-fg/5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
