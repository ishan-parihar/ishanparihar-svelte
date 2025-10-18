{
  "version": "2",
  "name": "payments-api",
  "endpoints": {
    "create-order": {
      "method": "POST",
      "path": "/api/payments/create-order",
      "description": "Creates a new payment order with Razorpay"
    },
    "verify-payment": {
      "method": "POST",
      "path": "/api/payments/verify",
      "description": "Verifies a payment with Razorpay"
    }
  }
}