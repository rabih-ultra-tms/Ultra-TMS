'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentUser, useEnableMFA, useConfirmMFA, useDisableMFA } from '@/lib/hooks/use-auth';
import { Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function MFASettings() {
  const { data: user } = useCurrentUser();
  const enableMFA = useEnableMFA();
  const confirmMFA = useConfirmMFA();
  const disableMFA = useDisableMFA();

  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisable, setShowDisable] = useState(false);

  const isMfaEnabled = user?.mfaEnabled ?? false;

  const handleEnable = () => {
    enableMFA.mutate('TOTP', {
      onSuccess: (response) => {
        const data = (response as { data?: { secret: string; qrCode: string } })?.data;
        if (data) {
          setSetupData(data);
        }
      },
    });
  };

  const handleConfirm = () => {
    if (!verificationCode) return;
    confirmMFA.mutate(verificationCode, {
      onSuccess: () => {
        setSetupData(null);
        setVerificationCode('');
      },
    });
  };

  const handleDisable = () => {
    if (!disablePassword) return;
    disableMFA.mutate(disablePassword, {
      onSuccess: () => {
        setShowDisable(false);
        setDisablePassword('');
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-md border p-3">
          <div className="flex items-center gap-3">
            {isMfaEnabled ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <ShieldOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">
                {isMfaEnabled ? 'MFA is enabled' : 'MFA is disabled'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isMfaEnabled
                  ? 'A 6-digit code is required at login'
                  : 'Enable to add an extra layer of security'}
              </p>
            </div>
          </div>
          <Switch
            checked={isMfaEnabled}
            onCheckedChange={(checked) => {
              if (checked) {
                handleEnable();
              } else {
                setShowDisable(true);
              }
            }}
            disabled={enableMFA.isPending}
          />
        </div>

        {/* MFA Setup Flow */}
        {setupData && (
          <div className="space-y-3 rounded-md border p-4">
            <p className="text-sm font-medium">Scan QR code with your authenticator app</p>
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={setupData.qrCode} alt="MFA QR Code" className="h-48 w-48" />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Manual key: <code className="bg-muted px-1 rounded">{setupData.secret}</code>
            </p>
            <div className="space-y-2">
              <Label htmlFor="mfa-code">Verification code</Label>
              <div className="flex gap-2">
                <Input
                  id="mfa-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                />
                <Button onClick={handleConfirm} disabled={confirmMFA.isPending || !verificationCode}>
                  {confirmMFA.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Verify
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Disable MFA Flow */}
        {showDisable && isMfaEnabled && (
          <div className="space-y-3 rounded-md border p-4">
            <Alert variant="destructive">
              <AlertDescription>
                Disabling MFA will make your account less secure.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="disable-password">Enter your password to confirm</Label>
              <div className="flex gap-2">
                <Input
                  id="disable-password"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
                <Button
                  variant="destructive"
                  onClick={handleDisable}
                  disabled={disableMFA.isPending || !disablePassword}
                >
                  {disableMFA.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Disable
                </Button>
                <Button variant="outline" onClick={() => setShowDisable(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
