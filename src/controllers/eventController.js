const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, featured } = req.query;
        const query = { isPublished: true };
        if (category) query.category = category;
        if (featured === 'true') query.featured = true;

        const total = await Event.countDocuments(query);
        const events = await Event.find(query)
            .populate('organizer', 'name avatar')
            .sort({ date: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: events,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllEventsAdmin = async (req, res) => {
    try {
        const events = await Event.find().populate('organizer', 'name avatar').sort({ createdAt: -1 });
        res.json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'name avatar');
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        res.json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        req.body.organizer = req.user._id;
        const event = await Event.create(req.body);
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        res.json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        res.json({ success: true, message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        if (event.registeredUsers.includes(req.user._id)) {
            return res.status(400).json({ success: false, message: 'Already registered' });
        }

        if (event.currentAttendees >= event.maxAttendees) {
            return res.status(400).json({ success: false, message: 'Event is full' });
        }

        event.registeredUsers.push(req.user._id);
        event.currentAttendees += 1;
        await event.save();

        res.json({ success: true, data: event, message: 'Registered successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};