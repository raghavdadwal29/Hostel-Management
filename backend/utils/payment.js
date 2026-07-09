// Payment gateway helper. Uses Razorpay if keys are configured, otherwise
// falls back to a mock "instant success" flow so the fee module works
// end-to-end in dev/demo environments.
let razorpayInstance = null;
const isConfigured = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

if (isConfigured) {
  const Razorpay = require('razorpay');
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const createOrder = async (amount, receipt) => {
  if (isConfigured) {
    return razorpayInstance.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt,
    });
  }
  // Mock order
  return {
    id: `mock_order_${Date.now()}`,
    amount: amount * 100,
    currency: 'INR',
    receipt,
    mock: true,
  };
};

module.exports = { createOrder, isConfigured };
