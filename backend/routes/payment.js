const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');
const Course = require('../models/Course');

router.post('/process', auth, async (req, res) => {
    try {
        const { amount, id, courseId } = req.body;
        console.log('Request body:', req.body);

        // Create payment intent with automatic confirmation
        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(amount),
            currency: 'usd',
            description: 'Course enrollment payment',
            payment_method: id,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            }
        });

        if (paymentIntent.status === 'succeeded') {
            await Course.findByIdAndUpdate(courseId, {
                $addToSet: { enrolledStudents: req.user.id }
            });
            
            res.json({
                success: true,
                message: 'Payment successful',
                payment: paymentIntent
            });
        } else {
            throw new Error('Payment failed');
        }
    } catch (error) {
        console.error('Payment error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Payment processing failed'
        });
    }
});

module.exports = router;
