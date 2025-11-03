import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51SEsIvBYDGzP3ZGsOqisKJa1bpEL8PF28o1HxpQUopzi9immZjglcyJRBNY655enURhZIYjrEsuEjIWxEucAyf4300PN51sYmy';
    console.log('🔍 [DEBUG] Loading Stripe with key:', publishableKey.substring(0, 20) + '...');
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export default getStripe;
