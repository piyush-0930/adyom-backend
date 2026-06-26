const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('./models/User');
const Program = require('./models/Program');
const Learning = require('./models/Learning');
const Video = require('./models/Video');
const Product = require('./models/Product');
const SponsorCode = require('./models/SponsorCode');

// ─── Sample Video URLs (Google's test videos — publicly accessible) ──────────
const SAMPLE_VIDEOS = [
    {
        title: 'Big Buck Bunny',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnail: '',
    },
    {
        title: 'Sintel Trailer',
        url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
        thumbnail: '',
    },
    {
        title: 'Big Buck Bunny (HD)',
        url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
        thumbnail: '',
    },
    {
        title: 'Jellyfish',
        url: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4',
        thumbnail: '',
    },
    {
        title: 'Sintel',
        url: 'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4',
        thumbnail: '',
    },
    {
        title: 'Free Test Data',
        url: 'https://freetestdata.com/wp-content/uploads/2022/02/Free_Test_Data_1MB_MP4.mp4',
        thumbnail: '',
    },
    {
        title: 'Big Buck Bunny (Blender)',
        url: 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4',
        thumbnail: '',
    },
    {
        title: 'Sample Video',
        url: 'https://download.samplelib.com/mp4/sample-5s.mp4',
        thumbnail: '',
    },
];

