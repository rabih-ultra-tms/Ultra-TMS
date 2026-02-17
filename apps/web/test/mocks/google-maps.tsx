/**
 * Manual mock for @react-google-maps/api
 *
 * Provides stub components so TrackingMap renders in jsdom without real Google Maps.
 */
import * as React from "react";
import { jest } from "@jest/globals";

export function useJsApiLoader() {
  return { isLoaded: true, loadError: undefined };
}

export function GoogleMap({
  children,
  onLoad,
}: {
  children?: React.ReactNode;
  onLoad?: (map: unknown) => void;
  [key: string]: unknown;
}) {
  React.useEffect(() => {
    if (onLoad) {
      onLoad({
        panTo: jest.fn(),
        setZoom: jest.fn(),
        fitBounds: jest.fn(),
      });
    }
  }, [onLoad]);

  return <div data-testid="google-map">{children}</div>;
}

export function Marker({
  title,
  onClick,
}: {
  title?: string;
  onClick?: () => void;
  [key: string]: unknown;
}) {
  return (
    <div data-testid={`marker-${title}`} onClick={onClick} role="button">
      {title}
    </div>
  );
}

export function InfoWindow({
  children,
}: {
  children?: React.ReactNode;
  [key: string]: unknown;
}) {
  return <div data-testid="info-window">{children}</div>;
}
