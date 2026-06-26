const mongoose = require('mongoose');

const ArtworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: 1000
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    artistName: {
        type: String,
        default: ''
    },
    images: [{
        url: { type: String, required: true },
        caption: { type: String, default: '' }
    }],
    pdfs: [{
        url: { type: String },
        name: { type: String }
    }],
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
    },
    // Reference to specific module within a program (Chaitanya / Sparsh / KalaPath)
    programModuleId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    // Stored module name for easier querying without population
    moduleName: {
        type: String,
        default: ''
    },
    // Submission type: core artwork, applied activity, or Pratibimb daily canvas
    submissionType: {
        type: String,
        enum: ['artwork', 'activity', 'pratibimb-canvas'],
        default: 'artwork'
    },
    category: {
        type: String,
        enum: ['folk-art', 'tribal-art', 'painting', 'sculpture', 'textile', 'pottery', 'mixed-media', 'other'],
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
    // "Most Innovative" nomination: admin can mark artworks as innovative
    isInnovative: {
        type: Boolean,
        default: false
    },
    innovativeNominatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    innovativeNominatedAt: {
        type: Date
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

module.exports = mongoose.model('Artwork', ArtworkSchema);