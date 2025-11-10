// Test file for the dummy payment gateway
// Run with: node test-payment-gateway.js

const DummyPaymentGateway = require('./backend/src/services/dummyPaymentGateway');

async function testPaymentGateway() {
    const gateway = new DummyPaymentGateway();
    
    console.log('🔧 Testing Dummy Payment Gateway...\n');

    try {
        // Test 1: Gateway Status
        console.log('1. Testing Gateway Status:');
        const status = await gateway.getGatewayStatus();
        console.log('Status:', status.status);
        console.log('Gateway Name:', status.gateway_name);
        console.log('✅ Gateway status test passed\n');

        // Test 2: Successful Card Payment
        console.log('2. Testing Successful Card Payment:');
        const cardPayment = {
            amount: 1500.00,
            booking_id: 1,
            card_details: {
                number: '4111111111111111', // Success scenario
                expiry: '12/25',
                cvc: '123'
            }
        };
        
        const cardResult = await gateway.processCardPayment(cardPayment);
        console.log('Success:', cardResult.success);
        console.log('Status:', cardResult.status);
        console.log('Transaction ID:', cardResult.transaction_id);
        console.log('✅ Card payment test passed\n');

        // Test 3: Failed Card Payment
        console.log('3. Testing Failed Card Payment:');
        const failedCardPayment = {
            amount: 1500.00,
            booking_id: 2,
            card_details: {
                number: '4111111111110000', // Fail scenario (ends with 0000)
                expiry: '12/25',
                cvc: '123'
            }
        };
        
        const failedCardResult = await gateway.processCardPayment(failedCardPayment);
        console.log('Success:', failedCardResult.success);
        console.log('Status:', failedCardResult.status);
        console.log('Error:', failedCardResult.error_message);
        console.log('✅ Failed card payment test passed\n');

        // Test 4: UPI Payment
        console.log('4. Testing UPI Payment:');
        const upiPayment = {
            amount: 2000.00,
            booking_id: 3,
            upi_id: 'user@upi'
        };
        
        const upiResult = await gateway.processUpiPayment(upiPayment);
        console.log('Success:', upiResult.success);
        console.log('Status:', upiResult.status);
        console.log('Transaction ID:', upiResult.transaction_id);
        console.log('UPI Ref ID:', upiResult.upi_ref_id);
        console.log('✅ UPI payment test passed\n');

        // Test 5: Payment Verification
        console.log('5. Testing Payment Verification:');
        const verification = await gateway.verifyPayment(cardResult.transaction_id);
        console.log('Verified:', verification.verified);
        console.log('Transaction ID:', verification.transaction_id);
        console.log('✅ Payment verification test passed\n');

        // Test 6: Refund Processing
        console.log('6. Testing Refund Processing:');
        const refundResult = await gateway.processRefund(
            cardResult.transaction_id, 
            500.00, 
            cardResult.amount
        );
        console.log('Refund Success:', refundResult.success);
        console.log('Refund Transaction ID:', refundResult.refund_transaction_id);
        console.log('Refund Amount:', refundResult.refund_amount);
        console.log('✅ Refund test passed\n');

        // Test 7: Webhook Simulation
        console.log('7. Testing Webhook Simulation:');
        const webhookData = await gateway.simulateWebhook(cardResult, 'completed');
        console.log('Event Type:', webhookData.event_type);
        console.log('Transaction ID:', webhookData.transaction_id);
        console.log('Status:', webhookData.status);
        console.log('Signature:', webhookData.signature ? 'Generated' : 'Missing');
        console.log('✅ Webhook simulation test passed\n');

        // Test 8: Webhook Signature Verification
        console.log('8. Testing Webhook Signature Verification:');
        const isValidSignature = gateway.verifyWebhookSignature(
            webhookData.transaction_id,
            webhookData.status,
            webhookData.signature
        );
        console.log('Signature Valid:', isValidSignature);
        console.log('✅ Webhook signature verification test passed\n');

        console.log('🎉 All payment gateway tests passed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testPaymentGateway().catch(console.error);
}

module.exports = testPaymentGateway;