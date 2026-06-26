const mongoose = require('mongoose');

const CommunityAttendeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    organization: {
        type: String,
        default: ''
    },
    meetId: {
        type: String,
        required: [true, 'Meet ID is required'],
        index: true
    },
    meetTitle: {
        type: String,
        default: ''
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
    },
    // For tracking returning guests across multiple meets
    guestId: {
        type: String,
        default: ''
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    leftAt: {
        type: Date
    },
    duration: {
        type: Number,
        default: 0 // minutes
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Compound index for deduping same guest in same meet
CommunityAttendeeSchema.index({ email: 1, meetId: 1 }, { unique: true });

module.exports = mongoose.model('CommunityAttendee', CommunityAttendeeSchema);