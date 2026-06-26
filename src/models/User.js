const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['guest', 'member', 'admin'],
        default: 'member'
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    // Single-session enforcement: stores the current valid JWT jti
    activeSessionToken: {
        type: String,
        default: null
    },
    // Organization / School / Corporate group tracking (Drishti / Community)
    organization: {
        type: String,
        default: ''
    },
    socialLinks: {
        website: { type: String, default: '' },
        youtube: { type: String, default: '' },
        instagram: { type: String, default: '' },
        facebook: { type: String, default: '' }
    },
    interests: [{
        type: String,
        enum: ['folk-art', 'tribal-art', 'mindfulness', 'creativity', 'heritage', 'community', 'painting', 'sculpture', 'textile', 'pottery']
    }],
    enrolledPrograms: [{
        program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
        enrolledModules: [{ type: mongoose.Schema.Types.ObjectId }],
        enrolledAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
        progress: { type: Number, default: 0 },
        // Pratibimb-specific attendance tracking (41-day sadhana)
        attendance: [{
            date: { type: Date },
            marked: { type: Boolean, default: false }
        }],
        // Video progress tracking for KalaPath online / Chaitanya / Sparsh
        videoProgress: [{
            videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
            moduleTitle: { type: String, default: '' },
            sessionIndex: { type: Number, default: 0 },
            watchedAt: { type: Date, default: Date.now },
            completed: { type: Boolean, default: false },
            lastPosition: { type: Number, default: 0 } // seconds, for resume
        }],
        // Module-level submission tracking for Chaitanya / Sparsh
        // Tracks which modules have had artwork + activity submissions
        moduleSubmissions: [{
            moduleId: { type: mongoose.Schema.Types.ObjectId },
            moduleTitle: { type: String, default: '' },
            artworkSubmitted: { type: Boolean, default: false },
            artworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
            activitySubmitted: { type: Boolean, default: false },
            activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
            submittedAt: { type: Date, default: Date.now }
        }],
        // Track which modules are completed (all sessions watched + submissions done)
        completedModules: [{ type: mongoose.Schema.Types.ObjectId }]
    }],
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full profile URL
UserSchema.virtual('profileUrl').get(function () {
    return `/community/${this._id}`;
});

module.exports = mongoose.model('User', UserSchema);