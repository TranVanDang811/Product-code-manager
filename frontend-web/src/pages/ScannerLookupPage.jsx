import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { barcodeApi } from '../api/barcodeApi';
import { isValidEan13 } from '../utils/ean13Validator';
import BarcodeCameraScanner from '../components/scanner/BarcodeCameraScanner';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  ScanLine,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Package,
  Plus,
  Barcode as BarcodeIcon,
  Hash,
  ArrowRight,
} from 'lucide-react';

export default function ScannerLookupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [historySession, setHistorySession] = useState([]);
  const lastScannedTimeRef = useRef(0);

  const performLookup = useCallback(async (barcode) => {
    if (!barcode) return;
    const cleanBarcode = barcode.trim();

    try {
      setLoading(true);
      const res = await barcodeApi.lookup({
        barcode: cleanBarcode,
        deviceInfo: 'Web Camera Scanner',
      });

      if (res && res.data) {
        setLookupResult(res.data);
        setHistorySession((prev) => [res.data, ...prev.slice(0, 9)]);
      }
    } catch (err) {
      console.error('Lookup failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Read URL query parameter if present
  useEffect(() => {
    const urlBarcode = searchParams.get('barcode');
    if (urlBarcode) {
      setBarcodeInput(urlBarcode);
      performLookup(urlBarcode);
    }
  }, [searchParams, performLookup]);

  // Handle manual input submit
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput) return;
    performLookup(barcodeInput);
  };

  // Handle scan from ZXing camera scanner
  const handleCameraScan = useCallback(
    (scannedText) => {
      const now = Date.now();
      if (now - lastScannedTimeRef.current < 2500) return;
      lastScannedTimeRef.current = now;

      setBarcodeInput(scannedText);
      performLookup(scannedText);
    },
    [performLookup]
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Quét mã & Tra cứu
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Quét qua Camera hoặc tra cứu thủ công mã vạch chuẩn GS1 EAN-13
        </p>
      </div>

      {/* Two-Column Grid: Scanner & Result Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Camera & Manual Input */}
        <div className="lg:col-span-5 space-y-5">
          {/* Camera Scanner Container */}
          <div className="pcm-card p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#27272a]">
              <div className="flex items-center gap-2 font-semibold text-xs text-zinc-200">
                <ScanLine className="w-4 h-4 text-zinc-400" />
                <span>Camera quét mã</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 font-medium border border-emerald-800/40">
                Sẵn sàng
              </span>
            </div>

            <BarcodeCameraScanner
              onScan={handleCameraScan}
              isScanning={isScanning}
              onToggleScanning={() => setIsScanning((prev) => !prev)}
            />
          </div>

          {/* Manual Input Form */}
          <div className="pcm-card p-5">
            <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BarcodeIcon className="w-4 h-4 text-zinc-400" />
              <span>Tra cứu thủ công</span>
            </h2>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="relative">
                <BarcodeIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                <input
                  type="text"
                  maxLength={13}
                  value={barcodeInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 13);
                    setBarcodeInput(val);
                  }}
                  placeholder="Nhập 13 chữ số mã vạch..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#1c1c1f] border border-[#27272a] font-mono text-xs text-white tracking-wider focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition"
                />
              </div>

              {barcodeInput && (
                <div className="text-xs font-medium">
                  {isValidEan13(barcodeInput) ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mã vạch hợp lệ chuẩn GS1 Checksum
                    </span>
                  ) : barcodeInput.length === 13 ? (
                    <span className="text-rose-500 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Sai mã kiểm tra Checksum GS1
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      Đã nhập: {barcodeInput.length}/13 chữ số
                    </span>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !barcodeInput.trim()}
                className="btn-primary w-full text-xs py-2.5 disabled:opacity-50"
              >
                {loading ? <LoadingSpinner size="sm" className="text-white" /> : <Search className="w-4 h-4" />}
                <span>Tra cứu mã vạch</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (7 Cols): Result Panel */}
        <div className="lg:col-span-7">
          <div className="pcm-card p-6 sm:p-7 min-h-[440px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-[#27272a] mb-5">
                <h2 className="text-sm font-bold text-white">
                  Kết quả nhận diện
                </h2>
                {lookupResult && <Badge status={lookupResult.status} />}
              </div>

              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center">
                  <LoadingSpinner size="lg" />
                  <p className="text-xs font-medium mt-3 text-zinc-500">Đang truy vấn cơ sở dữ liệu...</p>
                </div>
              ) : !lookupResult ? (
                <div className="py-20 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 text-zinc-300 flex items-center justify-center mx-auto mb-3 border border-zinc-700">
                    <ScanLine className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    Chưa có dữ liệu quét
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                    Bật camera hoặc nhập 13 số mã vạch ở cột bên trái để tra cứu thông tin sản phẩm
                  </p>
                </div>
              ) : (
                <div className="space-y-5 animate-in fade-in">
                  {/* Status Banner */}
                  <div
                    className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                      lookupResult.status === 'FOUND'
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                        : lookupResult.status === 'NOT_FOUND'
                        ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                        : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {lookupResult.status === 'FOUND' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : lookupResult.status === 'NOT_FOUND' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{lookupResult.message}</div>
                      <div className="text-[11px] opacity-80 mt-0.5 font-mono">
                        Mã vạch: {lookupResult.barcodeScanned || barcodeInput}
                      </div>
                    </div>
                  </div>

                  {/* Product Details (If FOUND) */}
                  {lookupResult.product ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-5 rounded-2xl bg-[#18181b] border border-[#27272a]">
                      {/* Product Image */}
                      <div className="sm:col-span-1">
                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#121214] border border-[#27272a] flex items-center justify-center">
                          {lookupResult.product.imageUrl ? (
                            <img
                              src={lookupResult.product.imageUrl}
                              alt={lookupResult.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-12 h-12 text-zinc-500" />
                          )}
                        </div>
                      </div>

                      {/* Info details */}
                      <div className="sm:col-span-2 space-y-3">
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            Tên sản phẩm
                          </span>
                          <h3 className="text-base font-bold text-white leading-tight mt-0.5">
                            {lookupResult.product.name}
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="p-2.5 rounded-xl bg-[#121214] border border-[#27272a]">
                            <span className="text-[10px] text-zinc-400 block font-semibold">Mã sản phẩm</span>
                            <span className="font-mono text-sm font-bold text-zinc-200">
                              #{lookupResult.product.productCode}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-[#121214] border border-[#27272a]">
                            <span className="text-[10px] text-zinc-400 block font-semibold mb-1">Trạng thái</span>
                            <Badge status={lookupResult.product.status} />
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#121214] border border-[#27272a]">
                          <span className="text-[10px] text-zinc-400 block font-semibold">Mã vạch EAN-13</span>
                          <span className="font-mono text-xs font-semibold text-zinc-200">
                            {lookupResult.product.barcode}
                          </span>
                        </div>

                        {lookupResult.product.description && (
                          <div className="text-xs text-zinc-400 leading-relaxed">
                            {lookupResult.product.description}
                          </div>
                        )}

                        <div className="pt-2">
                          <button
                            onClick={() => navigate('/products')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white underline"
                          >
                            <span>Xem trong danh mục sản phẩm</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : lookupResult.status === 'NOT_FOUND' ? (
                    <div className="p-6 rounded-2xl bg-[#18181b] border border-[#27272a] text-center space-y-3">
                      <p className="text-xs text-zinc-300">
                        Mã vạch <span className="font-mono font-bold text-amber-400">[{lookupResult.barcodeScanned}]</span> chuẩn GS1 hợp lệ nhưng chưa được gán cho sản phẩm nào.
                      </p>
                      <button
                        onClick={() => navigate(`/products?newBarcode=${lookupResult.barcodeScanned}`)}
                        className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-4 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tạo sản phẩm mới với mã này</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Quick Session Scans */}
            {historySession.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#27272a]">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                  Các mã vừa quét trong phiên ({historySession.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {historySession.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setBarcodeInput(item.barcodeScanned);
                        setLookupResult(item);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[#1c1c1f] border border-[#27272a] hover:border-zinc-500 text-zinc-200 transition"
                    >
                      {item.barcodeScanned}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
