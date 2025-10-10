// components/NotificationProvider.tsx
'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useNotificationStore } from '@/stores/useNotificationStore';

export default function NotificationProvider() {
  const { notifications, removeNotification } = useNotificationStore();

  useEffect(() => {
    notifications.forEach((notification) => {
      const toastFn = {
        success: toast.success,
        error: toast.error,
        info: toast.info,
        warning: toast.warning,
      }[notification.type] || toast;

      toastFn(notification.message, {
        id: notification.id,
        duration: notification.duration,
        onDismiss: () => removeNotification(notification.id),
      });
    });
  }, [notifications, removeNotification]);

  return null;
}
