"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QRScannerProps {
  onScan: (chestNumber: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraId, setCameraId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initScanner() {
      try {
        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        if (devices.length === 0) {
          setError("No camera found. Please ensure your device has a camera.");
          return;
        }

        // Use back camera if available, otherwise use first camera
        const preferredCamera = devices.find((d) => d.label.toLowerCase().includes("back")) || devices[0];
        setCameraId(preferredCamera.id);

        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        // Calculate qrbox size based on container (use smaller value for square)
        const containerWidth = 400; // max-width we set
        const qrboxSize = Math.min(containerWidth * 0.8, 300);

        await scanner.start(
          preferredCamera.id,
          {
            fps: 10,
            qrbox: { width: qrboxSize, height: qrboxSize },
            aspectRatio: 1.0,
            disableFlip: false,
          },
          (decodedText) => {
            // Extract chest number from URL if it's a full URL
            let chestNumber = decodedText;
            if (decodedText.includes("/participant/")) {
              chestNumber = decodedText.split("/participant/")[1]?.split("?")[0] || decodedText;
            }

            if (mounted) {
              scanner.stop().catch(console.error);
              setIsScanning(false);
              onScan(chestNumber);
            }
          },
          (errorMessage) => {
            // Ignore scanning errors (they're frequent during scanning)
          }
        );

        setIsScanning(true);
        setError(null);
      } catch (err: any) {
        console.error("Scanner error:", err);
        if (mounted) {
          setError(err.message || "Failed to start camera. Please check permissions.");
          setIsScanning(false);
        }
      }
    }

    initScanner();

    return () => {
      mounted = false;
      if (scannerRef.current && isScanning) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
          })
          .catch(console.error);
      }
    };
  }, []);

  const handleClose = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
    onClose();
  };

  return (
    <Card className="p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Scan QR Code
        </h3>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {error ? (
        <div className="space-y-4">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
            {error}
          </div>
          <Button onClick={handleClose} className="w-full">
            Close
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-full flex justify-center">
            <div
              id="qr-reader"
              className="rounded-lg overflow-hidden bg-black mx-auto"
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Position the QR code within the frame
          </p>
          <Button onClick={handleClose} variant="outline" className="w-full">
            Cancel
          </Button>
        </div>
      )}
    </Card>
  );
}

