import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { clsx } from 'clsx';

/**
 * QRScanner Component
 * Scans QR codes for student check-in
 * Fixed: Ensures DOM element exists before initializing scanner
 */
const QRScanner = ({
    onScan,
    onError,
    className = '',
}) => {
    const scannerRef = useRef(null);
    const containerRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [isReady, setIsReady] = useState(false);

    // Initialize scanner only when DOM is ready
    useEffect(() => {
        let scanner = null;
        let mounted = true;

        const initScanner = () => {
            // Đảm bảo element đã mount
            const element = document.getElementById('qr-reader');
            if (!element) {
                console.log('[QRScanner] Element not found, waiting...');
                return;
            }

            console.log('[QRScanner] Initializing scanner...');

            try {
                scanner = new Html5QrcodeScanner(
                    'qr-reader',
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                        rememberLastUsedCamera: true,
                        showTorchButtonIfSupported: true,
                    },
                    false // verbose
                );

                scanner.render(
                    (decodedText, decodedResult) => {
                        if (!mounted) return;

                        console.log('[QRScanner] ✅ Scan success:', decodedText);

                        // Stop scanning after successful scan
                        setIsScanning(false);
                        setScanResult(decodedText);
                        setError(null);

                        if (onScan) {
                            onScan(decodedText);
                        }

                        // Clear scanner
                        if (scanner) {
                            scanner.clear().catch(console.error);
                        }
                    },
                    (errorMessage) => {
                        // Ignore most errors as they occur during normal scanning
                        if (errorMessage.includes('No MultiFormat Readers') ||
                            errorMessage.includes('NotFoundException')) {
                            return;
                        }
                        console.warn('[QRScanner] Scan error:', errorMessage);
                    }
                );

                scannerRef.current = scanner;
                setIsScanning(true);
                console.log('[QRScanner] Scanner started successfully');
            } catch (err) {
                console.error('[QRScanner] ❌ Init error:', err);
                setError('Không thể khởi tạo camera. Vui lòng kiểm tra quyền truy cập.');
                if (onError) onError(err);
            }
        };

        // Đợi DOM ready với setTimeout để đảm bảo element đã mount
        const timeoutId = setTimeout(() => {
            if (mounted && !scanResult) {
                setIsReady(true);
                initScanner();
            }
        }, 100);

        return () => {
            mounted = false;
            clearTimeout(timeoutId);

            // Cleanup scanner
            if (scannerRef.current) {
                console.log('[QRScanner] Cleaning up...');
                scannerRef.current.clear().catch((err) => {
                    console.warn('[QRScanner] Cleanup warning:', err);
                });
                scannerRef.current = null;
            }
        };
    }, [onScan, onError, scanResult]);

    const handleRetry = useCallback(() => {
        setScanResult(null);
        setError(null);
        setIsReady(false);
        // Re-trigger useEffect
        setTimeout(() => setIsReady(true), 100);
    }, []);

    return (
        <div className={clsx('flex flex-col items-center', className)} ref={containerRef}>
            {/* Scanner container */}
            {!scanResult && (
                <div className="w-full max-w-md">
                    <div className="relative bg-black rounded-2xl overflow-hidden">
                        {/* QR Reader container - QUAN TRỌNG: ID phải khớp */}
                        <div id="qr-reader" className="w-full" style={{ minHeight: '300px' }}></div>

                        {/* Scanning overlay */}
                        {isScanning && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br"></div>

                                    {/* Scanning line animation */}
                                    <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-scan"></div>
                                </div>
                            </div>
                        )}

                        {/* Loading state */}
                        {!isScanning && !error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                    <p className="text-white text-sm">Đang khởi tạo camera...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-4">
                        Đưa mã QR vào khung hình để quét
                    </p>
                </div>
            )}

            {/* Success result */}
            {scanResult && !error && (
                <div className="w-full max-w-md text-center">
                    <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                            Quét thành công!
                        </h3>
                        <p className="text-sm text-green-600">
                            Mã QR đã được ghi nhận
                        </p>
                    </div>

                    <button
                        onClick={handleRetry}
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Quét lại
                    </button>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="w-full max-w-md text-center">
                    <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-red-800 mb-2">
                            Có lỗi xảy ra
                        </h3>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>

                    <button
                        onClick={handleRetry}
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Custom CSS for scanner */}
            <style>{`
                #qr-reader {
                    border: none !important;
                }
                #qr-reader__scan_region {
                    background: transparent !important;
                }
                #qr-reader__dashboard {
                    padding: 16px !important;
                }
                #qr-reader__dashboard_section_csr button {
                    background: linear-gradient(to right, #4f46e5, #7c3aed) !important;
                    border: none !important;
                    border-radius: 8px !important;
                    padding: 10px 20px !important;
                    color: white !important;
                    font-weight: 500 !important;
                }
                #qr-reader__dashboard_section_swaplink {
                    color: #6366f1 !important;
                    text-decoration: none !important;
                }
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: calc(100% - 2px); }
                    100% { top: 0; }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default QRScanner;
