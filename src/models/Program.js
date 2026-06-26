const mongoose = require('mongoose');
const slugify = require('slugify');

const ProgramSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        unique: true
    },
    subtitle: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    longDescription: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['drishti', 'chaitanya', 'kala-path', 'sparsh', 'pratibimb', 'kala-vritti', 'samanvaya', 'workshop', 'other'],
        default: 'other'
    },
    programType: {
        type: String,
        enum: ['Drishti', 'Chaitanya', 'Sparsh', 'KalaPath', 'KalaVritti', 'Pratibimb', 'SkillBuilding'],
        default: undefined
    },
    // Age group for Chaitanya (adults) / Sparsh (kids) — same structure, different audience
    ageGroup: {
        type: String,
        enum: ['adults', 'kids', 'all', ''],
        default: ''
    },
    // Total program duration in weeks (e.g., 49 for Chaitanya/Sparsh)
    programDurationWeeks: {
        type: Number,
        default: 0
    },
    // Maximum number of simultaneously active modules (7 for Chaitanya/Sparsh)
    maxActiveModules: {
        type: Number,
        default: 7
    },
    duration: {
        type: String,
        default: ''
    },
    format: {
        type: String,
        enum: ['online', 'offline', 'hybrid'],
        default: 'online'
    },
    isSponsored: {
        type: Boolean,
        default: false
    },
    sponsorDetails: {
        type: String,
        default: ''
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    schedule: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    price: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    isFree: {
        type: Boolean,
        default: false
    },
    maxEnrollments: {
        type: Number,
        default: 100
    },
    currentEnrollments: {
        type: Number,
        default: 0
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'all'],
        default: 'all'
    },
    featured: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    highlights: [{
        type: String
    }],
    // Enhanced modules for Chaitanya/Sparsh: each module = one art form
    modules: [{
        title: { type: String, required: true },
        description: { type: String, default: '' },
        // The tribal/folk art form name (e.g., "Gond Art", "Warli Art", "Madhubani")
        artFormName: { type: String, default: '' },
        // Type: tribal or folk
        artFormType: { type: String, enum: ['tribal', 'folk', 'other', ''], default: '' },
        // Display order within the program
        order: { type: Number, default: 0 },
        // Material list PDF/download URL
        materialListUrl: { type: String, default: '' },
        // Admin-controlled: is this module currently active/running?
        isActive: { type: Boolean, default: false },
        // Admin-controlled: is this module locked (learners cannot access)?
        isLocked: { type: Boolean, default: false },
        // When this module was activated (for ordering active modules)
        activatedAt: { type: Date },
        // Pre-recorded fundamentals video URL (shown before sessions)
        fundamentalsVideoUrl: { type: String, default: '' },
        // Lessons (pre-recorded video lessons)
        lessons: [{
            title: { type: String },
            type: { type: String, enum: ['video', 'article', 'exercise', 'quiz'], default: 'video' },
            content: { type: String, default: '' },
            videoUrl: { type: String, default: '' },
            duration: { type: String, default: '' }
        }],
        // Sessions: 4 creation + 2 application = 6 sessions per module
        sessions: [{
            title: { type: String },
            videoUrl: { type: String, default: '' },
            type: { type: String, enum: ['creation', 'application', 'live-recording'], default: 'creation' },
            // Session number within the module (1-6)
            sessionNumber: { type: Number, default: 0 },
            // Duration of the session video
            duration: { type: String, default: '' },
            // Thumbnail for the session video
            thumbnail: { type: String, default: '' }
        }],
        // Weekly live class recordings (linked to this module)
        liveRecordings: [{
            title: { type: String },
            videoUrl: { type: String, default: '' },
            recordedAt: { type: Date },
            duration: { type: String, default: '' }
        }]
    }],
    instructor: {
        name: String,
        bio: String,
        image: String
    },
    tags: [{
        type: String
    }],
    seoTitle: {
        type: String,
        default: ''
    },
    seoDescription: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Virtual: count of currently active modules
ProgramSchema.virtual('activeModulesCount').get(function () {
    return this.modules.filter(m => m.isActive).length;
});

// Ensure virtuals are included in JSON output
ProgramSchema.set('toJSON', { virtuals: true });
ProgramSchema.set('toObject', { virtuals: true });

ProgramSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model('Program', ProgramSchema);