const mongoose = require('mongoose');

const SponsorCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        required: [true, 'Sponsor code is required'],
        uppercase: true,
        trim: true
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        required: true
    },
    organization: {
        type: String,
        required: [true, 'Organization name is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    maxUses: {
        type: Number,
        default: 0 // 0 = unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Check if code is still valid before use
SponsorCodeSchema.methods.isValid = function () {
    if (!this.isActive) return false;
    if (this.expiresAt && new Date() > this.expiresAt) return false;
    if (this.maxUses > 0 && this.usedCount >= this.maxUses) return false;
    return true;
};

module.exports = mongoose.model('SponsorCode', SponsorCodeSchema);