'use client';

import { useState, useEffect } from 'react';
import { Toast, ToastText } from '@instacart/ids-customers';
import { useRouter } from 'next/navigation';
import { orderGuideEvents } from '@/lib/order-guide-events';

export function OrderGuideNotifications() {
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = orderGuideEvents.subscribe(event => {
      if (event.type === 'order-guide-created') {
        // Show toast notification
        setShowToast(true);

        // Refresh order guides page if currently viewing it
        if (window.location.pathname === '/order-guides') {
          router.refresh();
        }

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    });

    return unsubscribe;
  }, [router]);

  if (!showToast) return null;

  return (
    <Toast id="order-guide-toast">
      <ToastText>✅ Order guide created successfully!</ToastText>
    </Toast>
  );
}
