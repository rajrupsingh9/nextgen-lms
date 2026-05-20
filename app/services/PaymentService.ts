import { initStripe, presentPaymentSheet } from "@stripe/stripe-react-native";
import { NativeModules, Platform } from "react-native";

interface OrderInitializationPayload {
  bundleId: string;
  amount: number;
  currency: "INR" | "USD";
  studentId: string;
}

interface PaymentVerificationReceipt {
  success: boolean;
  transactionId: string;
  gateway: "STRIPE" | "RAZORPAY";
  error?: string;
}

export class PaymentService {
  private static BACKEND_ORDER_API = "https://api.yourlmsapp.com/v1/billing/order/create";

  /**
   * Orchestrates native checkout execution based on geographic market routing (FR 5.2)
   */
  public static async executeBundleCheckout(
    orderInfo: OrderInitializationPayload
  ): Promise<PaymentVerificationReceipt> {
    try {
      // 1. Initialize Order Creation Handshake with Central Backend
      const response = await fetch(this.BACKEND_ORDER_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Attestation-Platform": "Native-Mobile-Runtime",
        },
        body: JSON.stringify(orderInfo),
      });

      if (!response.ok) {
        throw new Error("Order configuration initialization rejected by billing cluster.");
      }

      const orderPayload = await response.json();

      // 2. Route Processing Based on Currency Vector
      if (orderInfo.currency === "USD") {
        return await this.processStripeGlobalTransaction(orderPayload.stripeClientSecret);
      } else {
        return await this.processRazorpayDomesticTransaction(orderPayload.razorpayOrderId, orderInfo.amount);
      }
    } catch (error: any) {
      return {
        success: false,
        transactionId: "",
        gateway: orderInfo.currency === "USD" ? "STRIPE" : "RAZORPAY",
        error: error.message || "Billing orchestration fatal interruption.",
      };
    }
  }

  /**
   * Directs global processing nodes through Stripe's Native Payment Sheet infrastructure
   */
  private static async processStripeGlobalTransaction(clientSecret: string): Promise<PaymentVerificationReceipt> {
    try {
      // Initialize Stripe SDK container parameters natively
      await initStripe({
        publishableKey: "pk_live_2026_NextGenLmsSecureCryptographicKey_01",
        merchantIdentifier: "merchant.com.architecture.nextgenlms", 
        urlScheme: "nextgenlms",
      });

      // Inject the intent secret straight into native modal sheets
      const { error: initError } = await presentPaymentSheet({
        clientSecret: clientSecret,
        applePay: true,
        googlePay: true,
        defaultBillingDetails: {
          address: { country: "US" }
        }
      });

      if (initError) {
        throw new Error(`Stripe Native interface rejected processing: ${initError.message}`);
      }

      return {
        success: true,
        transactionId: `tx_stripe_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        gateway: "STRIPE",
      };
    } catch (err: any) {
      throw new Error(err.message || "Stripe workflow runtime engine collapse.");
    }
  }

  /**
   * Routes regional paths directly into localized Razorpay components for UPI & Netbanking
   */
  private static async processRazorpayDomesticTransaction(
    razorpayOrderId: string,
    amountInInr: number
  ): Promise<PaymentVerificationReceipt> {
    return new Promise((resolve) => {
      // Fallback verification mapping for web vs native execution contexts
      if (Platform.OS === "web") {
        resolve({
          success: false,
          transactionId: "",
          gateway: "RAZORPAY",
          error: "Razorpay native module is strictly isolated away from standard browser targets.",
        });
        return;
      }

      const RazorpayModule = NativeModules.RazorpayCheckout;
      if (!RazorpayModule) {
        resolve({
          success: false,
          transactionId: "",
          gateway: "RAZORPAY",
          error: "Native Razorpay link bridges are missing from the compiled runtime structure.",
        });
        return;
      }

      // Exact production-ready options structure parsed by native Android/iOS gradle wrappers
      const interfaceOptions = {
        description: "Enterprise LMS Course Bundle Licensing",
        image: "https://yourlmsapp.com/assets/billing_logo.png",
        currency: "INR",
        key: "rzp_live_2026_SecureProductionKey_XYZ",
        amount: amountInInr * 100, // Denominated entirely in minor subunits (paise)
        name: "NextGen LMS Portal",
        order_id: razorpayOrderId,
        prefill: {
          email: "billing@institution.com",
          contact: "9876543210",
          name: "LMS Enrolled Student"
        },
        theme: { color: "#2563eb" }
      };

      // Execute cross-bridge communication streams
      RazorpayModule.open(interfaceOptions)
        .then((data: any) => {
          resolve({
            success: true,
            transactionId: String(data.razorpay_payment_id || razorpayOrderId),
            gateway: "RAZORPAY",
          });
        })
        .catch((error: any) => {
          resolve({
            success: false,
            transactionId: "",
            gateway: "RAZORPAY",
            error: error.description || "Localized transaction sequence terminated by user.",
          });
        });
    });
  }
}
