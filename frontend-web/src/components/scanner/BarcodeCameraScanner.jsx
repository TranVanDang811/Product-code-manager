import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

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
          (result) => {
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
      <div className="relative w-full max-w-md aspect-video sm:aspect-square bg-zinc-950 rounded-2xl overflow-hidden shadow-lg border border-zinc-800 flex items-center justify-center">
        {isScanning ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Visual scanning frame & animated laser line */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              <div className="relative w-full h-40 rounded-xl border-2 border-zinc-500/80 shadow-lg shadow-black/50">
                {/* Corner highlights */}
                <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-zinc-300" />
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-zinc-300" />
                <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-zinc-300" />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-zinc-300" />

                {/* Animated Laser Line */}
                <div className="scanner-laser-line" />

                <div className="absolute -top-6 left-0 right-0 text-center">
                  <span className="text-[10px] font-medium text-zinc-300 bg-zinc-900/90 px-2.5 py-0.5 rounded-full border border-zinc-700 backdrop-blur">
                    Căn chỉnh mã EAN-13 vào giữa khung
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-6 text-zinc-400">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-2 text-zinc-400">
              <CameraOff className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-zinc-200">Camera đang tắt</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Bấm nút bên dưới để bắt đầu quét tự động</p>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
            <p className="text-xs text-rose-300 font-medium">{cameraError}</p>
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 w-full max-w-md">
        <button
          type="button"
          onClick={onToggleScanning}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition shadow-sm ${
            isScanning
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-md'
          }`}
        >
          {isScanning ? (
            <>
              <CameraOff className="w-4 h-4" /> Dừng Camera
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
            className="text-xs bg-[#1c1c1f] border border-[#27272a] text-zinc-200 rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 font-medium"
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
