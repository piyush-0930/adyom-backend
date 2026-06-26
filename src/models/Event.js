const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    shortDescription: {
        type: String,
        maxlength: 300,
        default: ''
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    endDate: {
        type: Date
    },
    time: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    onlineLink: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['workshop', 'exhibition', 'cultural-event', 'community-event', 'fundraiser', 'volunteer-activity', 'other'],
        default: 'other'
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    maxAttendees: {
        type: Number,
        default: 100
    },
    currentAttendees: {
        type: Number,
        default: 0
    },
    isFree: {
        type: Boolean,
        default: true
    },
    price: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    registeredUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', EventSchema);