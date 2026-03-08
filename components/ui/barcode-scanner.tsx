"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ScanBarcode, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── BarcodeScanner modal ──────────────────────────────────────────

type BarcodeScannerProps = {
  onScan: (result: string) => void;
  onClose: () => void;
};

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"starting" | "scanning" | "error">("starting");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startScanner() {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();

        if (cancelled) return;

        setStatus("scanning");

        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result, _error) => {
            if (result && !cancelled) {
              onScan(result.getText());
            }
          }
        );

        controlsRef.current = controls;
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Camera access denied or unavailable.";
          setErrorMessage(message);
          setStatus("error");
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      try {
        controlsRef.current?.stop();
      } catch {
        // Ignore cleanup errors
      }
      controlsRef.current = null;
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative w-full max-w-sm mx-4 rounded-xl overflow-hidden bg-black shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          aria-label="Close scanner"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Video feed */}
        <video
          ref={videoRef}
          className="w-full aspect-video object-cover"
          muted
          playsInline
          autoPlay
        />

        {/* Scanning overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {status === "scanning" && (
            <>
              {/* Scan frame */}
              <div className="w-48 h-48 border-2 border-white/70 rounded-lg relative">
                <span className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-white rounded-tl" />
                <span className="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 border-white rounded-tr" />
                <span className="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 border-white rounded-bl" />
                <span className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-white rounded-br" />
              </div>
            </>
          )}

          {status === "starting" && (
            <p className="text-white text-sm bg-black/50 px-3 py-1.5 rounded-full">
              Starting camera…
            </p>
          )}

          {status === "error" && (
            <div className="bg-black/80 text-white text-sm px-4 py-3 rounded-lg mx-4 text-center">
              <p className="font-medium mb-1">Camera error</p>
              <p className="text-white/70 text-xs">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Bottom status bar */}
        <div className="bg-black px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-white/70 text-xs">
            {status === "scanning"
              ? "Scanning…"
              : status === "starting"
              ? "Initializing camera…"
              : "Scanner unavailable"}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="border-white/30 text-white hover:bg-white/10 hover:text-white text-xs h-7"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── BarcodeScanButton ─────────────────────────────────────────────

/**
 * A button that opens the BarcodeScanner modal and navigates to
 * /search?q={barcode} on a successful scan.
 */
export function BarcodeScanButton({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleScan(result: string) {
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(result)}`);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className}
        aria-label="Scan barcode"
        type="button"
      >
        <ScanBarcode className="h-5 w-5" />
      </button>

      {open && (
        <BarcodeScanner onScan={handleScan} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
