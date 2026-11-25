
const Order = require('../models/Order');
const Item = require('../models/Item');
const sendOrderConfirmationEmail = require('../utils/sendEmail');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ======================================
// Fulfill paid order only once
// ======================================
async function fulfillPaidOrder(session) {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    throw new Error('Stripe session is missing orderId metadata.');
  }

  if (session.payment_status !== 'paid') {
    throw new Error('Payment has not been completed.');
  }

  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      paymentStatus: { $ne: 'paid' }
    },
    {
      $set: {
        paymentStatus: 'paid',
        status: 'opened',
        stripePaymentIntentId: session.payment_intent || null
      }
    },
    { new: true }
  );

  // Already fulfilled
  if (!order) {
    return await Order.findById(orderId);
  }

  // Deduct stock after successful payment
  for (const line of order.items) {
    const product = await Item.findById(line.itemId);

    if (!product) continue;

    const field =
      product.stock !== undefined ? 'stock' : 'quantity';

    const currentStock = Number(product[field] || 0);

    if (currentStock < line.orderQuantity) {
      console.error(
        `Insufficient stock after payment for product ${product._id}`
      );
    }

    product[field] = Math.max(
      0,
      currentStock - line.orderQuantity
    );

    await product.save();
  }

  // Send confirmation email
  try {
    const customerEmail = order.userDetails?.email;

    if (customerEmail) {
      await sendOrderConfirmationEmail(customerEmail, order);
      console.log(`Confirmation email sent for order ${order._id}`);
    } else {
      console.error(`No customer email for order ${order._id}`);
    }
  } catch (emailError) {
    console.error('Email sending failed:', emailError.message);
  }

  return order;
}

// ======================================
// Create Order + Stripe Checkout
// ======================================
exports.createOrder = async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({
        success: false,
        message: 'Stripe secret key is missing from .env'
      });
    }

    const orderData = req.body;

    const email =
      orderData.userDetails?.email || orderData.email;

    if (
      !orderData.userDetails?.fullName ||
      !email ||
      !orderData.userDetails?.phone ||
      !orderData.userDetails?.address
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone and address are required.'
      });
    }

    if (
      !Array.isArray(orderData.items) ||
      orderData.items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.'
      });
    }

    // Verify products and prices from database
    const verifiedItems = [];

    for (const requested of orderData.items) {
      const itemId =
        requested.itemId ||
        requested.product ||
        requested._id;

      const quantity = Math.floor(
        Number(
          requested.orderQuantity ||
          requested.quantity ||
          1
        )
      );

      if (!itemId || !Number.isFinite(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product or quantity.'
        });
      }

      const product = await Item.findById(itemId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${itemId}`
        });
      }

      const stock = Number(
        product.stock ?? product.quantity ?? 0
      );

      if (stock < quantity) {
        return res.status(409).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`
        });
      }

      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product price.'
        });
      }

      verifiedItems.push({
        itemId: product._id,
        name: product.name,
        price,
        orderQuantity: quantity
      });
    }

    const totalAmount = Number(
      verifiedItems
        .reduce(
          (sum, item) =>
            sum + item.price * item.orderQuantity,
          0
        )
        .toFixed(2)
    );

    const notes =
      typeof orderData.notes === 'string' &&
      orderData.notes.trim()
        ? [{ text: orderData.notes.trim() }]
        : [];

    // Create unpaid order
    const order = await Order.create({
      userDetails: {
        ...orderData.userDetails,
        email
      },
      items: verifiedItems,
      totalAmount,
      notes,
      status: 'pending',
      paymentStatus: 'unpaid'
    });

    // ======================================
    // Frontend URL Configuration
    // ======================================
    const frontendUrl = (
      process.env.FRONTEND_URL || 'http://localhost:4200'
    ).replace(/\/+$/, '');

    const successUrl =
      `${frontendUrl}/buy?payment=success&session_id={CHECKOUT_SESSION_ID}`;

    const cancelUrl =
      `${frontendUrl}/buy?payment=cancelled&order_id=${order._id}`;

    console.log('Frontend URL:', frontendUrl);
    console.log('Stripe Success URL:', successUrl);
    console.log('Stripe Cancel URL:', cancelUrl);

    // ======================================
    // Create Stripe Checkout Session
    // ======================================
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],

      customer_email: email,

      line_items: verifiedItems.map(item => ({
        quantity: item.orderQuantity,
        price_data: {
          currency: (
            process.env.STRIPE_CURRENCY || 'egp'
          ).toLowerCase(),

          unit_amount: Math.round(item.price * 100),

          product_data: {
            name: item.name
          }
        }
      })),

      metadata: {
        orderId: order._id.toString()
      },

      client_reference_id: order._id.toString(),

      success_url: successUrl,
      cancel_url: cancelUrl
    });

    order.stripeSessionId = session.id;
    await order.save();

    // Debug information
    console.log('========== STRIPE DEBUG ==========');
    console.log('Stripe Checkout URL:', session.url);
    console.log('Stripe Session ID:', session.id);
    console.log('Stripe Success URL:', session.success_url);
    console.log('Order ID:', order._id);
    console.log('==================================');

    return res.status(201).json({
      success: true,
      checkoutUrl: session.url,
      orderId: order._id,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Create order error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to create order.'
    });
  }
};

// ======================================
// Verify Stripe Payment After Redirect
// ======================================
exports.getCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required.'
      });
    }

    const session =
      await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(409).json({
        success: false,
        message: 'Payment is not completed yet.'
      });
    }

    const order = await fulfillPaidOrder(session);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    return res.status(200).json({
      success: true,
      savedOrder: order
    });

  } catch (error) {
    console.error('Payment verification error:', error);

    return res.status(400).json({
      success: false,
      message: error.message || 'Unable to verify payment.'
    });
  }
};

// ======================================
// Stripe Webhook
// ======================================
exports.handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature error:', error.message);

    return res.status(400).send(
      `Webhook signature verification failed: ${error.message}`
    );
  }

  try {
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object;

      if (session.payment_status === 'paid') {
        await fulfillPaidOrder(session);
      }
    }

    if (
      event.type === 'checkout.session.async_payment_failed'
    ) {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await Order.updateOne(
          {
            _id: orderId,
            paymentStatus: { $ne: 'paid' }
          },
          {
            $set: {
              paymentStatus: 'failed'
            }
          }
        );
      }
    }

    return res.status(200).json({
      received: true
    });

  } catch (error) {
    console.error('Webhook processing error:', error);

    return res.status(500).json({
      success: false,
      message: 'Webhook processing failed.'
    });
  }
};

// ======================================
// Manager Orders
// ======================================
exports.getManagerOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({
      createdAt: -1
    });

    return res.status(200).json(orders);

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// ======================================
// Close Order
// ======================================
exports.closeOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId || req.params.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: 'الطلب غير موجود'
      });
    }

    order.status = 'closed';
    await order.save();

    return res.status(200).json({
      message: 'تم إغلاق الطلب بنجاح',
      order
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// ======================================
// Update Order Status
// ======================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const status = req.body.status || req.body;
    const orderId = req.params.orderId || req.params.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      order
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ======================================
// Add Order Note
// ======================================
exports.addOrderNote = async (req, res) => {
  try {
    const { text } = req.body;
    const orderId = req.params.orderId || req.params.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: 'الطلب غير موجود'
      });
    }

    if (!order.notes) {
      order.notes = [];
    }

    order.notes.push({
      text,
      createdAt: new Date()
    });

    await order.save();

    return res.status(200).json({
      message: 'تم إضافة الملاحظة بنجاح',
      order
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};
