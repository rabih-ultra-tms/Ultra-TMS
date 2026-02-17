/**
 * Tracking Map Page
 *
 * Full-screen live GPS tracking for all in-transit loads.
 * Route: /operations/tracking
 * Access: dispatcher, ops_manager, admin, support (read-only)
 *
 * Architecture:
 *  - SocketProvider connects to /tracking namespace
 *  - TrackingMap handles Google Maps, markers, InfoWindow, detail panel
 *  - TrackingSidebar shows active loads list (inside TrackingMap)
 *  - Real-time positions via WebSocket; 15s polling fallback when WS down
 */

import type { Metadata } from 'next'
import { SocketProvider } from '@/lib/socket/socket-provider'
import { SOCKET_NAMESPACES } from '@/lib/socket/socket-config'
import { TrackingMap } from '@/components/tms/tracking/tracking-map'

export const metadata: Metadata = {
  title: 'Tracking Map | Ultra TMS',
  description: 'Live GPS tracking for all in-transit loads',
}

export default function TrackingMapPage() {
  return (
    <div className="flex h-full flex-col">
      <SocketProvider namespace={SOCKET_NAMESPACES.TRACKING}>
        <TrackingMap />
      </SocketProvider>
    </div>
  )
}
