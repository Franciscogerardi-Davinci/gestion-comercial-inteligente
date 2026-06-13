import { Alert, Snackbar } from '@mui/material';
import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';

import { NotificationContext, type NotificationSeverity } from './notificationContext';

interface NotificationState {
  key: number;
  message: string;
  severity: NotificationSeverity;
}

export function NotificationProvider({ children }: PropsWithChildren) {
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const notify = useCallback((message: string, severity: NotificationSeverity = 'success') => {
    setNotification({ key: Date.now(), message, severity });
  }, []);
  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        key={notification?.key}
        open={Boolean(notification)}
        autoHideDuration={4500}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={() => setNotification(null)}
      >
        <Alert
          severity={notification?.severity ?? 'info'}
          variant="filled"
          onClose={() => setNotification(null)}
          sx={{ minWidth: { sm: 320 } }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}
