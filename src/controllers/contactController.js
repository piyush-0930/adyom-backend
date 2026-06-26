const Contact = require('../models/Contact');
const { sendContactReply } = require('../services/email');

exports.submitContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        const contact = await Contact.create({ name, email, phone, subject, message });

        // Send auto-reply
        try { await sendContactReply(contact); } catch (e) { console.error(e); }

        res.status(201).json({ success: true, data: contact, message: 'Thank you for contacting us!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllContacts = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query = {};
        if (status) query.status = status;

        const total = await Contact.countDocuments(query);
        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: contacts,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateContactStatus = async (req, res) => {
    try {
        const { status, replyNote } = req.body;
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status, replyNote, repliedBy: req.user._id },
            { new: true }
        );
        if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
        res.json({ success: true, data: contact });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
        res.json({ success: true, message: 'Contact deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};