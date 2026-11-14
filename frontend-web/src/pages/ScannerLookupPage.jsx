import { useState, useCallback, useRef } from 'react';
import { barcodeApi } from '../api/barcodeApi';
import { isValidEan13 } from '../utils/ean13Validator';
import { formatDateTime } from '../utils/formatters';
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
  ArrowRight,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function ScannerLookupPage() {
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
        deviceInfo: `Web Browser (${navigator.userAgent.substring(0, 50)})`,
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
      // Debounce scanner 2.5s to prevent duplicate rapid triggers
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tra cứu Barcode EAN-13</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Quét mã vạch qua Camera hoặc nhập thủ công để tra cứu thông tin sản phẩm và mã nội bộ 6 số
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scanner & Manual Input (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Camera Scanner Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-brand-600" />
              Máy quét Camera trực tiếp
            </h2>

            <BarcodeCameraScanner
              onScan={handleCameraScan}
              isScanning={isScanning}
              onToggleScanning={() => setIsScanning((prev) => !prev)}
            />
          </div>

          {/* Manual Input Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-700" />
              Nhập mã vạch thủ công
            </h2>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  maxLength={13}
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Nhập 13 chữ số EAN-13 (VD: 4006381333931)"
                  className="w-full pl-4 pr-32 py-3 rounded-xl border border-slate-200 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={loading || !barcodeInput}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-brand-600 text-white font-semibold text-xs hover:bg-brand-700 transition disabled:opacity-40"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Tra cứu'}
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Độ dài: {barcodeInput.length}/13 ký tự</span>
                {barcodeInput.length === 13 && (
                  <span
                    className={`font-medium ${
                      isValidEan13(barcodeInput) ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {isValidEan13(barcodeInput)
                      ? '✓ Checksum EAN-13 hợp lệ'
                      : '✗ Sai checksum Modulo-10'}
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Lookup Result & Recent Lookups (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Result Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-h-[320px]">
            <h2 className="text-base font-bold text-slate-900 mb-4">Kết quả tra cứu</h2>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <LoadingSpinner size="lg" className="mb-3" />
                <span className="text-xs">Đang kiểm tra cơ sở dữ liệu...</span>
              </div>
            ) : !lookupResult ? (
              <div className="py-20 text-center text-slate-400">
                <ScanLine className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">Chưa có kết quả tra cứu</p>
                <p className="text-xs text-slate-400 mt-1">
                  Hãy bật camera quét mã hoặc nhập mã vạch EAN-13 để kiểm tra
                </p>
              </div>
            ) : lookupResult.status === 'FOUND' ? (
              /* FOUND PRODUCT CARD */
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Tìm thấy sản phẩm thành công!</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex gap-4">
                  {lookupResult.product?.imageUrl ? (
                    <img
                      src={lookupResult.product.imageUrl}
                      alt={lookupResult.product.name}
                      className="w-24 h-24 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
                      <Package className="w-8 h-8" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge status={lookupResult.product?.status} />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                      {lookupResult.product?.name}
                    </h3>
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="text-slate-500">
                        Mã nội bộ (6 số):{' '}
                        <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                          {lookupResult.product?.productCode}
                        </span>
                      </div>
                      <div className="text-slate-500">
                        Barcode EAN-13:{' '}
                        <span className="font-mono text-slate-800 font-medium">
                          {lookupResult.barcode}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {lookupResult.product?.description && (
                  <div className="p-3 rounded-xl bg-white border border-slate-100 text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700">Mô tả: </span>
                    {lookupResult.product.description}
                  </div>
                )}
              </div>
            ) : lookupResult.status === 'NOT_FOUND' ? (
              /* NOT FOUND ALERT */
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-rose-800 text-sm">Không tìm thấy sản phẩm!</h3>
                    <p className="text-xs text-rose-600 mt-1 leading-relaxed">
                      Mã vạch <span className="font-mono font-bold">[{lookupResult.barcode}]</span> đúng
                      chuẩn EAN-13 nhưng chưa được liên kết với bất kỳ mã sản phẩm nội bộ nào trong hệ
                      thống.
                    </p>
                  </div>
                </div>
                <div className="text-[11px] text-rose-500 pt-2 border-t border-rose-200/60">
                  Lượt quét đã được tự động lưu vào Lịch sử với trạng thái{' '}
                  <span className="font-bold">NOT_FOUND</span>.
                </div>
              </div>
            ) : (
              /* INVALID ALERT */
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-purple-900 text-sm">Mã vạch không hợp lệ!</h3>
                    <p className="text-xs text-purple-700 mt-1 leading-relaxed">
                      Mã đầu vào <span className="font-mono font-bold">[{lookupResult.barcode}]</span>{' '}
                      không thỏa mãn tiêu chuẩn GS1 EAN-13 (yêu cầu đúng 13 số và thỏa mãn thuật toán
                      Checksum Modulo-10).
                    </p>
                  </div>
                </div>
                <div className="text-[11px] text-purple-600 pt-2 border-t border-purple-200/60">
                  Lượt quét đã được tự động lưu vào Lịch sử với trạng thái{' '}
                  <span className="font-bold">INVALID</span>.
                </div>
              </div>
            )}
          </div>

          {/* Session Scan History */}
          {historySession.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Vừa tra cứu trong phiên làm việc
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {historySession.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-semibold text-slate-800">{item.barcode}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.product ? `${item.product.productCode} - ${item.product.name}` : '-'}
                      </div>
                    </div>
                    <Badge status={item.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

