"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import { X, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface QRScannerProps {
    onScan: (chestNumber: string) => void;
    onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleScan = (detectedCodes: any[]) => {
        if (detectedCodes && detectedCodes.length > 0) {
            const decodedText = detectedCodes[0].rawValue;
            let chestNumber = decodedText;

            // Extract chest number if it's a URL
            if (decodedText.includes("/participant/")) {
                chestNumber = decodedText.split("/participant/")[1]?.split("?")[0] || decodedText;
            }

            // Play success sound/vibration
            if (navigator.vibrate) navigator.vibrate(200);

            onScan(chestNumber);
        }
    };

    const handleError = (err: any) => {
        console.error("Scanner error:", err);
        // Only show user-facing errors for critical issues
        if (err?.name === "NotAllowedError" || err?.name === "NotFoundError") {
            setError("Camera access denied or no camera found. Please check your permissions.");
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                        <Camera className="w-5 h-5 text-purple-600" />
                        Scan Participant QR
                    </h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Scanner Area */}
                <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px]">
                    {!error ? (
                        <div className="w-full h-full">
                            <Scanner
                                onScan={handleScan}
                                onError={handleError}
                                components={{
                                    audio: false, // We handle vibration manually
                                    onOff: false,
                                    torch: true,
                                    zoom: true,
                                    finder: true,
                                }}
                                styles={{
                                    container: { width: "100%", height: "100%" },
                                    video: { width: "100%", height: "100%", objectFit: "cover" }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-white/80 space-y-4">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                            <p>{error}</p>
                            <Button onClick={onClose} variant="secondary" className="mt-4">
                                Close Scanner
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 text-center shrink-0 bg-white dark:bg-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Point your camera at the participant's QR code badge.
                    </p>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
