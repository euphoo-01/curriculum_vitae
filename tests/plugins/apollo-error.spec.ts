import { describe, it, expect, vi, beforeEach } from 'vitest';
import apolloErrorPlugin from '../../app/plugins/apollo-error';
import type { Operation, Observable, FetchResult } from '@apollo/client/core';
import type { ErrorResponse } from '@apollo/client/link/error';
import type { NuxtApp } from 'nuxt/app';

const mockRefresh = vi.fn();
const mockLogout = vi.fn();
const { mockNavigateTo } = vi.hoisted(() => ({
  mockNavigateTo: vi.fn(),
}));
const mockRefreshTokenValue = vi.fn();

vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $apollo: { defaultClient: {} },
  }),
  useRuntimeConfig: () => ({
    app: {
      buildId: 'test-id',
      baseURL: '/',
      buildAssetsDir: '/_nuxt/',
    },
  }),
  defineNuxtPlugin: (fn: any) => fn,
  navigateTo: mockNavigateTo,
}));

vi.mock('../../app/stores/auth', () => ({
  useAuthStore: () => ({
    get refreshTokenCookie() {
      return { value: mockRefreshTokenValue() };
    },
    refresh: mockRefresh,
    logout: mockLogout,
  }),
}));

vi.stubGlobal(
  '$fetch',
  vi.fn(() => Promise.resolve({}))
);

const mockConcat = vi.fn().mockImplementation(() => ({ name: 'linked-chain' }));
const mockOnErrorCallback = vi.fn();

vi.mock('@apollo/client/link/error', () => ({
  onError: (cb: (error: ErrorResponse) => Observable<FetchResult> | void) => {
    mockOnErrorCallback(cb);
    return { concat: mockConcat };
  },
}));

vi.mock('@apollo/client/core', () => ({
  fromPromise: (promise: Promise<unknown>) => {
    return {
      filter: () => ({
        flatMap: () => {
          promise.catch(() => {});
          return 'mocked-observable-chain';
        },
      }),
    };
  },
}));

interface MockApolloClient {
  link: unknown;
  setLink: ReturnType<typeof vi.fn>;
}

interface ExtendedNuxtApp extends NuxtApp {
  $apollo: {
    defaultClient: MockApolloClient;
  };
}

describe('Apollo Error Plugin', () => {
  let mockClient: MockApolloClient;
  let nuxtAppMock: ExtendedNuxtApp;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = {
      link: { name: 'initial-link' },
      setLink: vi.fn(),
    };
    nuxtAppMock = {
      $apollo: {
        defaultClient: mockClient,
      },
    } as unknown as ExtendedNuxtApp;

    mockRefreshTokenValue.mockReturnValue(null);
  });

  const runPlugin = (app: ExtendedNuxtApp) => {
    apolloErrorPlugin(app as unknown as NuxtApp);
  };

  it('sets up the error link correctly', () => {
    runPlugin(nuxtAppMock);
    expect(mockClient.setLink).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'linked-chain' })
    );
  });

  it('handles UNAUTHENTICATED error and successful refresh', () => {
    mockRefreshTokenValue.mockReturnValue('valid-token');
    mockRefresh.mockResolvedValue({ access_token: 'new-token' });

    runPlugin(nuxtAppMock);
    const capturedCallback = mockOnErrorCallback.mock.calls[0][0];

    const result = capturedCallback({
      graphQLErrors: [
        {
          extensions: { code: 'UNAUTHENTICATED' },
          message: 'Unauthorized',
        },
      ],
      operation: { operationName: 'SomeQuery' } as Operation,
      forward: vi.fn(),
    });

    expect(result).toBe('mocked-observable-chain');
  });

  it('logs out if refresh fails on UNAUTHENTICATED error', async () => {
    mockRefreshTokenValue.mockReturnValue('valid-token');
    mockRefresh.mockRejectedValue(new Error('Refresh Failed'));

    runPlugin(nuxtAppMock);
    const capturedCallback = mockOnErrorCallback.mock.calls[0][0];

    capturedCallback({
      graphQLErrors: [
        {
          extensions: { code: 'UNAUTHENTICATED' },
          message: '401 Unauthorized',
        },
      ],
      operation: { operationName: 'SomeQuery' } as Operation,
      forward: vi.fn(),
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(mockLogout).toHaveBeenCalled();
  });

  it('ignores errors if operation is UpdateToken', () => {
    runPlugin(nuxtAppMock);
    const capturedCallback = mockOnErrorCallback.mock.calls[0][0];

    const result = capturedCallback({
      graphQLErrors: [
        {
          extensions: { code: 'UNAUTHENTICATED' },
          message: '401',
        },
      ],
      operation: { operationName: 'UpdateToken' } as Operation,
      forward: vi.fn(),
    });

    expect(result).toBeUndefined();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
