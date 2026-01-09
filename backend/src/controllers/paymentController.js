const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/User');

/**
 * Generate PhonePe payment order
 */
const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount, planType } = req.body; // planType: 'monthly' or 'yearly'

    if (!amount || !planType) {
      return res.status(400).json({
        success: false,
        message: 'Amount and planType are required',
      });
    }

    // PhonePe configuration
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
    const baseUrl = process.env.PHONEPE_BASE_URL || 'https://api.phonepe.com/apis/hermes';

    if (!merchantId || !saltKey) {
      return res.status(500).json({
        success: false,
        message: 'PhonePe configuration missing',
      });
    }

    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    // Create payment payload
    const payload = {
      merchantId: merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: userId.toString(),
      amount: amount * 100, // Convert to paise (PhonePe uses paise)
      redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment/callback`,
      redirectMode: 'POST',
      callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/payment/callback`,
      mobileNumber: req.user.phone || '',
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    // Create base64 encoded payload
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

    // Generate X-VERIFY header (SHA256)
    const stringToHash = `${base64Payload}/pg/v1/pay${saltKey}`;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const xVerify = `${sha256Hash}###${saltIndex}`;

    // Make API call to PhonePe
    const response = await axios.post(
      `${baseUrl}/pg/v1/pay`,
      {
        request: base64Payload,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'Accept': 'application/json',
        },
      }
    );

    if (response.data && response.data.success) {
      // Store payment details in session/database (optional)
      // You can create a Payment model to track transactions
      
      return res.json({
        success: true,
        data: {
          paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
          transactionId: transactionId,
          merchantTransactionId: transactionId,
        },
      });
    } else {
      throw new Error('Payment order creation failed');
    }
  } catch (error) {
    console.error('PhonePe Payment Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to create payment order',
    });
  }
};

/**
 * Verify PhonePe payment callback
 */
const verifyPayment = async (req, res) => {
  try {
    const { merchantTransactionId, transactionId } = req.body;
    const userId = req.user._id;

    if (!merchantTransactionId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required',
      });
    }

    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
    const baseUrl = process.env.PHONEPE_BASE_URL || 'https://api.phonepe.com/apis/hermes';
    const merchantId = process.env.PHONEPE_MERCHANT_ID;

    // Generate X-VERIFY for status check
    const statusUrl = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
    const stringToHash = `${statusUrl}${saltKey}`;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const xVerify = `${sha256Hash}###${saltIndex}`;

    // Check payment status
    const response = await axios.get(
      `${baseUrl}${statusUrl}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': merchantId,
          'Accept': 'application/json',
        },
      }
    );

    if (response.data && response.data.success) {
      const paymentData = response.data.data;
      const code = paymentData.code;
      const state = paymentData.state;

      // Payment successful
      if (code === 'PAYMENT_SUCCESS' && state === 'COMPLETED') {
        // Update user premium status
        const user = await User.findById(userId);
        if (user) {
          user.isPremium = true;
          user.premiumActivatedAt = new Date();
          user.premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
          await user.save();
        }

        return res.json({
          success: true,
          message: 'Payment successful. Premium activated!',
          data: {
            transactionId: merchantTransactionId,
            amount: paymentData.amount / 100, // Convert from paise
            premiumStatus: true,
          },
        });
      } else {
        // Payment failed
        return res.json({
          success: false,
          message: 'Payment failed or pending',
          data: {
            code,
            state,
          },
        });
      }
    } else {
      throw new Error('Payment verification failed');
    }
  } catch (error) {
    console.error('Payment Verification Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to verify payment',
    });
  }
};

/**
 * Handle PhonePe webhook callback
 */
const paymentCallback = async (req, res) => {
  try {
    const { response: encryptedResponse } = req.body;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';

    // Decrypt the response
    const base64Decoded = Buffer.from(encryptedResponse, 'base64').toString('utf-8');
    const responseData = JSON.parse(base64Decoded);

    // Verify checksum
    const checksumString = `${encryptedResponse}/pg/v1/webhook${saltKey}`;
    const checksum = crypto.createHash('sha256').update(checksumString).digest('hex');
    const xVerify = `${checksum}###${saltIndex}`;

    // Verify the checksum matches
    if (req.headers['x-verify'] !== xVerify) {
      return res.status(400).json({
        success: false,
        message: 'Invalid checksum',
      });
    }

    const { code, data } = responseData;
    const { merchantTransactionId, transactionId, amount } = data;

    // Find user by transaction ID (you may need to store this mapping)
    // For now, we'll extract from merchantUserId if available
    const userId = data.merchantUserId;

    if (code === 'PAYMENT_SUCCESS' && data.state === 'COMPLETED') {
      // Update user premium status
      const user = await User.findById(userId);
      if (user) {
        user.isPremium = true;
        user.premiumActivatedAt = new Date();
        user.premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        await user.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Webhook received',
    });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    });
  }
};

/**
 * Get premium plans
 */
const getPremiumPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'monthly',
        name: 'Monthly Premium',
        duration: '1 month',
        price: 299,
        features: [
          'Daily outfit suggestions',
          'Weekly planner',
          'Occasion styling',
          'Wardrobe gap detection',
          'Style history tracking',
        ],
      },
      {
        id: 'yearly',
        name: 'Yearly Premium',
        duration: '12 months',
        price: 2499,
        originalPrice: 3588,
        discount: '30% OFF',
        features: [
          'All monthly features',
          'Priority support',
          'Advanced AI recommendations',
          'Early access to new features',
        ],
      },
    ];

    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Check premium status
 */
const checkPremiumStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if premium has expired
    if (user.isPremium && user.premiumExpiresAt && new Date() > user.premiumExpiresAt) {
      user.isPremium = false;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        isPremium: user.isPremium,
        premiumActivatedAt: user.premiumActivatedAt,
        premiumExpiresAt: user.premiumExpiresAt,
        daysRemaining: user.premiumExpiresAt
          ? Math.max(0, Math.ceil((user.premiumExpiresAt - new Date()) / (1000 * 60 * 60 * 24)))
          : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  paymentCallback,
  getPremiumPlans,
  checkPremiumStatus,
};

