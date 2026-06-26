const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        maxlength: 2000
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorName: {
        type: String,
        default: ''
    },
    images: [{
        url: { type: String },
        caption: { type: String, default: '' }
    }],
    category: {
        type: String,
        enum: ['artwork', 'progress', 'discussion', 'inspiration', 'question', 'announcement'],
        default: 'discussion'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        comment: String,
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);