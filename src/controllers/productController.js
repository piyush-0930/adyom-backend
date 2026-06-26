const Product = require('../models/Product');

// Public: Get all published products
exports.getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, featured, seller, status } = req.query;
        const query = { isPublished: true, status: 'available' };

        if (category) query.category = category;
        if (featured === 'true') query.featured = true;
        if (seller) query.seller = seller;

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('seller', 'name avatar')
            .sort({ featured: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: products,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Public: Get single product by slug
exports.getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug })
            .populate('seller', 'name avatar bio location');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Get all products (including drafts/sold)
exports.getAllProductsAdmin = async (req, res) => {
    try {
        const { status, category, seller } = req.query;
        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (seller) query.seller = seller;

        const products = await Product.find(query)
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Seller/Admin: Create a product
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create({
            ...req.body,
            seller: req.user._id,
            sellerName: req.user.name
        });
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Seller/Admin: Update a product
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Only the seller or admin can update
        if (req.user.role !== 'admin' && product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Mark product as sold
exports.markAsSold = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status: 'sold' },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get featured products for marketplace page
exports.getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({
            featured: true,
            isPublished: true,
            status: 'available'
        })
            .populate('seller', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(8);

        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};