import { useState } from 'react';
import {
  MOCK_NOTIFICATION_PREFS,
  MockNotificationPrefs,
} from '../mocks/notifications';

export interface UseNotificationPrefsReturn {
  prefs: MockNotificationPrefs;
  loading: boolean;
  updatePrefs: (updates: Partial<MockNotificationPrefs>) => Promise<void>;
}

export function useNotificationPrefs(): UseNotificationPrefsReturn {
  const [prefs, setPrefs] = useState<MockNotificationPrefs>(
    MOCK_NOTIFICATION_PREFS
  );
  const [loading, setLoading] = useState(false);

  const updatePrefs = async (updates: Partial<MockNotificationPrefs>) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    setPrefs({ ...prefs, ...updates });
    setLoading(false);
  };

  return { prefs, loading, updatePrefs };
}