// ─── Program Templates ───────────────────────────────────────────────────────
const PROGRAMS = [
    // ── Drishti Programs ────────────────────────────────────────────────────
    {
        title: 'Drishti: Individual Wellness Webinar',
        slug: 'drishti-individual-webinar',
        subtitle: 'One-on-one online wellness webinar — the first step of Art with Awakening',
        description: 'Online individual wellness webinar acting as the first step of Art with Awakening. Discover how art and mindfulness intersect for personal well-being.',
        longDescription: 'Drishti (Vision) Individual Wellness Webinar is a personalized online session designed to introduce participants to the transformative power of art combined with mindfulness. This one-day webinar helps individuals discover their creative potential while learning techniques for stress relief and mental clarity.',
        category: 'drishti',
        programType: 'Drishti',
        duration: '1 Day',
        format: 'online',
        isSponsored: false,
        price: 999,
        isFree: false,
        level: 'all',
        featured: true,
        isPublished: true,
        image: '/images/drishti_individual.png',
        modules: [
            {
                title: 'Introduction to Art & Wellness',
                isActive: true,
                sessions: [
                    { title: 'Welcome & Intention Setting', type: 'live-recording', duration: '15 min' },
                    { title: 'Mindful Art Practice', type: 'creation', duration: '30 min' },
                    { title: 'Reflection & Integration', type: 'application', duration: '15 min' },
                ],
                liveRecordings: [
                    { title: 'Drishti Individual Webinar Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '60 min' },
                ],
            },
        ],
        outcomes: ['Introduction to mindful art practice', 'Personal wellness toolkit', 'Certificate of participation'],
        instructor: { name: 'Adyom Foundation', bio: 'The Adyom Foundation team dedicated to art, mindfulness, and holistic wellness.' },
    },
    {
        title: 'Drishti: Corporate Workshop',
        slug: 'drishti-corporate-workshop',
        subtitle: 'Exclusive mindfulness and heritage art workshop for corporate teams',
        description: 'Exclusive mindfulness and heritage art workshop designed for corporate teams and small businesses. Boost creativity and team cohesion.',
        longDescription: 'Drishti Corporate Workshop brings the healing power of art and mindfulness to the workplace. Designed for teams of all sizes, this workshop helps reduce stress, improve focus, and foster creative collaboration through guided heritage art exercises.',
        category: 'drishti',
        programType: 'Drishti',
        duration: '1 Day',
        format: 'hybrid',
        isSponsored: false,
        price: 0,
        isFree: false,
        level: 'all',
        featured: true,
        isPublished: true,
        image: '/images/drishti_corporate.png',
        modules: [
            {
                title: 'Corporate Art & Mindfulness Session',
                isActive: true,
                sessions: [
                    { title: 'Team Building Through Art', type: 'live-recording', duration: '20 min' },
                    { title: 'Collaborative Art Creation', type: 'creation', duration: '30 min' },
                    { title: 'Reflection & Group Sharing', type: 'application', duration: '10 min' },
                ],
                liveRecordings: [
                    { title: 'Corporate Workshop Sample Recording', videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4', duration: '60 min' },
                ],
            },
        ],
        outcomes: ['Team cohesion through art', 'Stress reduction techniques', 'Creative problem-solving skills', 'Corporate wellness certificate'],
        instructor: { name: 'Adyom Foundation', bio: 'The Adyom Foundation team dedicated to art, mindfulness, and holistic wellness.' },
    },
    {
        title: 'Drishti: School Workshop',
        slug: 'drishti-school-workshop',
        subtitle: 'Mindfulness and wellness workshop exclusively designed for students and educators',
        description: 'Mindfulness and wellness workshop exclusively designed for students and educators. Discover the joy of art and its calming effects.',
        longDescription: 'Drishti School Workshop is specially crafted for educational institutions. It introduces students and teachers to the therapeutic benefits of heritage art, helping them develop focus, creativity, and emotional well-being through hands-on art activities.',
        category: 'drishti',
        programType: 'Drishti',
        duration: '1 Day',
        format: 'hybrid',
        isSponsored: false,
        price: 0,
        isFree: false,
        level: 'all',
        featured: true,
        isPublished: true,
        image: '/images/drishti_school.png',
        modules: [
            {
                title: 'School Art & Wellness Session',
                isActive: true,
                sessions: [
                    { title: 'Introduction to Art & Mindfulness', type: 'live-recording', duration: '20 min' },
                    { title: 'Hands-On Art Activity', type: 'creation', duration: '30 min' },
                    { title: 'Sharing & Reflection Circle', type: 'application', duration: '10 min' },
                ],
                liveRecordings: [
                    { title: 'School Workshop Recording', videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4', duration: '60 min' },
                ],
            },
        ],
        outcomes: ['Introduction to heritage art', 'Mindfulness for academic focus', 'Creative expression skills', 'Participation certificate'],
        instructor: { name: 'Adyom Foundation', bio: 'The Adyom Foundation team dedicated to art, mindfulness, and holistic wellness.' },
    },
    // ── Existing Programs ────────────────────────────────────────────────────
    {
        title: 'KalaPath — Online Art Learning',
        slug: 'kalapath-online',
        subtitle: 'Master Indian heritage art forms through guided video lessons',
        description: 'An online program covering multiple Indian art forms with video tutorials, assignments, and certification.',
        longDescription: 'KalaPath is a comprehensive online learning journey through the rich traditions of Indian heritage art. Students progress through structured modules, submit artwork for review, and earn certificates upon completion.',
        category: 'kala-path',
        programType: 'KalaPath',
        duration: '12 weeks',
        format: 'online',
        isSponsored: false,
        price: 1500,
        isFree: false,
        level: 'beginner',
        featured: true,
        isPublished: true,
        image: '/images/gallery_kolam_art.png',
        maxActiveModules: 7,
        modules: [
            {
                title: 'Module 1: Gond Art', artFormName: 'Gond Art', artFormType: 'tribal', order: 1,
                description: 'Discover the intricate dot-based painting tradition of the Gond tribe from Madhya Pradesh.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Introduction to Gond Patterns', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Animal Motifs in Gond', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Tree of Life Composition', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Advanced Gond Storytelling', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Gond on Coasters (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Gond on Fridge Magnets (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Gond Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 2: Warli Art', artFormName: 'Warli Art', artFormType: 'tribal', order: 2,
                description: 'Explore the minimalist geometric art of the Warli tribe from Maharashtra.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Basic Warli Shapes', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Human Figures in Warli', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Warli Village Scenes', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Tarpa Dance Composition', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Warli on Wooden Trays (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Warli Wall Art (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Warli Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 3: Madhubani Art', artFormName: 'Madhubani Art', artFormType: 'folk', order: 3,
                description: 'Learn the vibrant double-line painting tradition from Mithila, Bihar.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Madhubani Border Patterns', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Nature Motifs in Madhubani', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: God & Goddess Depictions', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Wedding Scene (Kohbar)', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Madhubani on Fabric (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Madhubani on Ceramic (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Madhubani Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 4: Pattachitra Art', artFormName: 'Pattachitra Art', artFormType: 'folk', order: 4,
                description: 'Master the intricate scroll painting tradition from Odisha.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Introduction to Pattachitra', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Intricate Borders', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Deity Portraits', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Full Scroll Composition', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Pattachitra on Bookmarks (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Pattachitra on Canvas (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Pattachitra Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 5: Sohrai Art', artFormName: 'Sohrai Art', artFormType: 'tribal', order: 5,
                description: 'Discover the harvest festival wall painting tradition from Jharkhand.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Earth Colors and Mud Base', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Natural Motifs and Patterns', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Animal Depictions in Sohrai', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Harvest Celebration Scenes', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Sohrai on Earthen Pots (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Sohrai on Wall Panels (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Sohrai Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 6: Kalamkari Art', artFormName: 'Kalamkari Art', artFormType: 'folk', order: 6,
                description: 'Learn the pen-drawn textile art tradition from Andhra Pradesh.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: The Kalamkari Pen Techniques', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Floral and Vine Patterns', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Mythological Figures', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Detailed Scene Composition', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Kalamkari on Tote Bags (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Kalamkari on Cushion Covers (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Kalamkari Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 7: Phad Painting', artFormName: 'Phad Painting', artFormType: 'folk', order: 7,
                description: 'Explore the scroll painting tradition from Rajasthan depicting folk deities.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Understanding Phad Layouts', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Character Construction', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Adding Colors and Details', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Completing a Scene', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Phad on Paper Banners (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Phad on Wooden Plaques (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Phad Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 8: Pichwai Art', artFormName: 'Pichwai Art', artFormType: 'folk', order: 8,
                description: 'Learn the intricate backdrop paintings originating from Nathdwara, Rajasthan.',
                isActive: false, isLocked: true,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Lotus and Cow Motifs', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Background Construction', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Shrinathji Depiction', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Golden Detailing', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Pichwai on Canvas (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Pichwai Wall Hangings (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Pichwai Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 9: Cheriyal Scroll Painting', artFormName: 'Cheriyal Scroll', artFormType: 'folk', order: 9,
                description: 'Discover the storytelling scroll art from Telangana.',
                isActive: false, isLocked: true,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Introduction to Cheriyal Formats', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Figures and Costumes', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Village Narratives', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Elaborate Borders', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Cheriyal on Plates (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Cheriyal Mini Scrolls (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Cheriyal Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 10: Kalighat Painting', artFormName: 'Kalighat Painting', artFormType: 'folk', order: 10,
                description: 'Explore the bold, sweeping brushstroke art from Bengal.',
                isActive: false, isLocked: true,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Bold Outlines and Sweeping Curves', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Shading and Volume', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Mythological Subjects', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Everyday Life Scenes', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Kalighat on Postcards (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Kalighat on Framed Canvas (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Kalighat Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
        ],
        outcomes: ['Master 5+ Indian art forms', 'Create a portfolio of 9 artworks', 'Earn a completion certificate'],
        instructor: { name: 'Sujata Das', bio: 'Master artist with 20+ years of experience in Indian folk art.' },
    },
    {
        title: 'Pratibimb — 41-Day Sadhana',
        slug: 'pratibimb-sadhana',
        subtitle: 'A 41-day reflective art practice journey',
        description: 'Daily art practice combined with mindfulness and self-reflection over 41 days.',
        longDescription: 'Pratibimb (Reflection) is a transformative 41-day journey where participants create daily artwork while practicing mindfulness. Each day builds upon the last, creating a powerful habit of creative expression.',
        category: 'pratibimb',
        programType: 'Pratibimb',
        duration: '41 days',
        format: 'hybrid',
        isSponsored: false,
        price: 0,
        isFree: true,
        level: 'all',
        featured: true,
        isPublished: true,
        image: '/images/philosophy_culture.png',
        modules: [
            {
                title: 'Week 1-2: Foundation',
                isActive: true,
                sessions: [
                    { title: 'Day 1-7: Introduction to Mindful Art', type: 'creation', duration: '30 min' },
                    { title: 'Day 8-14: Building the Practice', type: 'creation', duration: '30 min' },
                ],
                liveRecordings: [
                    { title: 'Foundation Week - Live Session', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '30 min' },
                ],
            },
            {
                title: 'Week 3-4: Deepening',
                isActive: true,
                sessions: [
                    { title: 'Day 15-21: Exploring Emotions Through Art', type: 'creation', duration: '30 min' },
                    { title: 'Day 22-28: Nature & Creativity', type: 'creation', duration: '30 min' },
                ],
                liveRecordings: [
                    { title: 'Deepening Week - Live Session', videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4', duration: '30 min' },
                ],
            },
            {
                title: 'Week 5-6: Integration',
                isActive: true,
                sessions: [
                    { title: 'Day 29-35: Personal Style Development', type: 'creation', duration: '30 min' },
                    { title: 'Day 36-41: Final Expression & Reflection', type: 'application', duration: '30 min' },
                ],
                liveRecordings: [
                    { title: 'Integration Week - Live Session', videoUrl: 'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4', duration: '30 min' },
                ],
            },
        ],
        outcomes: ['41 original artworks', 'Daily art practice habit', 'Completion certificate', 'Mindfulness through art'],
        instructor: { name: 'Anita Desai', bio: 'Art therapist and mindfulness practitioner specializing in creative expression.' },
    },
    {
        title: 'Chaitanya — Art for Consciousness',
        slug: 'chaitanya-consciousness',
        subtitle: '49-week journey into art as a path to higher consciousness',
        description: 'A year-long program exploring the intersection of art, consciousness, and spiritual growth through 7 Indian art forms.',
        longDescription: 'Chaitanya (Consciousness) is a 49-week immersive program that uses art as a vehicle for spiritual exploration and personal growth. Each of the 7 modules focuses on a specific Indian art form, blending traditional techniques with consciousness practices.',
        category: 'chaitanya',
        programType: 'Chaitanya',
        duration: '49 weeks',
        format: 'online',
        isSponsored: false,
        price: 0,
        isFree: true,
        level: 'intermediate',
        featured: false,
        isPublished: true,
        image: '/images/philosophy_mindfulness.png',
        maxActiveModules: 7,
        modules: [
            {
                title: 'Module 1: Gond Art', artFormName: 'Gond Art', artFormType: 'tribal', order: 1,
                description: 'Discover the intricate dot-based painting tradition of the Gond tribe from Madhya Pradesh.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Introduction to Gond Patterns', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Animal Motifs in Gond', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Tree of Life Composition', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Advanced Gond Storytelling', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Gond on Coasters (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Gond on Fridge Magnets (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Gond Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 2: Warli Art', artFormName: 'Warli Art', artFormType: 'tribal', order: 2,
                description: 'Explore the minimalist geometric art of the Warli tribe from Maharashtra.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Basic Warli Shapes', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Human Figures in Warli', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Warli Village Scenes', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Tarpa Dance Composition', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Warli on Wooden Trays (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Warli Wall Art (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Warli Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 3: Madhubani Art', artFormName: 'Madhubani Art', artFormType: 'folk', order: 3,
                description: 'Learn the vibrant double-line painting tradition from Mithila, Bihar.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Madhubani Border Patterns', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Nature Motifs in Madhubani', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: God & Goddess Depictions', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Wedding Scene (Kohbar)', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Madhubani on Fabric (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Madhubani on Ceramic (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Madhubani Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 4: Pattachitra Art', artFormName: 'Pattachitra Art', artFormType: 'folk', order: 4,
                description: 'Master the intricate scroll painting tradition from Odisha.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Introduction to Pattachitra', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Intricate Borders', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Deity Portraits', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Full Scroll Composition', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Pattachitra on Bookmarks (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Pattachitra on Canvas (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Pattachitra Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 5: Sohrai Art', artFormName: 'Sohrai Art', artFormType: 'tribal', order: 5,
                description: 'Discover the harvest festival wall painting tradition from Jharkhand.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Earth Colors and Mud Base', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Natural Motifs and Patterns', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Animal Depictions in Sohrai', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Harvest Celebration Scenes', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Sohrai on Earthen Pots (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Sohrai on Wall Panels (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Sohrai Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 6: Kalamkari Art', artFormName: 'Kalamkari Art', artFormType: 'folk', order: 6,
                description: 'Learn the pen-drawn textile art tradition from Andhra Pradesh.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: The Kalamkari Pen Techniques', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Floral and Vine Patterns', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Mythological Figures', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Detailed Scene Composition', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Kalamkari on Tote Bags (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Kalamkari on Cushion Covers (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Kalamkari Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 7: Phad Painting', artFormName: 'Phad Painting', artFormType: 'folk', order: 7,
                description: 'Explore the scroll painting tradition from Rajasthan depicting folk deities.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Understanding Phad Layouts', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Character Construction', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Adding Colors and Details', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Completing a Scene', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Phad on Paper Banners (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Phad on Wooden Plaques (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Phad Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 8: Pichwai Art', artFormName: 'Pichwai Art', artFormType: 'folk', order: 8,
                description: 'Learn the intricate backdrop paintings originating from Nathdwara, Rajasthan.',
                isActive: false, isLocked: true,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Lotus and Cow Motifs', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Background Construction', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Shrinathji Depiction', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Golden Detailing', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Pichwai on Canvas (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Pichwai Wall Hangings (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Pichwai Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 9: Cheriyal Scroll Painting', artFormName: 'Cheriyal Scroll', artFormType: 'folk', order: 9,
                description: 'Discover the storytelling scroll art from Telangana.',
                isActive: false, isLocked: true,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Introduction to Cheriyal Formats', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Figures and Costumes', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Village Narratives', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Elaborate Borders', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Cheriyal on Plates (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Cheriyal Mini Scrolls (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Cheriyal Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 10: Kalighat Painting', artFormName: 'Kalighat Painting', artFormType: 'folk', order: 10,
                description: 'Explore the bold, sweeping brushstroke art from Bengal.',
                isActive: false, isLocked: true,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Bold Outlines and Sweeping Curves', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Shading and Volume', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Mythological Subjects', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Everyday Life Scenes', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Kalighat on Postcards (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Kalighat on Framed Canvas (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Kalighat Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
        ],
        outcomes: ['Mastery of 7 Indian art forms', 'Deep understanding of art as spiritual practice', 'Portfolio of consciousness-inspired artwork', '49-week completion certificate'],
        instructor: { name: 'Dr. Meena Iyer', bio: 'Scholar of Indian aesthetics and classical music with 30 years of teaching experience.' },
    },
    {
        title: 'Sparsh — Touch of Art',
        slug: 'sparsh-touch',
        subtitle: '49-week program exploring tactile art forms and craft traditions',
        description: 'A hands-on journey through India\'s textile, sculpture, and craft traditions via 7 art forms.',
        longDescription: 'Sparsh (Touch) is a 49-week program focused on tactile art forms — textiles, sculpture, pottery, and crafts. Each of the 7 modules explores a different Indian art form through hands-on creation.',
        category: 'sparsh',
        programType: 'Sparsh',
        duration: '49 weeks',
        format: 'hybrid',
        isSponsored: false,
        price: 0,
        isFree: true,
        level: 'all',
        featured: false,
        isPublished: true,
        image: '/images/hero_artisan.png',
        maxActiveModules: 7,
        modules: [
            {
                title: 'Module 1: Gond Art', artFormName: 'Gond Art', artFormType: 'tribal', order: 1,
                description: 'Discover the intricate dot-based painting tradition of the Gond tribe from Madhya Pradesh.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Introduction to Gond Patterns', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Animal Motifs in Gond', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Tree of Life Composition', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Advanced Gond Storytelling', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Gond on Coasters (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Gond on Fridge Magnets (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Gond Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 2: Warli Art', artFormName: 'Warli Art', artFormType: 'tribal', order: 2,
                description: 'Explore the minimalist geometric art of the Warli tribe from Maharashtra.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Basic Warli Shapes', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Human Figures in Warli', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Warli Village Scenes', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Tarpa Dance Composition', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Warli on Wooden Trays (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Warli Wall Art (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Warli Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 3: Madhubani Art', artFormName: 'Madhubani Art', artFormType: 'folk', order: 3,
                description: 'Learn the vibrant double-line painting tradition from Mithila, Bihar.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Madhubani Border Patterns', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Nature Motifs in Madhubani', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: God & Goddess Depictions', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Wedding Scene (Kohbar)', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Madhubani on Fabric (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Madhubani on Ceramic (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Madhubani Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 4: Pattachitra Art', artFormName: 'Pattachitra Art', artFormType: 'folk', order: 4,
                description: 'Master the intricate scroll painting tradition from Odisha.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Introduction to Pattachitra', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Intricate Borders', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Deity Portraits', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Full Scroll Composition', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Pattachitra on Bookmarks (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Pattachitra on Canvas (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Pattachitra Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 5: Sohrai Art', artFormName: 'Sohrai Art', artFormType: 'tribal', order: 5,
                description: 'Discover the harvest festival wall painting tradition from Jharkhand.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Earth Colors and Mud Base', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Natural Motifs and Patterns', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Animal Depictions in Sohrai', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Harvest Celebration Scenes', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Sohrai on Earthen Pots (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Sohrai on Wall Panels (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Sohrai Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 6: Kalamkari Art', artFormName: 'Kalamkari Art', artFormType: 'folk', order: 6,
                description: 'Learn the pen-drawn textile art tradition from Andhra Pradesh.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: The Kalamkari Pen Techniques', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Floral and Vine Patterns', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Mythological Figures', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Detailed Scene Composition', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Kalamkari on Tote Bags (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Kalamkari on Cushion Covers (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Kalamkari Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 7: Phad Painting', artFormName: 'Phad Painting', artFormType: 'folk', order: 7,
                description: 'Explore the scroll painting tradition from Rajasthan depicting folk deities.',
                isActive: true, isLocked: false,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Understanding Phad Layouts', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Character Construction', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Adding Colors and Details', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Completing a Scene', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Phad on Paper Banners (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Phad on Wooden Plaques (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Phad Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 8: Pichwai Art', artFormName: 'Pichwai Art', artFormType: 'folk', order: 8,
                description: 'Learn the intricate backdrop paintings originating from Nathdwara, Rajasthan.',
                isActive: false, isLocked: true,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Lotus and Cow Motifs', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Background Construction', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Shrinathji Depiction', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Golden Detailing', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Pichwai on Canvas (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Pichwai Wall Hangings (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Pichwai Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 9: Cheriyal Scroll Painting', artFormName: 'Cheriyal Scroll', artFormType: 'folk', order: 9,
                description: 'Discover the storytelling scroll art from Telangana.',
                isActive: false, isLocked: true,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Introduction to Cheriyal Formats', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Figures and Costumes', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Village Narratives', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Elaborate Borders', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Cheriyal on Plates (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Cheriyal Mini Scrolls (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Cheriyal Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
            {
                title: 'Module 10: Kalighat Painting', artFormName: 'Kalighat Painting', artFormType: 'folk', order: 10,
                description: 'Explore the bold, sweeping brushstroke art from Bengal.',
                isActive: false, isLocked: true,
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Bold Outlines and Sweeping Curves', type: 'creation', duration: '45 min', sessionNumber: 1, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Shading and Volume', type: 'creation', duration: '45 min', sessionNumber: 2, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Mythological Subjects', type: 'creation', duration: '45 min', sessionNumber: 3, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 4: Everyday Life Scenes', type: 'creation', duration: '45 min', sessionNumber: 4, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 5: Kalighat on Postcards (Application)', type: 'application', duration: '45 min', sessionNumber: 5, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 6: Kalighat on Framed Canvas (Application)', type: 'application', duration: '45 min', sessionNumber: 6, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                ],
                liveRecordings: [
                    { title: 'Kalighat Live Session Recording', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '45 min' },
                ],
            },
        ],
        outcomes: ['Mastery of 7 craft traditions', 'Physical portfolio of crafted items', '49-week completion certificate', 'Hands-on experience with traditional techniques'],
        instructor: { name: 'Lakshmi Rao', bio: 'Master textile artist and craft researcher with 25 years of field experience.' },
    },
    {
        title: 'KalaVritti — Art Marketplace & Skill Building',
        slug: 'kalavritti-marketplace',
        subtitle: 'Skill building program and art marketplace for underprivileged girls',
        description: 'Applied or Commercial Art training with a platform to sell products (online & offline).',
        longDescription: 'KalaVritti features a Skill building Program — offline (for groups) or Online (6 months). Participants learn applied art and business fundamentals, and their creations are sold by Adyom online.',
        category: 'kala-vritti',
        programType: 'KalaVritti',
        duration: '6 Months (Online) or Flexible (Offline)',
        format: 'hybrid',
        isSponsored: false,
        price: 0,
        isFree: true,
        level: 'all',
        featured: true,
        isPublished: true,
        image: '/images/philosophy_community.png',
        modules: [
            {
                title: 'Fundamentals',
                isActive: true,
                isLocked: false,
                materialListUrl: 'https://example.com/fundamentals-material-list.pdf',
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Introduction to Applied Art', type: 'creation', duration: '45 min', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Product Design Basics', type: 'creation', duration: '45 min', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Practical Application', type: 'application', duration: '60 min', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
                ]
            },
            {
                title: 'Business',
                isActive: true,
                isLocked: false,
                materialListUrl: 'https://example.com/business-material-list.pdf',
                fundamentalsVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                sessions: [
                    { title: 'Session 1: Pricing and Marketing', type: 'live-recording', duration: '45 min', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 2: Setting up an Online Store', type: 'creation', duration: '45 min', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                    { title: 'Session 3: Fulfilling Orders', type: 'application', duration: '60 min', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
                ]
            }
        ],
        outcomes: ['Learn Fundamentals of Commercial Art', 'Understand Art Business Basics', 'Sell your artwork online'],
        instructor: { name: 'Adyom Team', bio: 'The Adyom Foundation team supporting artists in their professional journey.' },
    },
];

// ─── Learning Items (with video URLs) ────────────────────────────────────────
const LEARNING_ITEMS = [
    {
        title: 'Madhubani Painting Techniques',
        type: 'video',
        category: 'folk-art',
        content: 'Learn the ancient art of Madhubani painting from basic patterns to complex compositions.',
        videoUrl: SAMPLE_VIDEOS[0].url,
        thumbnail: SAMPLE_VIDEOS[0].thumbnail,
        duration: '45 min',
        featured: true,
        order: 1,
        tags: ['madhubani', 'folk-art', 'painting', 'beginner'],
    },
    {
        title: 'Color Theory for Heritage Art',
        type: 'article',
        category: 'heritage',
        content: 'Understanding color palettes used in traditional Indian art forms and how to apply them in your own work. This comprehensive guide covers natural dye sources, mineral pigments, and the symbolic meanings of colors in Indian culture.',
        duration: '20 min read',
        featured: true,
        order: 2,
        tags: ['color-theory', 'heritage', 'painting', 'beginner'],
    },
    {
        title: 'Mindful Drawing Practices',
        type: 'video',
        category: 'mindfulness',
        content: 'Combine meditation and drawing for a holistic creative practice.',
        videoUrl: SAMPLE_VIDEOS[1].url,
        thumbnail: SAMPLE_VIDEOS[1].thumbnail,
        duration: '30 min',
        featured: true,
        order: 3,
        tags: ['mindfulness', 'meditation', 'drawing', 'wellness'],
    },
    {
        title: 'Warli Art: From Walls to Canvas',
        type: 'guide',
        category: 'tribal-art',
        content: 'Transform traditional Warli wall art into contemporary canvas compositions. This step-by-step guide covers the history, symbolism, and techniques of Warli painting.',
        duration: '2 hours',
        featured: false,
        order: 4,
        tags: ['warli', 'tribal-art', 'painting', 'intermediate'],
    },
    {
        title: 'Raga & Color: Music-Inspired Art',
        type: 'video',
        category: 'creativity',
        content: 'Explore the connection between Indian classical music ragas and color expression.',
        videoUrl: SAMPLE_VIDEOS[5].url,
        thumbnail: SAMPLE_VIDEOS[5].thumbnail,
        duration: '60 min',
        featured: false,
        order: 5,
        tags: ['raga', 'music', 'color', 'advanced'],
    },
    {
        title: 'Kalamkari: Storytelling Through Textile',
        type: 'guide',
        category: 'heritage',
        content: 'Master the art of Kalamkari textile painting with traditional narrative techniques. Learn about natural dyes, the kalam (pen), and the storytelling traditions of Andhra Pradesh.',
        duration: '3 hours',
        featured: false,
        order: 6,
        tags: ['kalamkari', 'textile', 'storytelling', 'advanced'],
    },
    {
        title: 'Miniature Painting Basics',
        type: 'article',
        category: 'heritage',
        content: 'Introduction to the delicate world of Indian miniature painting traditions. Explore the Mughal, Rajput, and Pahari schools of miniature art.',
        duration: '15 min read',
        featured: false,
        order: 7,
        tags: ['miniature', 'painting', 'heritage', 'beginner'],
    },
    {
        title: 'Art Therapy for Self-Expression',
        type: 'video',
        category: 'mindfulness',
        content: 'Use art as a therapeutic tool for emotional expression and healing.',
        videoUrl: SAMPLE_VIDEOS[4].url,
        thumbnail: SAMPLE_VIDEOS[4].thumbnail,
        duration: '25 min',
        featured: true,
        order: 8,
        tags: ['art-therapy', 'healing', 'self-expression', 'wellness'],
    },
    {
        title: 'Gond Art: Nature & Mythology',
        type: 'video',
        category: 'tribal-art',
        content: 'Discover the vibrant world of Gond art from Madhya Pradesh. Learn about the distinctive dot patterns, nature motifs, and mythological themes.',
        videoUrl: SAMPLE_VIDEOS[2].url,
        thumbnail: SAMPLE_VIDEOS[2].thumbnail,
        duration: '40 min',
        featured: false,
        order: 9,
        tags: ['gond', 'tribal-art', 'nature', 'mythology'],
    },
    {
        title: 'Kolam & Rangoli: Sacred Geometry',
        type: 'video',
        category: 'folk-art',
        content: 'Learn the sacred geometric patterns of Kolam and Rangoli. Understand the mathematical principles and spiritual significance behind these daily art practices.',
        videoUrl: SAMPLE_VIDEOS[3].url,
        thumbnail: SAMPLE_VIDEOS[3].thumbnail,
        duration: '35 min',
        featured: false,
        order: 10,
        tags: ['kolam', 'rangoli', 'geometry', 'sacred-art'],
    },
    {
        title: 'Sohrai & Khovar: Harvest Art',
        type: 'video',
        category: 'tribal-art',
        content: 'Explore the harvest festival art traditions of Sohrai and Khovar from Jharkhand. These mural traditions use natural pigments and celebrate the agricultural cycle.',
        videoUrl: SAMPLE_VIDEOS[6].url,
        thumbnail: SAMPLE_VIDEOS[6].thumbnail,
        duration: '50 min',
        featured: false,
        order: 11,
        tags: ['sohrai', 'khovar', 'mural', 'harvest'],
    },
    {
        title: 'The Philosophy of Indian Art',
        type: 'video',
        category: 'heritage',
        content: 'A deep dive into the philosophical foundations of Indian art — rasa theory, dhvani, and the concept of the artist as a sadhaka (spiritual practitioner).',
        videoUrl: SAMPLE_VIDEOS[7].url,
        thumbnail: SAMPLE_VIDEOS[7].thumbnail,
        duration: '55 min',
        featured: false,
        order: 12,
        tags: ['philosophy', 'rasa', 'aesthetics', 'theory'],
    },
];

// ─── Sample Products for KalaVritti ──────────────────────────────────────────
const PRODUCTS = [
    {
        title: 'Hand-Painted Madhubani Canvas',
        description: 'A vibrant Madhubani painting on canvas, depicting the Tree of Life with traditional motifs. Created using natural dyes and acrylic paints.',
        price: 2500,
        currency: 'INR',
        compareAtPrice: 3500,
        category: 'painting',
        artForm: 'Madhubani',
        status: 'available',
        isPublished: true,
        featured: true,
        quantity: 1,
        dimensions: { width: 24, height: 18, unit: 'in' },
        tags: ['madhubani', 'canvas', 'tree-of-life', 'folk-art'],
    },
    {
        title: 'Warli Art Wall Hanging',
        description: 'Traditional Warli art on handmade paper, framed and ready to hang. Depicts a village wedding scene with intricate stick-figure patterns.',
        price: 1800,
        currency: 'INR',
        compareAtPrice: 2500,
        category: 'painting',
        artForm: 'Warli',
        status: 'available',
        isPublished: true,
        featured: true,
        quantity: 2,
        dimensions: { width: 18, height: 12, unit: 'in' },
        tags: ['warli', 'wall-hanging', 'wedding', 'tribal-art'],
    },
    {
        title: 'Kalamkari Hand-Painted Dupatta',
        description: 'A stunning hand-painted Kalamkari dupatta featuring the Tree of Life and peacock motifs. Made on pure cotton using natural vegetable dyes.',
        price: 3200,
        currency: 'INR',
        category: 'textile',
        artForm: 'Kalamkari',
        status: 'available',
        isPublished: true,
        featured: true,
        quantity: 3,
        dimensions: { width: 90, height: 200, unit: 'cm' },
        tags: ['kalamkari', 'dupatta', 'textile', 'hand-painted'],
    },
    {
        title: 'Gond Art Story Panel',
        description: 'A large Gond art panel telling the story of creation through intricate dot patterns and vibrant colors. Painted by a master Gond artist.',
        price: 4500,
        currency: 'INR',
        compareAtPrice: 6000,
        category: 'painting',
        artForm: 'Gond',
        status: 'reserved',
        isPublished: true,
        featured: false,
        quantity: 1,
        dimensions: { width: 36, height: 24, unit: 'in' },
        tags: ['gond', 'story-panel', 'creation-myth', 'tribal-art'],
    },
    {
        title: 'Miniature Painting — Radha Krishna',
        description: 'Exquisite miniature painting in the Kishangarh style, depicting Radha and Krishna in a moonlit garden. Painted with squirrel-hair brushes.',
        price: 8500,
        currency: 'INR',
        compareAtPrice: 12000,
        category: 'painting',
        artForm: 'Miniature',
        status: 'available',
        isPublished: true,
        featured: true,
        quantity: 1,
        dimensions: { width: 8, height: 6, unit: 'in' },
        tags: ['miniature', 'radha-krishna', 'kishangarh', 'fine-art'],
    },
    {
        title: 'Terracotta Sculpture — Ganesha',
        description: 'Hand-molded terracotta Ganesha idol, crafted using traditional techniques. Perfect for home altar or decorative display.',
        price: 1500,
        currency: 'INR',
        category: 'pottery',
        artForm: 'Terracotta',
        status: 'available',
        isPublished: true,
        featured: false,
        quantity: 5,
        dimensions: { width: 10, height: 6, unit: 'in' },
        weight: 1.2,
        tags: ['terracotta', 'ganesha', 'sculpture', 'clay'],
    },
];

// ─── Main Seed Function ──────────────────────────────────────────────────────
async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to: ${mongoose.connection.host}`);

        // 1. Create admin user if not exists
        let adminUser = await User.findOne({ email: 'admin@adyom.org' });
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash('admin123', 12);
            adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@adyom.org',
                password: hashedPassword,
                role: 'admin',
                isEmailVerified: true,
                isActive: true,
                bio: 'Adyom Foundation platform administrator.',
            });
            console.log(`✅ Admin user created: admin@adyom.org / admin123`);
        } else {
            console.log(`ℹ️  Admin user already exists: ${adminUser.email}`);
        }

        // 2. Create a test member if not exists
        let memberUser = await User.findOne({ email: 'member@adyom.org' });
        if (!memberUser) {
            const hashedPassword = await bcrypt.hash('member123', 12);
            memberUser = await User.create({
                name: 'Test Member',
                email: 'member@adyom.org',
                password: hashedPassword,
                role: 'member',
                isEmailVerified: true,
                isActive: true,
                bio: 'A passionate art learner and practitioner.',
            });
            console.log(`✅ Member user created: member@adyom.org / member123`);
        } else {
            console.log(`ℹ️  Member user already exists: ${memberUser.email}`);
        }

        // 3. Seed programs (clear first for fresh slugs)
        await Program.deleteMany({});
        const createdPrograms = {};
        for (const prog of PROGRAMS) {
            const created = await Program.create(prog);
            createdPrograms[created.slug] = created;
            console.log(`  ➕ Program: ${prog.title} (${created._id})`);
        }
        console.log(`✅ Programs: ${Object.keys(createdPrograms).length} created`);

        // 3b. Enroll test member in Chaitanya and Sparsh programs
        const chaitanyaSlug = 'chaitanya-art-for-consciousness';
        const sparshSlug = 'sparsh-touch-of-art';
        const chaitanyaProg = createdPrograms[chaitanyaSlug];
        const sparshProg = createdPrograms[sparshSlug];

        // Enroll test member in Chaitanya and Sparsh using findOneAndUpdate
        const enrollments = [];
        if (chaitanyaProg) {
            enrollments.push({
                program: chaitanyaProg._id,
                status: 'active',
                progress: 0,
            });
        }
        if (sparshProg) {
            enrollments.push({
                program: sparshProg._id,
                status: 'active',
                progress: 0,
            });
        }
        if (enrollments.length > 0) {
            const updated = await User.findOneAndUpdate(
                { email: 'member@adyom.org' },
                { $set: { enrolledPrograms: enrollments } },
                { new: true }
            );
            if (updated) {
                console.log(`✅ Member enrolled in ${enrollments.length} program(s) (IDs: ${enrollments.map(e => e.program).join(', ')})`);
            } else {
                console.log(`ℹ️  Member already has enrollments, skipping`);
            }
        }

        // 4. Seed learning items
        await Learning.deleteMany({}); // Clear and re-seed for fresh data
        let learningCount = 0;
        for (const item of LEARNING_ITEMS) {
            await Learning.create({
                ...item,
                author: adminUser._id,
                authorName: adminUser.name,
                isPublished: true,
            });
            learningCount++;
        }
        console.log(`✅ Learning items: ${learningCount} created (${learningCount - 8} new with video URLs)`);

        // 5. Seed sample videos (for the Videos gallery)
        const existingVideos = await Video.countDocuments();
        if (existingVideos === 0) {
            let videoCount = 0;
            for (const vid of SAMPLE_VIDEOS) {
                await Video.create({
                    title: vid.title,
                    description: `Sample video: ${vid.title}. A test video for the Adyom Foundation platform.`,
                    url: vid.url,
                    platform: 'other',
                    thumbnail: vid.thumbnail,
                    duration: '2-5 min',
                    submittedBy: adminUser._id,
                    submitterName: adminUser.name,
                    category: 'tutorial',
                    status: 'approved',
                    isPublic: true,
                    reviewedBy: adminUser._id,
                    reviewedAt: new Date(),
                });
                videoCount++;
            }
            console.log(`✅ Videos: ${videoCount} sample videos created`);
        } else {
            console.log(`ℹ️  Videos: ${existingVideos} already exist, skipping`);
        }

        // 6. Seed products for KalaVritti
        const existingProducts = await Product.countDocuments();
        if (existingProducts === 0) {
            let productCount = 0;
            for (const prod of PRODUCTS) {
                await Product.create({
                    ...prod,
                    seller: adminUser._id,
                    sellerName: adminUser.name,
                });
                productCount++;
            }
            console.log(`✅ Products: ${productCount} created for KalaVritti marketplace`);
        } else {
            console.log(`ℹ️  Products: ${existingProducts} already exist, skipping`);
        }

        // 7. Seed sponsor codes
        const existingCodes = await SponsorCode.countDocuments();
        if (existingCodes === 0) {
            const programs = await Program.find({}).limit(3);
            if (programs.length > 0) {
                await SponsorCode.create({
                    code: 'ADYOM-FREE-2026',
                    program: programs[0]._id,
                    organization: 'Adyom Foundation',
                    description: 'Free enrollment for KalaPath online program',
                    maxUses: 100,
                    isActive: true,
                    createdBy: adminUser._id,
                });
                await SponsorCode.create({
                    code: 'ART-CORP-2026',
                    program: programs[1]?._id || programs[0]._id,
                    organization: 'ArtCorp India',
                    description: 'Corporate-sponsored enrollment code',
                    maxUses: 50,
                    isActive: true,
                    createdBy: adminUser._id,
                });
                console.log('✅ Sponsor codes: 2 created (ADYOM-FREE-2026, ART-CORP-2026)');
            }
        } else {
            console.log(`ℹ️  Sponsor codes: ${existingCodes} already exist, skipping`);
        }

        console.log('\n🎉 Seed complete! Summary:');
        console.log('──────────────────────────────────────────────');
        console.log('  Admin login:    admin@adyom.org / admin123');
        console.log('  Member login:   member@adyom.org / member123');
        console.log(`  Programs:       ${PROGRAMS.length}`);
        console.log(`  Learning items: ${LEARNING_ITEMS.length} (8 with video URLs)`);
        console.log(`  Sample videos:  ${SAMPLE_VIDEOS.length}`);
        console.log(`  Products:       ${PRODUCTS.length}`);
        console.log('──────────────────────────────────────────────');
        console.log('\nRoutes to test:');
        console.log('  GET  /api/learning          — All learning items');
        console.log('  GET  /api/programs          — All programs');
        console.log('  GET  /api/products          — KalaVritti marketplace');
        console.log('  POST /api/sponsors/validate — Validate sponsor code');
        console.log('  POST /api/learning/video-progress — Track video progress');
        console.log('  GET  /api/dashboard/attendance/:programId — Get attendance');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

seed();