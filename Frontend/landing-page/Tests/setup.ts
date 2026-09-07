/**
 * Vitest Environment Setup for Node 24+
 * Provides ultra-fast, lightweight DOM and storage mocks without undici/jsdom collisions.
 */

if (typeof window === 'undefined') {
  const store = new Map<string, string>();

  const storageMock: Storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };

  const classList = new Set<string>();

  const documentMock = {
    documentElement: {
      classList: {
        add: (cls: string) => classList.add(cls),
        remove: (cls: string) => classList.delete(cls),
        contains: (cls: string) => classList.has(cls),
      },
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };

  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  const windowMock = {
    location: { hash: '' },
    ResizeObserver: ResizeObserverMock,
    matchMedia: () => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }),
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    localStorage: storageMock,
    document: documentMock,
  };

  // @ts-expect-error polyfill globals for node test runner
  globalThis.window = windowMock;
  // @ts-expect-error polyfill globals for node test runner
  globalThis.document = documentMock;
  globalThis.localStorage = storageMock;
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}
