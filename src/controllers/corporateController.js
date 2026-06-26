const CorporateLead = require('../models/CorporateLead');
const { sendCorporateLeadReply } = require('../services/email');

exports.submitLead = async (req, res) => {
    try {
        const { name, organization, email, phone, requirements, interest, budget, timeline } = req.body;

        const lead = await CorporateLead.create({ name, organization, email, phone, requirements, interest, budget, timeline });

        // Send auto-reply
        try { await sendCorporateLeadReply(lead); } catch (e) { console.error(e); }

        res.status(201).json({ success: true, data: lead, message: 'Thank you for your interest!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllLeads = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query = {};
        if (status) query.status = status;

        const total = await CorporateLead.countDocuments(query);
        const leads = await CorporateLead.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: leads,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLeadById = async (req, res) => {
    try {
        const lead = await CorporateLead.findById(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
        res.json({ success: true, data: lead });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateLeadStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const lead = await CorporateLead.findById(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

        lead.status = status;
        lead.assignedTo = req.user._id;
        if (note) {
            lead.notes.push({ addedBy: req.user._id, note });
        }
        await lead.save();

        res.json({ success: true, data: lead });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteLead = async (req, res) => {
    try {
        const lead = await CorporateLead.findByIdAndDelete(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
        res.json({ success: true, message: 'Lead deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};