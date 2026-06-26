const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Product title is required'],
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: 2000
    },
    images: [{
        url: { type: String, required: true },
        caption: { type: String, default: '' }
    }],
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    compareAtPrice: {
        type: Number,
        default: 0
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sellerName: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['painting', 'textile', 'pottery', 'jewelry', 'home-decor', 'stationery', 'other'],
        default: 'other'
    },
    artForm: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'reserved', 'draft'],
        default: 'available'
    },
    quantity: {
        type: Number,
        default: 1
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    dimensions: {
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        unit: { type: String, enum: ['cm', 'in'], default: 'cm' }
    },
    weight: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

ProductSchema.pre('save', async function (next) {
    if (this.isModified('title')) {
        const slugify = require('slugify');
        let baseSlug = slugify(this.title, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;
        while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        this.slug = slug;
    }
    next();
});

module.exports = mongoose.model('Product', ProductSchema);