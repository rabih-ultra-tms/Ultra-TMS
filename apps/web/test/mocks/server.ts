import { setupServer } from "msw/node";
import { handlers } from "./handlers";

let serverInstance: ReturnType<typeof setupServer> | null = null;

export function getServer() {
  if (!serverInstance) {
    serverInstance = setupServer(...handlers);
  }
  return serverInstance;
}
