import { db } from '../firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { isValidEan13, isValidProductCode } from '../utils/ean13Validator';

const PRODUCTS_COL = 'products';
const SCAN_HISTORIES_COL = 'scan_histories';
const USERS_COL = 'users';

export const firebaseService = {
  // -------------------------------------------------------------
  // PRODUCTS
  // -------------------------------------------------------------
  async getProducts(params = {}) {
    const {
      page = 0,
      size = 10,
      keyword,
      status,
      sortBy = 'createdAt',
      direction = 'desc',
    } = params;

    const colRef = collection(db, PRODUCTS_COL);
    const snapshot = await getDocs(colRef);
    let list = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // Filter by status
    if (status) {
      list = list.filter((p) => p.status === status);
    }

    // Filter by keyword
    if (keyword && keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      list = list.filter((p) => {
        const codeMatch = p.productCode && p.productCode.toLowerCase().includes(q);
        const nameMatch = p.name && p.name.toLowerCase().includes(q);
        const barcodeMatch = p.barcode && p.barcode.toLowerCase().includes(q);
        return codeMatch || nameMatch || barcodeMatch;
      });
    }

    // Sort
    list.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    const totalElements = list.length;
    const totalPages = Math.ceil(totalElements / size) || 1;
    const start = page * size;
    const pagedContent = list.slice(start, start + size);

    return {
      data: {
        content: pagedContent,
        totalElements,
        totalPages,
        number: page,
        size,
        first: page === 0,
        last: page >= totalPages - 1,
      },
    };
  },

  async getProductById(id) {
    if (!id) throw new Error('ID sản phẩm không hợp lệ');
    const docRef = doc(db, PRODUCTS_COL, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      const err = new Error('Không tìm thấy sản phẩm trong hệ thống');
      err.response = { data: { message: err.message } };
      throw err;
    }
    return {
      data: {
        id: snap.id,
        ...snap.data(),
      },
    };
  },

  async getProductByCode(productCode) {
    const q = query(
      collection(db, PRODUCTS_COL),
      where('productCode', '==', String(productCode).trim())
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      const err = new Error(`Không tìm thấy sản phẩm có mã [${productCode}]`);
      err.response = { data: { message: err.message } };
      throw err;
    }
    const d = snap.docs[0];
    return {
      data: { id: d.id, ...d.data() },
    };
  },

  async createProduct(data) {
    const { productCode, name, description, barcode, status = 'ACTIVE' } = data;

    if (!isValidProductCode(productCode)) {
      const err = new Error('Mã nội bộ phải gồm đúng 6 chữ số (VD: 001234)');
      err.response = { data: { message: err.message } };
      throw err;
    }

    if (!name || !name.trim()) {
      const err = new Error('Tên sản phẩm không được để trống');
      err.response = { data: { message: err.message } };
      throw err;
    }

    // Check unique productCode
    const codeQuery = query(
      collection(db, PRODUCTS_COL),
      where('productCode', '==', productCode.trim())
    );
    const codeSnap = await getDocs(codeQuery);
    if (!codeSnap.empty) {
      const err = new Error(`Mã hàng nội bộ [${productCode}] đã tồn tại trong hệ thống!`);
      err.response = { data: { message: err.message } };
      throw err;
    }

    // Barcode 13 digits is mandatory
    let cleanBarcode = barcode ? String(barcode).trim() : '';
    if (cleanBarcode.length === 12 && isValidEan13('0' + cleanBarcode)) {
      cleanBarcode = '0' + cleanBarcode;
    }

    if (!cleanBarcode) {
      const err = new Error('Mã vạch EAN-13 là bắt buộc cho mỗi sản phẩm');
      err.response = { data: { message: err.message } };
      throw err;
    }

    if (!isValidEan13(cleanBarcode)) {
      const err = new Error('Mã vạch phải đúng 13 số và thỏa mãn Modulo-10 Checksum GS1');
      err.response = { data: { message: err.message } };
      throw err;
    }

    const barcodeQuery = query(
      collection(db, PRODUCTS_COL),
      where('barcode', '==', cleanBarcode)
    );
    const barcodeSnap = await getDocs(barcodeQuery);
    const activeDupe = barcodeSnap.docs.find((d) => d.data().status !== 'ARCHIVED');
    if (activeDupe) {
      const p = activeDupe.data();
      const err = new Error(
        `Mã vạch [${cleanBarcode}] đã được gán cho sản phẩm khác [${p.productCode} - ${p.name}]!`
      );
      err.response = { data: { message: err.message } };
      throw err;
    }

    const now = new Date().toISOString();
    const newDocRef = doc(collection(db, PRODUCTS_COL));
    const newProduct = {
      id: newDocRef.id,
      productCode: productCode.trim(),
      name: name.trim(),
      description: description ? description.trim() : null,
      barcode: cleanBarcode,
      imageUrl: data.imageUrl || null,
      status: status || 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(newDocRef, newProduct);
    return { data: newProduct };
  },

  async updateProduct(id, data) {
    const docRef = doc(db, PRODUCTS_COL, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      const err = new Error('Không tìm thấy sản phẩm cần cập nhật');
      err.response = { data: { message: err.message } };
      throw err;
    }

    const current = snap.data();
    const updates = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, updates);

    return {
      data: { id, ...current, ...updates },
    };
  },

  async updateProductStatus(id, newStatus) {
    const docRef = doc(db, PRODUCTS_COL, id);
    const updates = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, updates);
    const snap = await getDoc(docRef);
    return {
      data: { id: snap.id, ...snap.data() },
    };
  },

  async archiveProduct(id) {
    return this.updateProductStatus(id, 'ARCHIVED');
  },

  async deleteProduct(id) {
    const docRef = doc(db, PRODUCTS_COL, id);
    await deleteDoc(docRef);
    return {
      data: {
        success: true,
        message: 'Đã xóa vĩnh viễn sản phẩm thành công.',
      },
    };
  },

  async uploadImage(id, file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Url = reader.result;
          const docRef = doc(db, PRODUCTS_COL, id);
          await updateDoc(docRef, {
            imageUrl: base64Url,
            updatedAt: new Date().toISOString(),
          });
          const snap = await getDoc(docRef);
          resolve({ data: { id: snap.id, ...snap.data() } });
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  async deleteImage(id) {
    const docRef = doc(db, PRODUCTS_COL, id);
    await updateDoc(docRef, {
      imageUrl: null,
      updatedAt: new Date().toISOString(),
    });
    const snap = await getDoc(docRef);
    return { data: { id: snap.id, ...snap.data() } };
  },

  // -------------------------------------------------------------
  // BARCODES
  // -------------------------------------------------------------
  async lookupBarcode(params) {
    const { barcode, deviceInfo = 'Web Admin Browser' } = params;
    let rawBarcode = barcode ? String(barcode).trim() : '';

    if (!rawBarcode) {
      return {
        data: {
          status: 'INVALID',
          barcode: '',
          barcodeScanned: '',
          message: 'Vui lòng cung cấp mã vạch',
          scannedAt: new Date().toISOString(),
        },
      };
    }

    // Auto-normalize 12-digit UPC-A to 13-digit EAN-13 if valid
    if (rawBarcode.length === 12 && isValidEan13('0' + rawBarcode)) {
      rawBarcode = '0' + rawBarcode;
    }

    const now = new Date().toISOString();

    if (!isValidEan13(rawBarcode)) {
      await addDoc(collection(db, SCAN_HISTORIES_COL), {
        barcode: rawBarcode,
        barcodeScanned: rawBarcode,
        status: 'INVALID',
        deviceInfo,
        scannedAt: now,
      }).catch((e) => console.warn(e));

      return {
        data: {
          status: 'INVALID',
          barcode: rawBarcode,
          barcodeScanned: rawBarcode,
          message: 'Mã vạch không đúng 13 số hoặc sai Modulo-10 Checksum GS1',
          scannedAt: now,
        },
      };
    }

    const q = query(
      collection(db, PRODUCTS_COL),
      where('barcode', '==', rawBarcode)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      await addDoc(collection(db, SCAN_HISTORIES_COL), {
        barcode: rawBarcode,
        barcodeScanned: rawBarcode,
        status: 'NOT_FOUND',
        deviceInfo,
        scannedAt: now,
      }).catch((e) => console.warn(e));

      return {
        data: {
          status: 'NOT_FOUND',
          barcode: rawBarcode,
          barcodeScanned: rawBarcode,
          message: 'Mã vạch chưa được gán cho sản phẩm nào',
          scannedAt: now,
        },
      };
    }

    const productDoc = snap.docs[0];
    const product = { id: productDoc.id, ...productDoc.data() };

    await addDoc(collection(db, SCAN_HISTORIES_COL), {
      barcode: rawBarcode,
      barcodeScanned: rawBarcode,
      status: 'FOUND',
      productId: product.id,
      productCode: product.productCode,
      productName: product.name,
      deviceInfo,
      scannedAt: now,
    }).catch((e) => console.warn(e));

    return {
      data: {
        status: 'FOUND',
        barcode: rawBarcode,
        barcodeScanned: rawBarcode,
        product,
        message: 'Tìm thấy sản phẩm thành công',
        scannedAt: now,
      },
    };
  },

  async assignBarcode(params) {
    const { productId, barcode } = params;
    const cleanBarcode = barcode ? String(barcode).trim() : '';

    if (!isValidEan13(cleanBarcode)) {
      const err = new Error('Mã vạch phải gồm đúng 13 số và thỏa mãn Modulo-10 Checksum');
      err.response = { data: { message: err.message } };
      throw err;
    }

    const barcodeQuery = query(
      collection(db, PRODUCTS_COL),
      where('barcode', '==', cleanBarcode)
    );
    const snap = await getDocs(barcodeQuery);
    const conflict = snap.docs.find(
      (d) => d.id !== productId && d.data().status !== 'ARCHIVED'
    );
    if (conflict) {
      const p = conflict.data();
      const err = new Error(
        `Mã vạch [${cleanBarcode}] đã được gán cho sản phẩm [${p.productCode} - ${p.name}]!`
      );
      err.response = { data: { message: err.message } };
      throw err;
    }

    const docRef = doc(db, PRODUCTS_COL, productId);
    const updates = {
      barcode: cleanBarcode,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, updates);

    const updatedSnap = await getDoc(docRef);
    return { data: { id: updatedSnap.id, ...updatedSnap.data() } };
  },

  async unassignBarcode(productId) {
    const docRef = doc(db, PRODUCTS_COL, productId);
    const updates = {
      barcode: null,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, updates);

    const updatedSnap = await getDoc(docRef);
    return { data: { id: updatedSnap.id, ...updatedSnap.data() } };
  },

  // -------------------------------------------------------------
  // SCAN HISTORIES
  // -------------------------------------------------------------
  async getScanHistories(params = {}) {
    const { page = 0, size = 10, status, sortBy = 'scannedAt', direction = 'desc' } = params;
    const colRef = collection(db, SCAN_HISTORIES_COL);

    const snap = await getDocs(colRef);
    let list = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        barcodeScanned: data.barcodeScanned || data.barcode || '',
        barcode: data.barcode || data.barcodeScanned || '',
      };
    });

    if (status) {
      list = list.filter((h) => h.status === status);
    }

    list.sort((a, b) => {
      const tA = a[sortBy] || '';
      const tB = b[sortBy] || '';
      if (direction === 'asc') return tA > tB ? 1 : -1;
      return tA < tB ? 1 : -1;
    });

    const totalElements = list.length;
    const totalPages = Math.ceil(totalElements / size) || 1;
    const start = page * size;
    const pagedContent = list.slice(start, start + size);

    return {
      data: {
        content: pagedContent,
        totalElements,
        totalPages,
        number: page,
        size,
        first: page === 0,
        last: page >= totalPages - 1,
      },
    };
  },

  async getHistoryById(id) {
    const docRef = doc(db, SCAN_HISTORIES_COL, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      const err = new Error('Không tìm thấy lịch sử quét');
      err.response = { data: { message: err.message } };
      throw err;
    }
    return { data: { id: snap.id, ...snap.data() } };
  },

  // -------------------------------------------------------------
  // DASHBOARD STATS
  // -------------------------------------------------------------
  async getStats() {
    const pSnap = await getDocs(collection(db, PRODUCTS_COL));
    const products = pSnap.docs.map((d) => d.data());

    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.status === 'ACTIVE').length;
    const assignedBarcodes = products.filter(
      (p) => p.barcode && p.status !== 'ARCHIVED'
    ).length;

    const hSnap = await getDocs(collection(db, SCAN_HISTORIES_COL));
    const histories = hSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayScans = histories.filter(
      (h) => h.scannedAt && h.scannedAt.startsWith(todayStr)
    ).length;

    histories.sort((a, b) => ((a.scannedAt || '') < (b.scannedAt || '') ? 1 : -1));
    const recentScans = histories.slice(0, 5);

    return {
      data: {
        totalProducts,
        activeProducts,
        assignedBarcodes,
        todayScans,
        totalScans: histories.length,
        recentScans,
      },
    };
  },

  // -------------------------------------------------------------
  // AUTH
  // -------------------------------------------------------------
  async login(credentials) {
    const { username, password } = credentials;

    const defaultAdminUser = import.meta.env.VITE_ADMIN_USERNAME;
    const defaultAdminPass = import.meta.env.VITE_ADMIN_PASSWORD;

    if (
      defaultAdminUser &&
      defaultAdminPass &&
      username === defaultAdminUser &&
      password === defaultAdminPass
    ) {
      return {
        data: {
          token: 'firebase-token-' + Date.now(),
          accessToken: 'firebase-token-' + Date.now(),
          user: {
            id: 'admin-01',
            username: defaultAdminUser,
            fullName: 'Quản trị viên (Firebase Cloud)',
            role: 'ROLE_ADMIN',
          },
        },
      };
    }

    const err = new Error('Tài khoản hoặc mật khẩu không chính xác');
    err.response = { data: { message: err.message } };
    throw err;
  },

  async getMe() {
    return {
      data: {
        id: 'admin-01',
        username: 'admin',
        fullName: 'Quản trị viên (Firebase Cloud)',
        role: 'ROLE_ADMIN',
      },
    };
  },

  async logout() {
    return {
      data: { success: true },
    };
  },
};
