import { PUBLIC_ENV } from '$lib/env';

declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

export class Analytics {
  private static instance: Analytics;
  
  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }
  
  public trackEvent(eventName: string, properties?: Record<string, any>) {
    if (typeof window !== 'undefined' && PUBLIC_ENV.ANALYTICS_ID) {
      // Google Analytics 4
      if (window.gtag) {
        window.gtag('event', eventName, {
          event_category: 'User Interaction',
          ...properties
        });
      } else {
        // Initialize gtag if not already done
        this.initializeGtag();
        window.gtag('event', eventName, {
          event_category: 'User Interaction',
          ...properties
        });
      }
    }
  }
  
  public trackPageView(page: string, title?: string) {
    if (typeof window !== 'undefined' && PUBLIC_ENV.ANALYTICS_ID) {
      if (window.gtag) {
        window.gtag('config', PUBLIC_ENV.ANALYTICS_ID, {
          page_path: page,
          page_title: title
        });
      } else {
        this.initializeGtag();
        window.gtag('config', PUBLIC_ENV.ANALYTICS_ID, {
          page_path: page,
          page_title: title
        });
      }
    }
  }
  
  public trackConversion(type: string, value?: number) {
    this.trackEvent('conversion', {
      conversion_type: type,
      value
    });
  }
  
  public trackUserSignUp(userId: string, method: string = 'email') {
    this.trackEvent('sign_up', {
      method,
      user_id: userId
    });
  }
  
  public trackPurchase(orderId: string, value: number, currency: string = 'INR') {
    this.trackEvent('purchase', {
      transaction_id: orderId,
      value,
      currency,
      items: [] // Items would be added dynamically
    });
  }
  
  public trackAddToCart(serviceId: string, serviceName: string, price: number) {
    this.trackEvent('add_to_cart', {
      items: [{
        item_id: serviceId,
        item_name: serviceName,
        price
      }]
    });
  }
  
  private initializeGtag() {
    if (typeof window !== 'undefined' && PUBLIC_ENV.ANALYTICS_ID) {
      // Load Google Analytics script dynamically if not already loaded
      if (!window.dataLayer) {
        window.dataLayer = [];
      }
      
      if (!window.gtag) {
        window.gtag = function gtag() {
          window.dataLayer.push(arguments);
        };
      }
      
      // Configure GA4
      window.gtag('js', new Date());
      window.gtag('config', PUBLIC_ENV.ANALYTICS_ID);
    }
  }
  
  public async loadAnalytics() {
    if (typeof window !== 'undefined' && PUBLIC_ENV.ANALYTICS_ID) {
      // Dynamically load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${PUBLIC_ENV.ANALYTICS_ID}`;
      document.head.appendChild(script);
      
      // Wait for script to load before initializing
      script.onload = () => {
        this.initializeGtag();
      };
    }
  }
}

export const analytics = Analytics.getInstance();