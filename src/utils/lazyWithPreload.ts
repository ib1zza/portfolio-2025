/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy, type ComponentType } from "react";

export interface PreloadedComponent<T extends ComponentType<any>> {
  Component: ReturnType<typeof lazy<T>>;
  preload: () => Promise<T>;
  getLoaded: () => T | null;
}

export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T } | any>
): PreloadedComponent<T> {
  let loadedComponent: T | null = null;
  let promise: Promise<T> | null = null;

  const LazyComponent = lazy(() =>
    factory().then((module) => {
      const component = module.default || module;
      loadedComponent = component;
      return { default: component };
    })
  );

  return {
    Component: LazyComponent,
    preload: () => {
      if (loadedComponent) {
        return Promise.resolve(loadedComponent);
      }
      if (!promise) {
        promise = factory().then((module) => {
          const component = module.default || module;
          loadedComponent = component;
          return component;
        });
      }
      return promise;
    },
    getLoaded: () => loadedComponent,
  };
}
