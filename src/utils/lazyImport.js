import { lazy } from 'react';

export function lazyWithRetry(componentImport) {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      window.location.reload();
      throw error;
    }
  });
}
