const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    artist: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: null
    },
    images: [{
        url: { type: String, required: true },
        caption: { type: String, default: '' },
        alt: { type: String, default: '' }
    }],
    category: {
        type: String,
        enum: ['painting', 'folk-art', 'craft', 'photography', 'sculpture', 'textile', 'mindfulness', 'textile-art', 'mixed-media', 'student-artwork', 'community-projects', 'workshops', 'events', 'artisan-work'],
        default: 'painting'
    },
    tags: [{
        type: String
    }],
    featured: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Gallery', GallerySchema);