import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Camera, CameraOff, RefreshCw, AlertCircle } from 'lucide-react';

export default function BarcodeCameraScanner({ onScan, isScanning, onToggleScanning }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [cameraError, setCameraError] = useState(null);

  // Initialize camera list
  useEffect(() => {
    const getDevices = async () => {
      try {
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
        setCameras(videoInputDevices);
        if (videoInputDevices.length > 0) {
          // Prefer environment (back) camera if available
          const backCamera = videoInputDevices.find(
            (device) =>
              device.label.toLowerCase().includes('back') ||
              device.label.toLowerCase().includes('environment') ||
              device.label.toLowerCase().includes('sau')
          );
          setSelectedCameraId(backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Failed to list video devices', err);
        setCameraError('Không thể truy cập camera hoặc quyền bị từ chối');
      }
    };

    getDevices();
  }, []);

  // Handle scanner start/stop
  useEffect(() => {
    if (!isScanning) {
      if (readerRef.current) {
        readerRef.current = null;
      }
      return;
    }

    setCameraError(null);
    const codeReader = new BrowserMultiFormatReader();
    readerRef.current = codeReader;

    let controls = null;

    const startDecoding = async () => {
      try {
        controls = await codeReader.decodeFromVideoDevice(
          selectedCameraId || undefined,
          videoRef.current,
          (result, error) => {
            if (result) {
              const text = result.getText();
              onScan(text);
            }
          }
        );
      } catch (err) {
        console.error('Error starting video stream', err);
        setCameraError('Lỗi kết nối camera. Vui lòng kiểm tra quyền truy cập');
      }
    };

    startDecoding();

    return () => {
      if (controls) {
        controls.stop();
      }
    };
  }, [isScanning, selectedCameraId, onScan]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md aspect-video sm:aspect-square bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
        {isScanning ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {/* Visual scanning frame & animation overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className="relative w-full h-44 border-2 border-brand-400/80 rounded-xl shadow-lg">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
                <div className="absolute -top-6 left-0 right-0 text-center">
                  <span className="text-[11px] font-mono text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                    Đặt mã EAN-13 vào giữa khung
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-6 text-slate-400">
            <CameraOff className="w-12 h-12 mx-auto mb-2 text-slate-500" />
            <p className="text-sm font-medium">Camera đang tắt</p>
            <p className="text-xs text-slate-500 mt-1">Bấm nút bên dưới để bật máy quét</p>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
            <p className="text-xs text-rose-300 font-medium">{cameraError}</p>
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
        <button
          type="button"
          onClick={onToggleScanning}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition shadow-sm ${
            isScanning
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
              : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/20'
          }`}
        >
          {isScanning ? (
            <>
              <CameraOff className="w-4 h-4" /> Tắt Camera
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" /> Bật Camera Quét
            </>
          )}
        </button>

        {cameras.length > 1 && isScanning && (
          <select
            value={selectedCameraId}
            onChange={(e) => setSelectedCameraId(e.target.value)}
            className="text-xs bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {cameras.map((cam) => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label || `Camera ${cam.deviceId.substring(0, 5)}`}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

