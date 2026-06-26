const mongoose = require('mongoose');

const CorporateLeadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    organization: {
        type: String,
        required: [true, 'Organization is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Phone is required']
    },
    requirements: {
        type: String,
        required: [true, 'Requirements is required']
    },
    interest: {
        type: String,
        enum: ['csr-programs', 'employee-engagement', 'mural-projects', 'environmental-campaigns', 'women-empowerment', 'artisan-workshops', 'cultural-events', 'other'],
        default: 'other'
    },
    budget: {
        type: String,
        default: ''
    },
    timeline: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'proposal-sent', 'negotiating', 'confirmed', 'closed'],
        default: 'new'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: [{
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CorporateLead', CorporateLeadSchema);