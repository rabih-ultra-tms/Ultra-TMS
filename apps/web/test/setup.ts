import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import { TextDecoder, TextEncoder } from "util";
import { ReadableStream, TransformStream, WritableStream } from "web-streams-polyfill";
import { MessageChannel, MessagePort } from "worker_threads";

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder as unknown as typeof globalThis.TextEncoder;
}
if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder;
}
if (!globalThis.ReadableStream) {
  globalThis.ReadableStream = ReadableStream as unknown as typeof globalThis.ReadableStream;
}
if (!globalThis.TransformStream) {
  globalThis.TransformStream = TransformStream as unknown as typeof globalThis.TransformStream;
}
if (!globalThis.WritableStream) {
  globalThis.WritableStream = WritableStream as unknown as typeof globalThis.WritableStream;
}
if (!globalThis.MessagePort) {
  globalThis.MessagePort = MessagePort as unknown as typeof globalThis.MessagePort;
}
if (!globalThis.MessageChannel) {
  globalThis.MessageChannel = MessageChannel as unknown as typeof globalThis.MessageChannel;
}
if (!globalThis.BroadcastChannel) {
  class MockBroadcastChannel {
    name: string;
    onmessage: ((event: MessageEvent) => void) | null = null;

    constructor(name: string) {
      this.name = name;
    }

    postMessage() {
      // no-op
    }

    close() {
      // no-op
    }

    addEventListener() {
      // no-op
    }

    removeEventListener() {
      // no-op
    }
  }

  globalThis.BroadcastChannel = MockBroadcastChannel as unknown as typeof globalThis.BroadcastChannel;
}

const { fetch, Headers, Request, Response } = await import("undici");

if (!globalThis.fetch) {
  globalThis.fetch = fetch as unknown as typeof globalThis.fetch;
}
if (!globalThis.Headers) {
  globalThis.Headers = Headers as unknown as typeof globalThis.Headers;
}
if (!globalThis.Request) {
  globalThis.Request = Request as unknown as typeof globalThis.Request;
}
if (!globalThis.Response) {
  globalThis.Response = Response as unknown as typeof globalThis.Response;
}

const { server } = await import("./mocks/server");

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
