import { mock } from 'bun:test'

// Mock axios instance
export const mockAxios = {
  get: mock(() => Promise.resolve({ data: {} })),
  post: mock(() => Promise.resolve({ data: {} })),
  put: mock(() => Promise.resolve({ data: {} })),
  patch: mock(() => Promise.resolve({ data: {} })),
  delete: mock(() => Promise.resolve({ data: {} })),
  create: mock(() => mockAxios),
  defaults: {
    headers: {
      common: {},
    },
  },
  interceptors: {
    request: {
      use: mock(() => 0),
      eject: mock(() => {}),
    },
    response: {
      use: mock(() => 0),
      eject: mock(() => {}),
    },
  },
}

export default mockAxios
