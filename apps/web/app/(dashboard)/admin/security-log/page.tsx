"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/shared";
import {
  useRevokeAllSessions,
  useRevokeSession,
  useSessionLogs,
} from "@/lib/hooks/admin/use-security-log";

export default function SecurityLogPage() {
  const sessionsQuery = useSessionLogs();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllSessionsMutation = useRevokeAllSessions();
  const sessions = sessionsQuery.data?.data ?? [];
  const errorMessage = sessionsQuery.error
    ? sessionsQuery.error instanceof Error
      ? sessionsQuery.error.message
      : "Failed to load sessions"
    : null;

  const handleRevokeSession = (sessionId: string) => {
    if (!confirm("Are you sure you want to revoke this session?")) return;
    revokeSessionMutation.mutate(sessionId);
  };

  const handleRevokeAllSessions = async () => {
    if (
      !confirm(
        "Are you sure you want to revoke all sessions? You will be logged out."
      )
    ) return;

    try {
      await revokeAllSessionsMutation.mutateAsync();
      window.location.href = "/login";
    } catch {
      // handled by mutation
    }
  };

  if (sessionsQuery.isLoading) {
    return <LoadingState message="Loading security log..." />;
  }

  if (errorMessage) {
    return (
      <ErrorState
        message={errorMessage}
        onRetry={() => sessionsQuery.refetch()}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Log</h1>
            <p className="mt-1 text-sm text-gray-600">
              View your active sessions and login history
            </p>
          </div>
          <button
            onClick={handleRevokeAllSessions}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Revoke All Sessions
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-slate-900 mb-4">
            Active Sessions
          </h2>
          
          {sessions.length === 0 ? (
            <EmptyState
              title="No active sessions"
              description="Session tracking endpoint needs to be implemented in the backend."
            />
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {session.userAgent}
                        </div>
                        <div className="text-sm text-gray-500">
                          IP: {session.ipAddress}
                        </div>
                      </div>
                      {session.isActive && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Last activity:{" "}
                      {new Date(session.lastActivityAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-slate-900 mb-4">
          Security Recommendations
        </h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex items-start">
            <svg
              className="h-5 w-5 text-green-500 mt-0.5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Use a strong, unique password for your account
            </span>
          </li>
          <li className="flex items-start">
            <svg
              className="h-5 w-5 text-green-500 mt-0.5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Regularly review and revoke suspicious sessions
            </span>
          </li>
          <li className="flex items-start">
            <svg
              className="h-5 w-5 text-green-500 mt-0.5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Enable multi-factor authentication when available
            </span>
          </li>
          <li className="flex items-start">
            <svg
              className="h-5 w-5 text-green-500 mt-0.5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Always log out from shared or public computers
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
