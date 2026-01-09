# PhonePe Payment Integration Setup Guide

## Overview
This guide will help you set up PhonePe payment gateway for premium subscriptions in StyloAI.

## Prerequisites

1. PhonePe Merchant Account
   - Sign up at https://merchant.phonepe.com/
   - Complete KYC verification
   - Get your Merchant ID, Salt Key, and Salt Index

2. Backend running with environment variables configured

## Step 1: Get PhonePe Credentials

1. **Login to PhonePe Merchant Dashboard**
   - Go to https://merchant.phonepe.com/
   - Navigate to Settings → API Keys

2. **Get Your Credentials:**
   - **Merchant ID**: Your unique merchant identifier
   - **Salt Key**: Secret key for API authentication
   - **Salt Index**: Usually "1" (check in dashboard)

3. **Note the API Endpoints:**
   - Production: `https://api.phonepe.com/apis/hermes`
   - Sandbox/Test: `https://api-preprod.phonepe.com/apis/pg-sandbox`

## Step 2: Configure Environment Variables

1. Open your `.env` file in the `backend` directory

2. Add PhonePe configuration:
   ```env
   # PhonePe Configuration
   PHONEPE_MERCHANT_ID=your-merchant-id-here
   PHONEPE_SALT_KEY=your-salt-key-here
   PHONEPE_SALT_INDEX=1
   PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
   
   # For testing, use:
   # PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
   
   # Backend URL (for callbacks)
   BACKEND_URL=http://localhost:5001
   
   # Frontend URL (for redirects)
   FRONTEND_URL=http://localhost:8081
   ```

3. **Important:** 
   - Never commit your `.env` file to git
   - Keep Salt Key secret
   - Use sandbox URL for testing

## Step 3: Configure Callback URLs

1. **In PhonePe Dashboard:**
   - Go to Settings → Webhooks
   - Add callback URL: `https://your-domain.com/api/payment/callback`
   - Add redirect URL: `https://your-domain.com/payment/callback`

2. **For Development:**
   - Use ngrok or similar tool to expose localhost
   - Update callback URLs in PhonePe dashboard

## Step 4: Test the Integration

### Test Payment Flow

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test API Endpoints:**
   ```bash
   # Get premium plans
   GET /api/payment/plans
   
   # Create payment order
   POST /api/payment/create-order
   Body: {
     "amount": 299,
     "planType": "monthly"
   }
   
   # Verify payment
   POST /api/payment/verify
   Body: {
     "merchantTransactionId": "TXN123...",
     "transactionId": "TXN123..."
   }
   ```

3. **Test in Mobile App:**
   - Navigate to Profile → Upgrade to Premium
   - Select a plan
   - Complete payment in PhonePe
   - Verify premium status is updated

## Step 5: Handle Payment States

### Payment States in PhonePe:
- `PAYMENT_SUCCESS` - Payment completed successfully
- `PAYMENT_PENDING` - Payment is being processed
- `PAYMENT_FAILED` - Payment failed
- `PAYMENT_DECLINED` - Payment was declined

### Implementation Details:

1. **Payment Order Creation:**
   - Generates unique transaction ID
   - Creates payment payload
   - Generates X-VERIFY header using SHA256
   - Returns payment URL

2. **Payment Verification:**
   - Checks payment status via PhonePe API
   - Verifies checksum
   - Updates user premium status on success
   - Sets premium expiration date (30 days for monthly, 365 for yearly)

3. **Webhook Handling:**
   - PhonePe sends webhook on payment completion
   - Verifies webhook signature
   - Updates user status automatically

## Step 6: Update User Model

The User model has been updated with:
- `premiumActivatedAt` - When premium was activated
- `premiumExpiresAt` - When premium expires

Premium status is automatically checked and updated when:
- User tries to access premium features
- Payment is verified
- Premium expiration is checked

## Security Best Practices

1. **Never expose Salt Key:**
   - Keep in environment variables only
   - Never log or expose in client-side code

2. **Verify Checksums:**
   - Always verify X-VERIFY header
   - Verify webhook signatures

3. **Use HTTPS in Production:**
   - PhonePe requires HTTPS for production
   - Use SSL certificates

4. **Validate Amounts:**
   - Verify payment amounts match expected values
   - Prevent amount tampering

## Testing Checklist

- [ ] Payment order creation works
- [ ] Payment URL opens correctly
- [ ] Payment verification works
- [ ] Premium status updates on success
- [ ] Webhook callback receives payments
- [ ] Premium expiration is set correctly
- [ ] Error handling works for failed payments
- [ ] Premium status check works

## Troubleshooting

### Payment Order Creation Fails
- Check Merchant ID and Salt Key are correct
- Verify Salt Index matches dashboard
- Check API endpoint URL
- Verify network connectivity

### Payment Verification Fails
- Check transaction ID is correct
- Verify checksum calculation
- Check payment status in PhonePe dashboard
- Ensure callback URL is configured

### Premium Not Activating
- Check payment verification response
- Verify user ID matches
- Check database connection
- Review server logs

### Webhook Not Receiving
- Verify webhook URL is accessible
- Check PhonePe dashboard webhook settings
- Use ngrok for local testing
- Verify webhook signature

## API Endpoints

### Get Premium Plans
```
GET /api/payment/plans
Headers: Authorization: Bearer <token>
Response: { success: true, data: [...] }
```

### Create Payment Order
```
POST /api/payment/create-order
Headers: Authorization: Bearer <token>
Body: { amount: 299, planType: "monthly" }
Response: { success: true, data: { paymentUrl, transactionId } }
```

### Verify Payment
```
POST /api/payment/verify
Headers: Authorization: Bearer <token>
Body: { merchantTransactionId, transactionId }
Response: { success: true, message: "Payment successful" }
```

### Check Premium Status
```
GET /api/payment/status
Headers: Authorization: Bearer <token>
Response: { success: true, data: { isPremium, premiumExpiresAt } }
```

### Webhook Callback (Public)
```
POST /api/payment/callback
Body: { response: <encrypted_response> }
Headers: X-VERIFY: <checksum>
```

## Mobile App Integration

The mobile app includes:
- Payment screen with plan selection
- PhonePe payment flow
- Payment verification
- Premium status display
- Upgrade button in profile

### Access Payment Screen:
1. Profile → Upgrade to Premium
2. Or navigate to Payment screen directly

## Production Deployment

1. **Update Environment Variables:**
   - Use production PhonePe credentials
   - Set production API URL
   - Configure production callback URLs

2. **Update Frontend URLs:**
   - Set `FRONTEND_URL` to your production domain
   - Set `BACKEND_URL` to your production API domain

3. **Configure SSL:**
   - PhonePe requires HTTPS in production
   - Set up SSL certificates
   - Update callback URLs to HTTPS

4. **Test Thoroughly:**
   - Test with real payments (small amounts)
   - Verify webhook delivery
   - Test premium feature access

## Support

- PhonePe Merchant Support: https://merchant.phonepe.com/support
- PhonePe API Documentation: https://developer.phonepe.com/
- For issues with this implementation, check backend logs

## Notes

- PhonePe amounts are in **paise** (1 rupee = 100 paise)
- Payment amounts are converted automatically
- Premium subscription is set to 30 days for monthly, 365 for yearly
- Premium status is checked automatically on expiration

