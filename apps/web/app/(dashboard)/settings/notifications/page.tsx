'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationPreferences {
  loadAssigned: boolean;
  loadAccepted: boolean;
  podReceived: boolean;
  invoiceCreated: boolean;
  paymentProcessed: boolean;
  chatMessages: boolean;
  documentsUploaded: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

// Mock initial prefs
const mockInitialPrefs: NotificationPreferences = {
  loadAssigned: true,
  loadAccepted: true,
  podReceived: true,
  invoiceCreated: true,
  paymentProcessed: true,
  chatMessages: true,
  documentsUploaded: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(mockInitialPrefs);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );

  useEffect(() => {
    setPrefs(mockInitialPrefs);
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (typeof prefs[key] === 'boolean') {
      setPrefs((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
      setSaveStatus('idle');
    }
  };

  const handleTimeChange = (
    key: 'quietHoursStart' | 'quietHoursEnd',
    value: string
  ) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
        <p className="text-slate-600 text-sm mt-1">
          Manage how and when you receive notifications
        </p>
      </div>

      {saveStatus === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-900">
            Your preferences have been saved successfully
          </p>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-900">
            Failed to save preferences. Please try again.
          </p>
        </div>
      )}

      <div className="border rounded-lg p-6 bg-white space-y-6">
        {/* Event Notifications */}
        <div>
          <h2 className="text-lg font-bold mb-4">Event Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
              <div>
                <Label className="text-base font-medium">Load Assigned</Label>
                <p className="text-sm text-slate-600 mt-1">
                  Notify when a new load is assigned to you
                </p>
              </div>
              <Switch
                checked={prefs.loadAssigned}
                onCheckedChange={() => handleToggle('loadAssigned')}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
              <div>
                <Label className="text-base font-medium">Load Accepted</Label>
                <p className="text-sm text-slate-600 mt-1">
                  Notify when a load is accepted by a carrier
                </p>
              </div>
              <Switch
                checked={prefs.loadAccepted}
                onCheckedChange={() => handleToggle('loadAccepted')}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
              <div>
                <Label className="text-base font-medium">POD Received</Label>
                <p className="text-sm text-slate-600 mt-1">
                  Notify when proof of delivery is received
                </p>
              </div>
              <Switch
                checked={prefs.podReceived}
                onCheckedChange={() => handleToggle('podReceived')}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
              <div>
                <Label className="text-base font-medium">Invoice Created</Label>
                <p className="text-sm text-slate-600 mt-1">
                  Notify when a new invoice is created
                </p>
              </div>
              <Switch
                checked={prefs.invoiceCreated}
                onCheckedChange={() => handleToggle('invoiceCreated')}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
              <div>
                <Label className="text-base font-medium">
                  Payment Processed
                </Label>
                <p className="text-sm text-slate-600 mt-1">
                  Notify when a payment has been processed
                </p>
              </div>
              <Switch
                checked={prefs.paymentProcessed}
                onCheckedChange={() => handleToggle('paymentProcessed')}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
              <div>
                <Label className="text-base font-medium">Chat Messages</Label>
                <p className="text-sm text-slate-600 mt-1">
                  Notify when you receive new messages
                </p>
              </div>
              <Switch
                checked={prefs.chatMessages}
                onCheckedChange={() => handleToggle('chatMessages')}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
              <div>
                <Label className="text-base font-medium">
                  Documents Uploaded
                </Label>
                <p className="text-sm text-slate-600 mt-1">
                  Notify when documents are uploaded
                </p>
              </div>
              <Switch
                checked={prefs.documentsUploaded}
                onCheckedChange={() => handleToggle('documentsUploaded')}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          {/* Quiet Hours */}
          <h2 className="text-lg font-bold mb-4">Quiet Hours</h2>
          <p className="text-sm text-slate-600 mb-4">
            Don't send notifications between these times (even for enabled
            events)
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={prefs.quietHoursStart}
                onChange={(e) =>
                  handleTimeChange('quietHoursStart', e.target.value)
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={prefs.quietHoursEnd}
                onChange={(e) =>
                  handleTimeChange('quietHoursEnd', e.target.value)
                }
                className="mt-2"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              Quiet hours are from {prefs.quietHoursStart} to{' '}
              {prefs.quietHoursEnd} daily
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
        <Button variant="outline">Reset to Defaults</Button>
      </div>
    </div>
  );
}
