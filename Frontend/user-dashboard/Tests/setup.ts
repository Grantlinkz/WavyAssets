/**
 * Vitest Environment Setup for WavyAssets User Dashboard
 * Provides fast, lightweight DOM and storage mocks for unit and integration testing.
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

  const navigatorMock = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    language: 'en-US',
    languages: ['en-US'],
  };

  const documentMock = {
    documentElement: {
      lang: 'en',
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
    location: { pathname: '/', hash: '', search: '' },
    navigator: navigatorMock,
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
    scrollTo: () => {},
    history: { pushState: () => {}, replaceState: () => {} },
  };

  // @ts-expect-error polyfill globals for node test runner
  globalThis.window = windowMock;
  // @ts-expect-error polyfill globals for node test runner
  globalThis.document = documentMock;
  try {
    Object.defineProperty(globalThis, 'navigator', {
      value: navigatorMock,
      configurable: true,
      writable: true,
    });
  } catch {
    // @ts-expect-error fallback
    globalThis.navigator = navigatorMock;
  }
  globalThis.localStorage = storageMock;
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}
