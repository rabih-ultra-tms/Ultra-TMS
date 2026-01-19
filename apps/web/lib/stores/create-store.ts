import { create } from "zustand";
import { devtools } from "zustand/middleware";

export function createStore<T extends object>(
  name: string,
  initializer: (set: (state: Partial<T>) => void, get: () => T) => T
) {
  return create<T>()(
    devtools((set, get) => initializer((state) => set(state as Partial<T>), get), {
      name,
    })
  );
}
