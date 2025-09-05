'use client';

import { useState, useEffect } from 'react';
import { Toast, ToastText } from '@instacart/ids-customers';
import { useRouter } from 'next/navigation';
import { orderGuideEvents } from '@/lib/order-guide-events';

export function OrderGuideNotifications() {
  const [showToast, setShowToast] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = orderGuideEvents.subscribe(event => {
      if (event.type === 'order-guide-created') {
        // Reset states and show toast
        setIsExiting(false);
        setShowToast(true);

        // Refresh order guides page if currently viewing it
        if (window.location.pathname === '/order-guides') {
          router.refresh();
        }

        // Start exit animation before hiding
        setTimeout(() => {
          setIsExiting(true);
          // Actually hide after animation completes
          setTimeout(() => {
            setShowToast(false);
            setIsExiting(false);
          }, 400);
        }, 4600);
      }
    });

    return unsubscribe;
  }, [router]);

  if (!showToast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '8%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        animation: isExiting
          ? 'slideOut 0.4s cubic-bezier(0.4, 0.0, 0.2, 1) forwards'
          : 'slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
      }}
    >
      <style jsx>{`
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px) scale(0.9);
          }
          60% {
            opacity: 1;
            transform: translateX(-50%) translateY(-2px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        @keyframes slideOut {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(10px) scale(0.95);
          }
        }
      `}</style>
      <Toast id="order-guide-toast">
        <ToastText>✅ Order guide created successfully!</ToastText>
      </Toast>
    </div>
  );
}
