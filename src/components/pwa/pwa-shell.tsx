"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PUBLIC_COPY = {
  title: "Install the site",
  body: "Add Dr. Akin’s platform to your home screen for quick access to insights, events, and booking.",
  cta: "Add to Home Screen",
  iosHint: "Tap Share, then “Add to Home Screen”.",
};

const ADMIN_COPY = {
  title: "Install Back Office",
  body: "Add the admin workspace to your home screen for faster access to Requests, Inbox, and content tools on mobile.",
  cta: "Add Back Office",
  iosHint: "Tap Share, then “Add to Home Screen”.",
};

function isIosSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

interface PwaShellProps {
  isAdmin?: boolean;
}

export function PwaShell({ isAdmin = false }: PwaShellProps) {
  const copy = isAdmin ? ADMIN_COPY : PUBLIC_COPY;
  const dismissKey = isAdmin ? "pwa-install-dismissed-admin" : "pwa-install-dismissed-public";

  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = useState<
    ((reloadPage?: boolean) => Promise<void>) | undefined
  >(undefined);

  const dismissed = useMemo(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(dismissKey) === "1";
  }, [dismissKey]);

  useEffect(() => {
    if (isStandaloneDisplay() || dismissed) return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
      setShowIosHint(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, [dismissed]);

  useEffect(() => {
    if (isStandaloneDisplay() || dismissed || installEvent) return;
    if (isIosSafari() && window.innerWidth < 1024) {
      setShowIosHint(true);
    }
  }, [dismissed, installEvent]);

  const dismissInstallPrompt = useCallback(() => {
    window.localStorage.setItem(dismissKey, "1");
    setShowInstallPrompt(false);
    setShowIosHint(false);
    setInstallEvent(null);
  }, [dismissKey]);

  const handleInstall = useCallback(async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    setShowInstallPrompt(false);
    if (choice.outcome === "dismissed") {
      window.localStorage.setItem(dismissKey, "1");
    }
  }, [dismissKey, installEvent]);

  return (
    <>
      <PwaRegisterBridge
        onOfflineReady={() => setOfflineReady(true)}
        onNeedRefresh={() => setNeedRefresh(true)}
        onRegisterUpdate={(fn) => setUpdateServiceWorker(() => fn)}
      />

      {(showInstallPrompt || showIosHint) && !isStandaloneDisplay() && (
        <div
          className="fixed inset-x-4 bottom-4 z-[70] rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)] p-4 shadow-[var(--ploy-shadow-md)] sm:inset-x-auto sm:right-6 sm:max-w-sm"
          role="dialog"
          aria-live="polite"
          aria-label={copy.title}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-[var(--ploy-background-secondary)] p-2 text-[var(--ploy-text-primary)]">
              {showIosHint ? <Share className="size-4" /> : <Download className="size-4" />}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-[var(--ploy-text-primary)]">{copy.title}</p>
                <button
                  type="button"
                  className="rounded-md p-1 text-[var(--ploy-text-tertiary)] hover:text-[var(--ploy-text-primary)]"
                  aria-label="Dismiss install prompt"
                  onClick={dismissInstallPrompt}
                >
                  <X className="size-4" />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
                {showIosHint ? copy.iosHint : copy.body}
              </p>
              {!showIosHint && installEvent && (
                <Button type="button" size="sm" variant="primary" onClick={() => void handleInstall()}>
                  {copy.cta}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {needRefresh && (
        <div
          className={cn(
            "fixed inset-x-4 z-[70] rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)] p-4 shadow-[var(--ploy-shadow-md)] sm:inset-x-auto sm:right-6 sm:max-w-sm",
            showInstallPrompt || showIosHint ? "bottom-44" : "bottom-4",
          )}
          role="status"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="size-4 shrink-0 text-[var(--ploy-text-primary)]" />
            <p className="flex-1 text-sm text-[var(--ploy-text-secondary)]">A new version is available.</p>
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => void updateServiceWorker?.(true)}
            >
              Reload
            </Button>
          </div>
        </div>
      )}

      {offlineReady && !needRefresh && import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 z-[60] rounded-md bg-[var(--ploy-background-primary)] px-3 py-2 text-xs text-[var(--ploy-text-tertiary)] shadow-sm">
          PWA ready offline (dev)
        </div>
      )}
    </>
  );
}

function PwaRegisterBridge({
  onOfflineReady,
  onNeedRefresh,
  onRegisterUpdate,
}: {
  onOfflineReady: () => void;
  onNeedRefresh: () => void;
  onRegisterUpdate: (update: (reloadPage?: boolean) => Promise<void>) => void;
}) {
  const [RegisterHook, setRegisterHook] = useState<
    typeof import("virtual:pwa-register/react").useRegisterSW | null
  >(null);

  useEffect(() => {
    void import("virtual:pwa-register/react")
      .then((mod) => setRegisterHook(() => mod.useRegisterSW))
      .catch(() => setRegisterHook(null));
  }, []);

  if (!RegisterHook) return null;

  return (
    <RegisterHookRunner
      RegisterHook={RegisterHook}
      onOfflineReady={onOfflineReady}
      onNeedRefresh={onNeedRefresh}
      onRegisterUpdate={onRegisterUpdate}
    />
  );
}

function RegisterHookRunner({
  RegisterHook,
  onOfflineReady,
  onNeedRefresh,
  onRegisterUpdate,
}: {
  RegisterHook: typeof import("virtual:pwa-register/react").useRegisterSW;
  onOfflineReady: () => void;
  onNeedRefresh: () => void;
  onRegisterUpdate: (update: (reloadPage?: boolean) => Promise<void>) => void;
}) {
  const { updateServiceWorker } = RegisterHook({
    immediate: true,
    onOfflineReady,
    onNeedRefresh,
  });

  useEffect(() => {
    onRegisterUpdate(updateServiceWorker);
  }, [onRegisterUpdate, updateServiceWorker]);

  return null;
}
