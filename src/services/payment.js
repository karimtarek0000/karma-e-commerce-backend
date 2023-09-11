import Stripe from 'stripe';

export const paymentIntegration = async ({
  payment_method_types,
  mode,
  customer_email = '',
  metadata = {},
  discounts = [],
  line_items,
  success_url,
  cancel_url,
}) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const paymentData = await stripe.checkout.sessions.create({
    payment_method_types, //* Types for payment like.. [card] - paypal ...etc.
    mode, //* payment - subscription
    customer_email, // Email user
    metadata, // If you need save some data about order
    discounts, // If you need apply coupon pass as array
    line_items, //* All details items your purchased
    success_url, //*
    cancel_url, //*
  });

  return paymentData;
};
