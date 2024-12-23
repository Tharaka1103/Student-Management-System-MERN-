import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Box, Typography, Alert, Paper, CircularProgress, Stepper, Step, StepLabel } from '@mui/material';
import LockIcon from '@mui/material/Icon/Icon';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51QGKmxRxJtLBNKDwWPtjizTvHmgTznq02RsphVvRnMuNSqMuEGQAPVEQHvmxn8s4JXDurLxOVtHO9uD970zylHn100lAc98CWF');

const CheckoutForm = ({ course, handleEnrollment }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const coursePrice = 500;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
        });

        if (!error) {
            try {
                const token = localStorage.getItem('token');
                const { id } = paymentMethod;
                const response = await axios.post('http://localhost:5000/api/payment/process', {
                    amount: coursePrice,
                    id,
                    courseId: course._id
                }, {
                    headers: { 'x-auth-token': token }
                });

                if (response.data.success) {
                    setSuccess(true);
                    handleEnrollment();
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            } catch (error) {
                setError('Payment failed. Please try again.');
                console.error('Payment failed:', error);
            }
        } else {
            setError(error.message);
        }
        setLoading(false);
    };

    const steps = ['Course Selection', 'Payment Details', 'Confirmation'];

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, margin: 'auto', mt: 4 }}>
            <Stepper activeStep={1} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <form onSubmit={handleSubmit}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <LockIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h4" gutterBottom>
                        Secure Payment
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                        Complete your enrollment for {course.title}
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        Card Information
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <CardElement options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                    padding: '10px 0',
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                        }}/>
                    </Paper>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Payment successful! You are now enrolled in the course.
                    </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                        Total Amount:
                    </Typography>
                    <Typography variant="h6" color="primary">
                        ${coursePrice}
                    </Typography>
                </Box>

                <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth
                    size="large"
                    disabled={!stripe || loading}
                    sx={{ 
                        mt: 3, 
                        py: 1.5,
                        position: 'relative'
                    }}
                >
                    {loading ? (
                        <CircularProgress size={24} sx={{ position: 'absolute' }} />
                    ) : (
                        `Pay ${coursePrice}`
                    )}
                </Button>

                <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 2 }}>
                    Your payment is secured by Stripe
                </Typography>
            </form>
        </Paper>
    );
};

const PaymentForm = ({ course, handleEnrollment }) => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm course={course} handleEnrollment={handleEnrollment} />
        </Elements>
    );
};

export default PaymentForm;