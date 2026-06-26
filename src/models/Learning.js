const mongoose = require('mongoose');

const LearningSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['video', 'article', 'guide', 'resource'],
        default: 'article'
    },
    category: {
        type: String,
        enum: ['folk-art', 'tribal-art', 'mindfulness', 'creativity', 'heritage'],
        default: 'folk-art'
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    videoUrl: {
        type: String,
        default: ''
    },
    thumbnail: {
        type: String,
        default: ''
    },
    duration: {
        type: String,
        default: ''
    },
    fileUrl: {
        type: String,
        default: ''
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
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
    isPublished: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Learning', LearningSchema);