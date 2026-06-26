const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        default: '',
        maxlength: 1000
    },
    url: {
        type: String,
        required: [true, 'Video URL is required']
    },
    platform: {
        type: String,
        enum: ['youtube', 'vimeo', 'other'],
        default: 'youtube'
    },
    thumbnail: {
        type: String,
        default: ''
    },
    duration: {
        type: String,
        default: ''
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submitterName: {
        type: String,
        default: ''
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
    },
    category: {
        type: String,
        enum: ['folk-art', 'tribal-art', 'mindfulness', 'creativity', 'heritage', 'tutorial', 'demonstration', 'project', 'other'],
        default: 'other'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminNote: {
        type: String,
        default: ''
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    isPublic: {
        type: Boolean,
        default: false
    },
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

module.exports = mongoose.model('Video', VideoSchema);