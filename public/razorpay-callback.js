// This script handles Razorpay payment callbacks
document.addEventListener('DOMContentLoaded', function() {
  console.log('Razorpay callback page loaded');
  
  // Check if this is a Razorpay callback
  const urlParams = new URLSearchParams(window.location.search);
  const razorpayPaymentId = urlParams.get('razorpay_payment_id');
  
  if (razorpayPaymentId) {
    console.log('Razorpay payment successful:', razorpayPaymentId);
    
    // Create a custom event for the payment success
    const paymentSuccessEvent = new CustomEvent('razorpay.payment.success', {
      detail: {
        paymentId: razorpayPaymentId
      }
    });
    
    // Dispatch the event
    window.dispatchEvent(paymentSuccessEvent);
    
    // Show success message
    const messageElement = document.getElementById('payment-message') || document.createElement('div');
    if (!document.getElementById('payment-message')) {
      messageElement.id = 'payment-message';
      messageElement.innerHTML = `
        <div style="text-align: center; padding: 20px; color: white;">
          <h2>Payment Successful!</h2>
          <p>Your subscription has been upgraded to PRO.</p>
          <p>Redirecting to dashboard...</p>
        </div>
      `;
      document.body.appendChild(messageElement);
    }
    
    // Hide the loader after showing success message
    const loader = document.querySelector('.loader');
    if (loader) {
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      console.log('Redirecting to dashboard...');
      window.location.href = '/';
    }, 2000);
    
    // Fallback redirect in case the timeout doesn't work
    setTimeout(() => {
      if (window.location.pathname.includes('razorpay-callback')) {
        console.log('Fallback redirect triggered');
        window.location.replace('/');
      }
    }, 3000);
  } else {
    console.log('No Razorpay payment ID found in URL');
    // If no payment ID, redirect to home after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  }
}); 