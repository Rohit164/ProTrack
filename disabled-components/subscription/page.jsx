"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CrownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { upgradeSubscription, getSubscription } from "@/actions/subscriptions";

// Add CSS for Razorpay buttons
const razorpayButtonStyles = `
  .razorpay-payment-button {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  .razorpay-payment-button button {
    width: 80% !important;
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
    color: white !important;
    padding: 0.5rem 1rem !important;
    font-weight: 500 !important;
    border-radius: 0.375rem !important;
    transition: all 0.2s !important;
    margin: 0 auto !important;
  }
  
  .razorpay-payment-button button:hover {
    background-color: #2563eb !important;
    border-color: #2563eb !important;
  }
`;

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const paymentFormRef = useRef(null);
  const styleElementRef = useRef(null);

  // Fetch current subscription
  useEffect(() => {
    async function fetchSubscription() {
      try {
        setIsLoading(true);
        const data = await getSubscription();
        setSubscription(data);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  // Load Razorpay script
  useEffect(() => {
    // Don't load Razorpay if user already has PRO plan
    if (subscription?.plan === "PRO") return;

    // Clear the payment form container
    if (paymentFormRef.current) {
      paymentFormRef.current.innerHTML = '';
    }

    // Create payment button with appropriate ID based on billing cycle
    const loadRazorpayButton = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.async = true;
      
      // Set the appropriate payment button ID based on billing cycle
      const buttonId = billingCycle === "monthly" 
        ? 'pl_Q6jnVDx3bfEF0f' 
        : 'pl_Q6jpH4Fv0KSAES';
      
      script.setAttribute('data-payment_button_id', buttonId);
      // Add callback URL for redirect after payment
      script.setAttribute('data-callback_url', window.location.origin + '/razorpay-callback.html');
      
      return script;
    };

    // Add the button to the form container
    if (paymentFormRef.current) {
      const buttonScript = loadRazorpayButton();
      paymentFormRef.current.appendChild(buttonScript);
    }

    // Add custom styles for Razorpay buttons if not already added
    if (!styleElementRef.current) {
      const styleElement = document.createElement('style');
      styleElement.innerHTML = razorpayButtonStyles;
      document.head.appendChild(styleElement);
      styleElementRef.current = styleElement;
    }

    // Listen for Razorpay payment success
    window.addEventListener('razorpay.payment.success', handlePaymentSuccess);
    
    return () => {
      window.removeEventListener('razorpay.payment.success', handlePaymentSuccess);
    };
  }, [billingCycle, subscription]); // Re-run when billing cycle or subscription changes

  // Cleanup style element on unmount
  useEffect(() => {
    return () => {
      if (styleElementRef.current && styleElementRef.current.parentNode) {
        document.head.removeChild(styleElementRef.current);
      }
    };
  }, []);

  // Handle Razorpay payment success
  const handlePaymentSuccess = async (event) => {
    try {
      toast.success("Payment successful! Upgrading your subscription...");
      
      // Call the server action to upgrade the subscription
      const result = await upgradeSubscription("PRO", billingCycle);
      
      if (result.success) {
        toast.success("Successfully upgraded to PRO plan!");
        // Redirect to home page after successful payment
        router.push("/");
      }
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      toast.error("Error upgrading subscription. Please contact support.");
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show PRO subscription details if user already has PRO plan
  if (subscription?.plan === "PRO") {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Your Subscription</h1>
          <p className="text-xl text-gray-400">
            You're currently on the ProTrack Plus plan
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-900 to-indigo-900 border-blue-600">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="bg-yellow-500 rounded-full p-3">
                  <CrownIcon className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl text-center">ProTrack Plus</CardTitle>
              <p className="text-center text-gray-300 mt-2">
                {subscription.billingCycle === "MONTHLY" ? "Monthly" : "Yearly"} Plan
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-950/50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium mb-4">Subscription Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Status</span>
                    <span className="font-medium text-green-400">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Plan</span>
                    <span className="font-medium">ProTrack Plus</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Billing Cycle</span>
                    <span className="font-medium">{subscription.billingCycle === "MONTHLY" ? "Monthly" : "Yearly"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Start Date</span>
                    <span className="font-medium">{new Date(subscription.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Your Benefits</h3>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Unlimited projects</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Unlimited team members</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Advanced issue tracking</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Sprint management</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Priority support</span>
                </div>
              </div>

              <Button 
                className="w-full mt-8" 
                onClick={() => router.push("/")}
              >
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show subscription plans for non-PRO users
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Upgrade Your Plan</h1>
        <p className="text-xl text-gray-400">
          Choose the plan that works best for your team. Upgrade or downgrade anytime.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-slate-800 p-1 rounded-lg inline-flex">
          <Button
            variant={billingCycle === "monthly" ? "default" : "ghost"}
            onClick={() => setBillingCycle("monthly")}
            className="rounded-md"
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === "yearly" ? "default" : "ghost"}
            onClick={() => setBillingCycle("yearly")}
            className="rounded-md"
          >
            Yearly
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Free Plan */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl">Free</CardTitle>
            <p className="text-gray-400">Perfect for small teams just getting started</p>
            <div className="mt-4">
              <span className="text-4xl font-bold">₹0</span>
              <span className="text-gray-400">/{billingCycle === "monthly" ? "month" : "year"}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Up to 2 projects</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Up to 3 team members</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Basic issue tracking</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Sprint management</span>
              </div>
            </div>
            <Button className="w-full mt-6" variant="outline" disabled>
              Current Plan
            </Button>
          </CardContent>
        </Card>

        {/* ProTrack Plus Plan */}
        <Card className="bg-slate-900 border-blue-600 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-1 text-sm font-medium">
            RECOMMENDED
          </div>
          <CardHeader className="pt-8">
            <CardTitle className="text-2xl">ProTrack Plus</CardTitle>
            <p className="text-gray-400">For growing teams that need more</p>
            <div className="mt-4">
              <span className="text-4xl font-bold">
                ₹{billingCycle === "monthly" ? "9" : "99"}
              </span>
              <span className="text-gray-400">/{billingCycle === "monthly" ? "month" : "year"}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Unlimited projects</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Unlimited team members</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Advanced issue tracking</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Sprint management</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Priority support</span>
              </div>
            </div>
            
            {/* Razorpay Payment Button inside a form tag */}
            <div className="mt-6 flex justify-center">
              <form ref={paymentFormRef} className="w-full text-center"></form>
            </div>
            
            <p className="text-xs text-center mt-4 text-gray-400">
              Multiple payment methods available including UPI with QR code
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8 text-gray-400">
        All prices are in Indian Rupees (₹).
      </div>
    </div>
  );
} 