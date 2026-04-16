import QRCode from 'react-qr-code';
import { clsx } from 'clsx';

/**
 * QRCodeGenerator Component
 * Generates and displays QR code for attendance sessions
 */
const QRCodeGenerator = ({
    value,
    size = 256,
    title = 'Mã QR Điểm danh',
    subtitle,
    className = '',
    showDownload = true,
}) => {
    // Handle download QR code as image
    const handleDownload = () => {
        const svg = document.getElementById('attendance-qr-code');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = size + 40;
            canvas.height = size + 40;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 20, 20, size, size);

            const link = document.createElement('a');
            link.download = `qr-attendance-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    if (!value) {
        return (
            <div className={clsx('flex flex-col items-center justify-center p-8', className)}>
                <div className="w-64 h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        <p className="text-gray-500">Chưa có mã QR</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={clsx('flex flex-col items-center', className)}>
            {/* Title */}
            {title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            )}
            {subtitle && (
                <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
            )}

            {/* QR Code Container */}
            <div className="relative p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl"></div>

                {/* QR Code */}
                <div className="p-4">
                    <QRCode
                        id="attendance-qr-code"
                        value={value}
                        size={size}
                        level="H"
                        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    />
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                    Sinh viên quét mã QR này để điểm danh
                </p>
            </div>

            {/* Download button */}
            {showDownload && (
                <button
                    onClick={handleDownload}
                    className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Tải xuống QR Code
                </button>
            )}
        </div>
    );
};

export default QRCodeGenerator;
