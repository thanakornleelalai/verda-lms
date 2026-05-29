"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/primitives/Button";

const STORAGE_KEY = "pwa-banner-dismissed";
const VISIT_KEY = "pwa-visit-count";
const VISITS_BEFORE_SHOW = 3;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if dismissed or already installed
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Increment visit count
    const visits = Number(localStorage.getItem(VISIT_KEY) ?? 0) + 1;
    localStorage.setItem(VISIT_KEY, String(visits));

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (visits >= VISITS_BEFORE_SHOW) {
        setShow(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
    };
  }, []);

  function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
      setShow(false);
      localStorage.setItem(STORAGE_KEY, "1");
    });
  }

  function handleDismiss() {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }

  if (!show || installed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[480px]">
      <div className="bg-ink text-white rounded-r3 shadow-xl px-5 py-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-viridian rounded-r2 flex items-center justify-center shrink-0">
          <Download size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[14px] leading-tight">ติดตั้ง VERDA บน iPhone / Android</p>
          <p className="text-[12px] text-[#8A938E] mt-0.5">เข้าถึงคอร์สได้ทันที แม้ออฟไลน์</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleInstall}
          className="shrink-0"
        >
          ติดตั้ง
        </Button>
        <button
          onClick={handleDismiss}
          className="text-[#6E756F] hover:text-white transition-colors shrink-0"
          aria-label="ปิด"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
