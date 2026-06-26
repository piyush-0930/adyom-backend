const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Program = require('../models/Program');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

exports.createOrder = async (req, res) => {
    try {
        const { programId, moduleId } = req.body;

        // Verify program exists
        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        // Get amount (in INR rupees)
        let amount = program.price;
        if (amount <= 0) {
            return res.status(400).json({ success: false, message: 'This program is free, no payment needed' });
        }

        // Razorpay accepts amount in paise (multiply by 100)
        const amountInPaise = amount * 100;

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_${Date.now().toString().slice(-10)}_${req.user._id.toString().slice(-8)}`,
            notes: {
                programId: programId.toString(),
                moduleId: moduleId ? moduleId.toString() : '',
                userId: req.user._id.toString()
            }
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency
            }
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment order' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            programId,
            moduleId
        } = req.body;

        const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';

        // Verify signature
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        // Payment is verified. Now enroll the user.
        const user = await User.findById(req.user._id);
        const program = await Program.findById(programId);

        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        // Check if already enrolled in the program
        const alreadyEnrolled = user.enrolledPrograms.find(
            ep => ep.program.toString() === programId
        );

        if (alreadyEnrolled) {
            if (moduleId) {
                const alreadyEnrolledModule = alreadyEnrolled.enrolledModules.includes(moduleId);
                if (alreadyEnrolledModule) {
                    return res.status(400).json({ success: false, message: 'Already enrolled in this module' });
                }
                alreadyEnrolled.enrolledModules.push(moduleId);
                await user.save();
                return res.json({ success: true, message: 'Enrolled in module successfully', data: user });
            } else {
                return res.status(400).json({ success: false, message: 'Already enrolled in this program' });
            }
        }

        const newEnrollment = { program: programId, enrolledModules: [] };
        if (moduleId) {
            newEnrollment.enrolledModules.push(moduleId);
        }
        user.enrolledPrograms.push(newEnrollment);
        await user.save();

        program.currentEnrollments += 1;
        await program.save();

        res.json({ success: true, message: 'Payment verified & Enrolled successfully', data: user });

    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify payment' });
    }
};
