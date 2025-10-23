// Stripe Checkout Session API Route for Vite/React
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { doctorId, doctorName, parentName, parentEmail, appointmentDate, appointmentTime, concerns, amountCents, priceId } = req.body;

  if (!doctorId || !doctorName || !parentName || !parentEmail || !appointmentDate || !appointmentTime || !amountCents || !priceId) {
    return res.status(400).json({ error: 'Missing required fields for checkout session.' });
  }

  try {
    console.log('🔍 [DEBUG] Creating Stripe Checkout Session...', {
      doctorId, doctorName, parentName, parentEmail, appointmentDate, appointmentTime, amountCents, priceId
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/contact?status=cancelled`,
      customer_email: parentEmail,
      metadata: {
        doctor_id: doctorId,
        parent_name: parentName,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        doctor_name: doctorName,
        concerns: concerns,
        amount_cents: amountCents.toString(),
      },
    });

    console.log('✅ [SUCCESS] Stripe Checkout Session created:', session.id);

    res.status(200).json({ sessionId: session.id });
  } catch (error: any) {
    console.error('❌ [ERROR] Stripe Checkout Session creation failed:', error);
    res.status(500).json({ error: error.message });
  }
}