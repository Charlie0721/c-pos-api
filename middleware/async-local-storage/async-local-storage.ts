// src/middlewares/async-local-storage/async-local-storage.ts
import { AsyncLocalStorage } from 'async_hooks';

export const tenantStorage = new AsyncLocalStorage<Map<string, any>>();
