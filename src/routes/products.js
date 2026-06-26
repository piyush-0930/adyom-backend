const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAllProducts, getProductBySlug, getAllProductsAdmin, createProduct, updateProduct, deleteProduct, markAsSold, getFeaturedProducts } = require('../controllers/productController');

// Public routes
router.get('/featured', getFeaturedProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/', getAllProducts);

// Admin routes
router.get('/admin', protect, authorize('admin'), getAllProductsAdmin);
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.put('/:id/sold', protect, authorize('admin'), markAsSold);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;