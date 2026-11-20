import { Signal, computed, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, combineLatest, debounceTime, map, of, startWith, switchMap } from 'rxjs';

export type AsyncState<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly notFound: boolean };

const LOADING = { status: 'loading' } as const;

function withState<T>(source$: Observable<T>): Observable<AsyncState<T>> {
  return source$.pipe(
    map((data): AsyncState<T> => ({ status: 'success', data })),
    startWith(LOADING),
    catchError((error: unknown) =>
      of<AsyncState<T>>({ status: 'error', notFound: (error as { status?: number })?.status === 404 }),
    ),
  );
}

export interface ApiResource<T> {
  readonly state: Signal<AsyncState<T>>;
  /** Data when loaded, otherwise `undefined`. */
  readonly data: Signal<T | undefined>;
  readonly loading: Signal<boolean>;
  readonly error: Signal<boolean>;
  /** True when the API answered 404. */
  readonly notFound: Signal<boolean>;
  reload(): void;
}

/**
 * Signal-based wrapper around an HTTP call. Re-runs the loader whenever the
 * `params` signal changes (optionally debounced) or `reload()` is called.
 * Must be created in an injection context (e.g. a component field initializer).
 */
export function apiResource<P, T>(
  params: () => P,
  loader: (params: P) => Observable<T>,
  options: { debounceMs?: number } = {},
): ApiResource<T> {
  const reloadCounter = signal(0);
  const params$ = toObservable(computed(params));
  const debounced$ = options.debounceMs ? params$.pipe(debounceTime(options.debounceMs)) : params$;

  const state = toSignal(
    combineLatest([debounced$, toObservable(reloadCounter)]).pipe(switchMap(([p]) => withState(loader(p)))),
    { initialValue: LOADING as AsyncState<T> },
  );

  return {
    state,
    data: computed(() => {
      const s = state();
      return s.status === 'success' ? s.data : undefined;
    }),
    loading: computed(() => state().status === 'loading'),
    error: computed(() => state().status === 'error'),
    notFound: computed(() => {
      const s = state();
      return s.status === 'error' && s.notFound;
    }),
    reload: () => reloadCounter.update((n) => n + 1),
  };
}
