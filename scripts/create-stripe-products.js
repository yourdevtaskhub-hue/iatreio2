import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const doctors = [
  {
    name: 'Dr. Anna Maria Fytrou',
    price: 13000, // €130.00 in cents
    description: 'Session with Dr. Anna Maria Fytrou - Child and Adolescent Psychiatrist & Psychotherapist'
  },
  {
    name: 'Ioanna',
    price: 8000, // €80.00 in cents
    description: 'Session with Ioanna - Child Psychologist & Psychotherapist'
  },
  {
    name: 'Sofia',
    price: 8000, // €80.00 in cents
    description: 'Session with Sofia - Child Psychologist & Psychotherapist'
  },
  {
    name: 'Eirini',
    price: 11000, // €110.00 in cents
    description: 'Session with Eirini - Clinical Child Psychologist & Psychotherapist'
  }
];

async function createStripeProducts() {
  console.log('🚀 Creating Stripe products for doctors...\n');

  for (const doctor of doctors) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: `Session with ${doctor.name}`,
        description: doctor.description,
        metadata: {
          doctor_name: doctor.name,
          doctor_type: 'session'
        }
      });

      console.log(`✅ Created product for ${doctor.name}: ${product.id}`);

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: doctor.price,
        currency: 'eur',
        metadata: {
          doctor_name: doctor.name
        }
      });

      console.log(`✅ Created price for ${doctor.name}: ${price.id} (€${(doctor.price / 100).toFixed(2)})`);

      // Save to database (you'll need to create a products table)
      console.log(`📝 Save these IDs to your database:`);
      console.log(`   Doctor: ${doctor.name}`);
      console.log(`   Product ID: ${product.id}`);
      console.log(`   Price ID: ${price.id}`);
      console.log('');

    } catch (error) {
      console.error(`❌ Error creating product for ${doctor.name}:`, error.message);
    }
  }

  console.log('🎉 Stripe products creation completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Save the Product IDs and Price IDs to your database');
  console.log('2. Update your Contact form to use these Price IDs');
  console.log('3. Test the integration with Stripe Checkout');
}

createStripeProducts().catch(console.error);
