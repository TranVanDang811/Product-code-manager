import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { barcodeApi } from '../api/barcodeApi';
import { addToast } from '../store/toastSlice';
import { isValidProductCode, isValidEan13 } from '../utils/ean13Validator';
import { formatDateTime } from '../utils/formatters';
import {
  Package,
  Plus,
  Search,
  Barcode as BarcodeIcon,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  Hash,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';

const STATUS_FILTERS = [
  { key: '', label: 'Tất cả' },
  { key: 'ACTIVE', label: 'Hoạt động' },
  { key: 'INACTIVE', label: 'Tạm ngưng' },
  { key: 'ARCHIVED', label: 'Lưu trữ' },
];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    productCode: '',
    name: '',
    description: '',
    barcode: '',
    status: 'ACTIVE',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Barcode Assign state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeError, setBarcodeError] = useState('');

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [createImagePreview, setCreateImagePreview] = useState('');

  // Handle image select when creating product
  const handleCreateImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      dispatch(addToast({ type: 'warning', message: 'Dung lượng ảnh tối đa 2MB' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCreateImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Fetch product list
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size,
        keyword: keyword.trim() || undefined,
        status: statusFilter || undefined,
        sortBy: 'createdAt',
        direction: 'desc',
      };
      const res = await productApi.getProducts(params);
      if (res && res.data) {
        setProducts(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching products', err);
      dispatch(
        addToast({
          type: 'error',
          message: 'Không thể tải danh sách sản phẩm. Vui lòng thử lại.',
        })
      );
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword, statusFilter, dispatch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Open Create Modal
  const handleOpenCreateModal = (presetBarcode = '') => {
    setFormData({
      productCode: '',
      name: '',
      description: '',
      barcode: presetBarcode ? String(presetBarcode).trim() : '',
      status: 'ACTIVE',
      imageUrl: null,
    });
    setCreateImagePreview('');
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  useEffect(() => {
    const newBarcode = searchParams.get('newBarcode');
    if (newBarcode) {
      handleOpenCreateModal(newBarcode);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Open Edit Modal
  const handleOpenEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      productCode: product.productCode,
      name: product.name,
      description: product.description || '',
      status: product.status,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Open Barcode Modal
  const handleOpenBarcodeModal = (product) => {
    setSelectedProduct(product);
    setBarcodeInput(product.barcode || '');
    setBarcodeError('');
    setIsBarcodeModalOpen(true);
  };

  // Open Image Modal
  const handleOpenImageModal = (product) => {
    setSelectedProduct(product);
    setImageFile(null);
    setImagePreview(product.imageUrl || '');
    setIsImageModalOpen(true);
  };

  // Open Delete Dialog
  const handleOpenDeleteDialog = (product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Submit Create Product
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.productCode || !isValidProductCode(formData.productCode)) {
      errors.productCode = 'Mã sản phẩm phải gồm chính xác 6 chữ số (VD: 001234)';
    }
    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = 'Tên sản phẩm không được để trống';
    }
    if (!formData.barcode || !isValidEan13(formData.barcode.trim())) {
      errors.barcode = 'Mã vạch phải gồm đúng 13 số và thỏa mãn chuẩn GS1 Modulo-10 Checksum';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await productApi.createProduct(formData);
      dispatch(
        addToast({
          type: 'success',
          message: `Tạo sản phẩm [${formData.productCode}] thành công!`,
        })
      );
      setIsCreateModalOpen(false);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo sản phẩm';
      dispatch(addToast({ type: 'error', message: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Product
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = 'Tên sản phẩm không được để trống';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await productApi.updateProduct(selectedProduct.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
      });
      dispatch(
        addToast({
          type: 'success',
          message: `Cập nhật sản phẩm [${selectedProduct.productCode}] thành công!`,
        })
      );
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật';
      dispatch(addToast({ type: 'error', message: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Barcode Assign
  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    setBarcodeError('');

    const cleanBarcode = barcodeInput.trim();
    if (!cleanBarcode) {
      setBarcodeError('Vui lòng nhập mã vạch EAN-13');
      return;
    }

    if (!isValidEan13(cleanBarcode)) {
      setBarcodeError('Mã vạch phải gồm đúng 13 chữ số và hợp lệ theo chuẩn GS1 Modulo-10');
      return;
    }

    try {
      setIsSubmitting(true);
      await barcodeApi.assign({
        productId: selectedProduct.id,
        barcode: cleanBarcode,
      });
      dispatch(
        addToast({
          type: 'success',
          message: `Đã gán mã [${cleanBarcode}] cho sản phẩm thành công!`,
        })
      );
      setIsBarcodeModalOpen(false);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi gán mã barcode';
      setBarcodeError(msg);
      dispatch(addToast({ type: 'error', message: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Unassign Barcode
  const handleUnassignBarcode = async () => {
    if (!selectedProduct?.barcode) return;
    try {
      setIsSubmitting(true);
      await barcodeApi.unassign(selectedProduct.id);
      dispatch(
        addToast({
          type: 'success',
          message: 'Đã hủy gán mã barcode cho sản phẩm!',
        })
      );
      setIsBarcodeModalOpen(false);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi hủy barcode';
      dispatch(addToast({ type: 'error', message: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle File select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      dispatch(
        addToast({
          type: 'error',
          message: 'Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc WEBP',
        })
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      dispatch(
        addToast({
          type: 'error',
          message: 'Dung lượng file vượt quá giới hạn cho phép (5MB)',
        })
      );
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Upload Image to Firestore (base64)
  const handleUploadImageSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      dispatch(addToast({ type: 'warning', message: 'Vui lòng chọn một file ảnh' }));
      return;
    }

    try {
      setIsUploadingImage(true);
      await productApi.uploadImage(selectedProduct.id, imageFile);
      dispatch(
        addToast({
          type: 'success',
          message: 'Tải ảnh lên thành công!',
        })
      );
      setIsImageModalOpen(false);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi upload ảnh';
      dispatch(addToast({ type: 'error', message: msg }));
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Delete product image
  const handleDeleteImage = async () => {
    if (!selectedProduct?.imageUrl) return;
    try {
      setIsUploadingImage(true);
      await productApi.deleteImage(selectedProduct.id);
      dispatch(
        addToast({
          type: 'success',
          message: 'Đã xóa ảnh đại diện sản phẩm!',
        })
      );
      setIsImageModalOpen(false);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi khi xóa ảnh';
      dispatch(addToast({ type: 'error', message: msg }));
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Permanent Delete Product
  const handleDeleteConfirm = async () => {
    try {
      setIsSubmitting(true);
      await productApi.deleteProduct(selectedProduct.id);
      dispatch(
        addToast({
          type: 'success',
          message: `Đã xóa vĩnh viễn sản phẩm [${selectedProduct.productCode} - ${selectedProduct.name}] thành công!`,
        })
      );
      setIsDeleteDialogOpen(false);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi xóa sản phẩm';
      dispatch(addToast({ type: 'error', message: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header (Synchronized with Mobile) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Danh mục sản phẩm
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý {totalElements} sản phẩm & mã EAN-13
          </p>
        </div>

        <button
          onClick={() => handleOpenCreateModal()}
          className="btn-primary self-start sm:self-auto text-xs font-semibold py-2.5 px-4 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="pcm-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo tên hoặc mã 6 số..."
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-[#27272a] bg-[#1c1c1f] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 transition"
          />
          {keyword && (
            <button
              onClick={() => {
                setKeyword('');
                setPage(0);
              }}
              className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Chips (Synchronized with Mobile STATUS_FILTERS) */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {STATUS_FILTERS.map((item) => {
            const isSelected = statusFilter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setStatusFilter(item.key);
                  setPage(0);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'bg-[#1c1c1f] hover:bg-[#27272a] text-zinc-200 border border-[#27272a]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Table Card */}
      <div className="pcm-card overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#18181b] text-[11px] font-bold text-zinc-300 uppercase tracking-wider border-b border-[#27272a]">
                  <th className="py-3 px-4">Ảnh</th>
                  <th className="py-3 px-4">Mã số</th>
                  <th className="py-3 px-4">Tên sản phẩm</th>
                  <th className="py-3 px-4">Mã vạch (EAN-13)</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Ngày tạo</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a] text-xs">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="w-10 h-10 text-zinc-500 mb-2 stroke-[1.5]" />
                        <span className="font-medium text-zinc-300">Không tìm thấy sản phẩm nào</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-[#27272a]/70 even:bg-[#18181b]/60 hover:bg-[#27272a] transition-colors"
                    >
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleOpenImageModal(product)}
                          className="relative group w-11 h-11 rounded-xl overflow-hidden bg-[#1c1c1f] border border-[#27272a] flex items-center justify-center shadow-sm"
                          title="Bấm để đổi ảnh"
                        >
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-zinc-400" />
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Upload className="w-3.5 h-3.5 text-white" />
                          </div>
                        </button>
                      </td>

                      {/* Product Code 6 Digits */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-white bg-zinc-800 px-2 py-0.5 rounded-lg text-xs border border-zinc-700">
                          <Hash className="w-3 h-3 text-zinc-300" />
                          {product.productCode}
                        </span>
                      </td>

                      {/* Name & Description */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-white truncate">
                          {product.name}
                        </div>
                        {product.description && (
                          <div className="text-[11px] text-zinc-300 truncate mt-0.5">
                            {product.description}
                          </div>
                        )}
                      </td>

                      {/* Barcode EAN-13 */}
                      <td className="py-3 px-4">
                        {product.barcode ? (
                          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                            <BarcodeIcon className="w-3.5 h-3.5 text-zinc-300" />
                            <span>{product.barcode}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-400 italic">
                            Chưa gán mã vạch
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge status={product.status} />
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 text-[11px] text-zinc-300 whitespace-nowrap">
                        {formatDateTime(product.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Assign Barcode Button */}
                          <button
                            onClick={() => handleOpenBarcodeModal(product)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                            title="Gán / Đổi mã vạch"
                          >
                            <BarcodeIcon className="w-4 h-4" />
                          </button>

                          {/* Upload Image Button */}
                          <button
                            onClick={() => handleOpenImageModal(product)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                            title="Quản lý ảnh đại diện"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-950/40 transition"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Permanent Delete Button */}
                          <button
                            onClick={() => handleOpenDeleteDialog(product)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                            title="Xóa vĩnh viễn sản phẩm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={size}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {/* MODAL 1: CREATE PRODUCT */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm sản phẩm mới"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Mã sản phẩm 6 số (VD: 001234) *
            </label>
            <input
              type="text"
              maxLength={6}
              value={formData.productCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData({ ...formData, productCode: val });
              }}
              placeholder="VD: 001234"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono tracking-wider bg-[#1c1c1f] text-white focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 ${
                formErrors.productCode ? 'border-rose-400' : 'border-[#27272a]'
              }`}
            />
            {formErrors.productCode ? (
              <p className="text-xs text-rose-400 mt-1">{formErrors.productCode}</p>
            ) : (
              <p className="text-[11px] text-zinc-400 mt-1">
                Cho phép 6 chữ số có số 0 ở đầu (VD: 000123, 001234)
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên sản phẩm..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-[#1c1c1f] text-white focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 ${
                formErrors.name ? 'border-rose-400' : 'border-[#27272a]'
              }`}
            />
            {formErrors.name && (
              <p className="text-xs text-rose-400 mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Mã vạch EAN-13 (13 chữ số) *
            </label>
            <div className="relative">
              <BarcodeIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                maxLength={13}
                value={formData.barcode || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 13);
                  setFormData({ ...formData, barcode: val });
                }}
                placeholder="VD: 8935001700018"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm font-mono tracking-wider bg-[#1c1c1f] text-white focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500 ${
                  formErrors.barcode ? 'border-rose-400' : 'border-[#27272a]'
                }`}
              />
            </div>
            {formErrors.barcode ? (
              <p className="text-xs text-rose-400 mt-1">{formErrors.barcode}</p>
            ) : formData.barcode?.length === 13 ? (
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" /> Mã vạch hợp lệ chuẩn GS1 Checksum
              </p>
            ) : null}
          </div>

          {/* Image Select */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Ảnh đại diện (Tùy chọn)
            </label>
            <div className="flex items-center gap-3">
              {createImagePreview ? (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#27272a]">
                  <img src={createImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setCreateImagePreview('');
                      setFormData((prev) => ({ ...prev, imageUrl: null }));
                    }}
                    className="absolute top-1 right-1 p-0.5 bg-black/70 rounded-full text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : null}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleCreateImageChange}
                className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Mô tả quy cách
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ghi chú quy cách đóng gói, thông số..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#27272a] bg-[#1c1c1f] text-white text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-[#27272a]">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="btn-secondary text-xs py-2 px-4"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs py-2 px-5 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT PRODUCT */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa sản phẩm"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Mã sản phẩm (Không thể đổi)
            </label>
            <input
              type="text"
              disabled
              value={formData.productCode}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#27272a] bg-[#18181b] text-zinc-400 font-mono text-xs cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#27272a] bg-[#1c1c1f] text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500"
            />
            {formErrors.name && (
              <p className="text-xs text-rose-400 mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Mô tả
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#27272a] bg-[#1c1c1f] text-white text-xs focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#27272a] bg-[#1c1c1f] text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500"
            >
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Tạm ngưng</option>
              <option value="ARCHIVED">Lưu trữ</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-[#27272a]">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn-secondary text-xs py-2 px-4"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs py-2 px-5 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: ASSIGN BARCODE */}
      <Modal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        title="Gán mã vạch EAN-13"
      >
        <form onSubmit={handleBarcodeSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a]">
            <span className="text-[11px] text-zinc-400 font-semibold block">Sản phẩm áp dụng:</span>
            <div className="font-semibold text-xs text-white mt-0.5">
              #{selectedProduct?.productCode} - {selectedProduct?.name}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Mã vạch EAN-13 mới (13 chữ số)
            </label>
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
                placeholder="Nhập 13 số barcode GS1..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#27272a] bg-[#1c1c1f] text-white font-mono text-xs tracking-wider focus:outline-none focus:ring-2 focus:ring-zinc-500/20 focus:border-zinc-500"
              />
            </div>
            {barcodeError && (
              <p className="text-xs text-rose-400 mt-1">{barcodeError}</p>
            )}
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-[#27272a]">
            {selectedProduct?.barcode ? (
              <button
                type="button"
                onClick={handleUnassignBarcode}
                disabled={isSubmitting}
                className="text-xs font-semibold text-rose-400 hover:underline"
              >
                Hủy gán mã vạch hiện tại
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsBarcodeModalOpen(false)}
                className="btn-secondary text-xs py-2 px-3.5"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !barcodeInput.trim()}
                className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
              >
                {isSubmitting ? 'Đang gán...' : 'Gán mã vạch'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: IMAGE UPLOAD MODAL */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Ảnh đại diện sản phẩm"
      >
        <form onSubmit={handleUploadImageSubmit} className="space-y-4">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#27272a] rounded-2xl bg-[#18181b]">
            {imagePreview ? (
              <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-[#27272a] shadow-sm mb-3">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <ImageIcon className="w-12 h-12 text-zinc-500 mb-2" />
            )}

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 cursor-pointer"
            />
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-[#27272a]">
            {selectedProduct?.imageUrl ? (
              <button
                type="button"
                onClick={handleDeleteImage}
                disabled={isUploadingImage}
                className="text-xs font-semibold text-rose-400 hover:underline"
              >
                Xóa ảnh đại diện
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="btn-secondary text-xs py-2 px-3.5"
              >
                Đóng
              </button>
              {imageFile && (
                <button
                  type="submit"
                  disabled={isUploadingImage}
                  className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
                >
                  {isUploadingImage ? 'Đang lưu...' : 'Lưu ảnh'}
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* CONFIRM PERMANENT DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xóa vĩnh viễn sản phẩm ⚠️"
        message={`Bạn có chắc chắn muốn XÓA HOÀN TOÀN sản phẩm [${selectedProduct?.productCode} - ${selectedProduct?.name}] khỏi cơ sở dữ liệu? Dữ liệu sản phẩm sẽ bị xóa vĩnh viễn và mã vạch ${selectedProduct?.barcode ? '[' + selectedProduct.barcode + ']' : ''} sẽ được giải phóng hoàn toàn. Thao tác này KHÔNG THỂ hoàn tác!`}
        confirmText="Xóa vĩnh viễn"
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
}
