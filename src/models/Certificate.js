const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
    },
    // Distinguishes Excellence (3/6 modules), Completion, and Award certificates
    certificateType: {
        type: String,
        enum: ['excellence', 'completion', 'award'],
        default: 'completion'
    },
    // For excellence certificates: tracks how many modules were completed
    excellenceLevel: {
        type: Number,
        enum: [3, 6, null],
        default: null
    },
    // Award subtype for tracking-based awards
    awardType: {
        type: String,
        enum: ['max-attendee', 'max-submission', 'most-innovative', ''],
        default: ''
    },
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    certificateNumber: {
        type: String,
        unique: true
    },
    template: {
        type: String,
        default: 'default'
    },
    fileUrl: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

CertificateSchema.pre('save', async function (next) {
    if (!this.certificateNumber) {
        const count = await this.constructor.countDocuments();
        this.certificateNumber = `ADYOM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Certificate', CertificateSchema);