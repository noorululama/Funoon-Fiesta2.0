"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface QRScannerProps {
    onScan: (chestNumber: string) => void;
    onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        let cleanup = false;

        async function initScanner() {
            try {
                // Check permissions first
                try {
                    await navigator.mediaDevices.getUserMedia({ video: true });
                    if (!cleanup) setPermissionGranted(true);
                } catch (err) {
                    if (!cleanup) setError("Camera permission denied. Please allow camera access.");
                    return;
                }

                const devices = await Html5Qrcode.getCameras();
                if (devices.length === 0) {
                    if (!cleanup) setError("No camera found on this device.");
                    return;
                }

                const preferredCamera = devices.find((d) => d.label.toLowerCase().includes("back")) || devices[0];

                const scanner = new Html5Qrcode("qr-reader");
                scannerRef.current = scanner;

                await scanner.start(
                    preferredCamera.id,
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        let chestNumber = decodedText;
                        if (decodedText.includes("/participant/")) {
                            chestNumber = decodedText.split("/participant/")[1]?.split("?")[0] || decodedText;
                        }

                        if (!cleanup) {
                            // Play success sound or vibration if possible
                            if (navigator.vibrate) navigator.vibrate(200);

                            scanner.stop().then(() => {
                                setIsScanning(false);
                                onScan(chestNumber);
                            }).catch(console.error);
                        }
                    },
                    () => { } // Ignore frame errors
                );

                if (!cleanup) {
                    setIsScanning(true);
                    setError(null);
                }
            } catch (err: any) {
                console.error("Scanner error:", err);
                if (!cleanup) {
                    setError("Failed to start camera. Please try again.");
                    setIsScanning(false);
                }
            }
        }

        // Small delay to ensure DOM is ready for the scanner element
        const timer = setTimeout(() => {
            initScanner();
        }, 100);

        return () => {
            cleanup = true;
            clearTimeout(timer);
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(console.error);
            }
        };
    }, [onScan, mounted]);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative"
            >
                <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                        <Camera className="w-5 h-5 text-purple-600" />
                        Scan Participant QR
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="relative aspect-square bg-black">
                    {!permissionGranted && !error && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/70">
                            <p>Requesting camera access...</p>
                        </div>
                    )}

                    <div id="qr-reader" className="w-full h-full" />

                    {isScanning && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 border-[40px] border-black/50 z-10"></div>
                            <motion.div
                                animate={{ y: [0, 250, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="absolute top-0 left-[40px] right-[40px] h-0.5 bg-green-500 shadow-[0_0_10px_#22c55e] z-20"
                            />
                            <div className="absolute top-[40px] left-[40px] w-8 h-8 border-l-4 border-t-4 border-green-500 z-20 rounded-tl-lg"></div>
                            <div className="absolute top-[40px] right-[40px] w-8 h-8 border-r-4 border-t-4 border-green-500 z-20 rounded-tr-lg"></div>
                            <div className="absolute bottom-[40px] left-[40px] w-8 h-8 border-l-4 border-b-4 border-green-500 z-20 rounded-bl-lg"></div>
                            <div className="absolute bottom-[40px] right-[40px] w-8 h-8 border-r-4 border-b-4 border-green-500 z-20 rounded-br-lg"></div>
                        </div>
                    )}
                </div>

                <div className="p-6 text-center space-y-4">
                    {error ? (
                        <div className="space-y-3">
                            <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                            <Button onClick={onClose} variant="outline" className="w-full">
                                Close Scanner
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Point your camera at the participant's QR code badge.
                        </p>
                    )}
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
