import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
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
  Archive,
  Trash2,
  Upload,
  Check,
  AlertCircle,
  Eye,
  Filter,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProductsPage() {
  const dispatch = useDispatch();

  // Data state
  const [products, setProducts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination state
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    productCode: '',
    name: '',
    description: '',
    status: 'ACTIVE',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Barcode form state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeError, setBarcodeError] = useState('');

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
  const handleOpenCreateModal = () => {
    setFormData({
      productCode: '',
      name: '',
      description: '',
      status: 'ACTIVE',
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

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

  // Open Archive Dialog
  const handleOpenArchiveDialog = (product) => {
    setSelectedProduct(product);
    setIsArchiveDialogOpen(true);
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
        name: formData.name,
        description: formData.description,
        status: formData.status,
      });
      dispatch(
        addToast({
          type: 'success',
          message: 'Cập nhật thông tin sản phẩm thành công!',
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

    if (!barcodeInput || !isValidEan13(barcodeInput.trim())) {
      setBarcodeError('Mã vạch phải gồm đúng 13 số và thỏa mãn checksum GS1 EAN-13');
      return;
    }

    try {
      setIsSubmitting(true);
      await barcodeApi.assign({
        productId: selectedProduct.id,
        barcode: barcodeInput.trim(),
      });
      dispatch(
        addToast({
          type: 'success',
          message: `Gán mã vạch EAN-13 [${barcodeInput.trim()}] thành công!`,
        })
      );
      setIsBarcodeModalOpen(false);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể gán barcode';
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

  // Upload Image to Cloudinary
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
          message: 'Tải ảnh lên Cloudinary thành công!',
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
          message: 'Đã xóa ảnh đại diện sản phẩm khỏi Cloudinary!',
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

  // Soft delete / Archive
  const handleArchiveConfirm = async () => {
    try {
      setIsSubmitting(true);
      await productApi.archiveProduct(selectedProduct.id);
      dispatch(
        addToast({
          type: 'success',
          message: `Đã lưu trữ sản phẩm [${selectedProduct.productCode}] thành công!`,
        })
      );
      setIsArchiveDialogOpen(false);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi lưu trữ sản phẩm';
      dispatch(addToast({ type: 'error', message: msg }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick toggle status
  const handleQuickStatusChange = async (product, newStatus) => {
    try {
      await productApi.updateProductStatus(product.id, newStatus);
      dispatch(
        addToast({
          type: 'success',
          message: `Đổi trạng thái sang [${newStatus}] thành công!`,
        })
      );
      fetchProducts();
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: 'Không thể cập nhật trạng thái',
        })
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Sản phẩm</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Danh sách ánh xạ mã 6 số nội bộ và barcode EAN-13
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition shadow-sm shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm mới
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo tên hoặc mã 6 số..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="w-full md:w-48 bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động (ACTIVE)</option>
            <option value="INACTIVE">Tạm ngưng (INACTIVE)</option>
            <option value="ARCHIVED">Lưu trữ (ARCHIVED)</option>
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Ảnh</th>
                  <th className="py-3 px-4">Mã nội bộ (6 số)</th>
                  <th className="py-3 px-4">Tên sản phẩm</th>
                  <th className="py-3 px-4">Mã vạch EAN-13</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Ngày tạo</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      Không tìm thấy sản phẩm nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition">
                      {/* Image Thumbnail */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleOpenImageModal(product)}
                          className="relative group w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center"
                          title="Bấm để đổi ảnh"
                        >
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                            <Upload className="w-4 h-4 text-white" />
                          </div>
                        </button>
                      </td>

                      {/* Product Code */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg text-sm border border-brand-200">
                          {product.productCode}
                        </span>
                      </td>

                      {/* Name & Description */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-900 truncate">{product.name}</div>
                        {product.description && (
                          <div className="text-xs text-slate-400 truncate">{product.description}</div>
                        )}
                      </td>

                      {/* Barcode */}
                      <td className="py-3 px-4">
                        {product.barcode ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded text-xs">
                              {product.barcode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">
                            Chưa gán
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge status={product.status} />
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDateTime(product.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Assign Barcode Button */}
                          <button
                            onClick={() => handleOpenBarcodeModal(product)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition"
                            title="Gán / Đổi Barcode"
                          >
                            <BarcodeIcon className="w-4 h-4" />
                          </button>

                          {/* Upload Image Button */}
                          <button
                            onClick={() => handleOpenImageModal(product)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Quản lý ảnh đại diện"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Archive Button */}
                          {product.status !== 'ARCHIVED' && (
                            <button
                              onClick={() => handleOpenArchiveDialog(product)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Lưu trữ (Soft Delete)"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
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
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Mã sản phẩm (6 chữ số) *
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
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                formErrors.productCode ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
              }`}
            />
            {formErrors.productCode ? (
              <p className="text-xs text-rose-600 mt-1">{formErrors.productCode}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Người dùng tự nhập đúng 6 chữ số, cho phép số 0 ở đầu (001234)
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên sản phẩm..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                formErrors.name ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
              }`}
            />
            {formErrors.name && (
              <p className="text-xs text-rose-600 mt-1">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả thông tin sản phẩm..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Trạng thái ban đầu
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ACTIVE">Hoạt động (ACTIVE)</option>
              <option value="INACTIVE">Tạm ngưng (INACTIVE)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo sản phẩm'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT PRODUCT */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Chỉnh sửa sản phẩm [${selectedProduct?.productCode}]`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Mã sản phẩm (Không thể thay đổi)
            </label>
            <input
              type="text"
              disabled
              value={formData.productCode}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm font-mono text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                formErrors.name ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ACTIVE">Hoạt động (ACTIVE)</option>
              <option value="INACTIVE">Tạm ngưng (INACTIVE)</option>
              <option value="ARCHIVED">Lưu trữ (ARCHIVED)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: ASSIGN BARCODE EAN-13 */}
      <Modal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        title={`Gán Barcode cho [${selectedProduct?.productCode}] - ${selectedProduct?.name}`}
      >
        <form onSubmit={handleBarcodeSubmit} className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div>• Barcode phải có chính xác 13 chữ số.</div>
            <div>• Phải vượt qua thuật toán GS1 Modulo 10 Checksum.</div>
            <div>• Quan hệ 1 - 1: mỗi barcode chỉ thuộc 1 sản phẩm duy nhất.</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Mã Barcode EAN-13 (13 số) *
            </label>
            <input
              type="text"
              maxLength={13}
              value={barcodeInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setBarcodeInput(val);
                setBarcodeError('');
              }}
              placeholder="VD: 4006381333931"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                barcodeError ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
              }`}
            />
            {barcodeError && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {barcodeError}
              </p>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {selectedProduct?.barcode ? (
              <button
                type="button"
                onClick={handleUnassignBarcode}
                disabled={isSubmitting}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                Hủy gán Barcode
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsBarcodeModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Đang lưu...' : 'Gán mã vạch'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: IMAGE UPLOAD (CLOUDINARY) */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title={`Ảnh đại diện [${selectedProduct?.productCode}]`}
      >
        <form onSubmit={handleUploadImageSubmit} className="space-y-4">
          <div className="flex flex-col items-center justify-center">
            {imagePreview ? (
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm mb-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center text-slate-400 mb-3 bg-slate-50">
                <ImageIcon className="w-12 h-12 mb-2 text-slate-300" />
                <span className="text-xs">Chưa có ảnh đại diện</span>
              </div>
            )}

            <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition">
              <span>Chọn ảnh mới từ máy tính</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-400 mt-1">Định dạng JPG, PNG, WEBP (Tối đa 5MB)</p>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {selectedProduct?.imageUrl ? (
              <button
                type="button"
                onClick={handleDeleteImage}
                disabled={isUploadingImage}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa ảnh hiện tại
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
              >
                Đóng
              </button>
              {imageFile && (
                <button
                  type="submit"
                  disabled={isUploadingImage}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {isUploadingImage ? 'Đang tải lên...' : 'Lưu ảnh Cloudinary'}
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* CONFIRM ARCHIVE DIALOG */}
      <ConfirmDialog
        isOpen={isArchiveDialogOpen}
        onClose={() => setIsArchiveDialogOpen(false)}
        onConfirm={handleArchiveConfirm}
        title="Lưu trữ sản phẩm"
        message={`Bạn có chắc chắn muốn chuyển sản phẩm [${selectedProduct?.productCode} - ${selectedProduct?.name}] sang trạng thái ARCHIVED (Lưu trữ) không? Hành động này tuân thủ nguyên tắc không xóa vật lý dữ liệu.`}
        confirmText="Lưu trữ sản phẩm"
        isDanger={true}
        isLoading={isSubmitting}
      />
    </div>
  );
}

