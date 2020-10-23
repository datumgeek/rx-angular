import {
  ChangeDetectorRef,
  OnDestroy,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  NextObserver,
  Observable,
  ObservableInput,
  Subscription,
  Unsubscribable,
} from 'rxjs';
import { map } from 'rxjs/operators';
import { getStrategies, RxTemplateObserver } from '@rx-angular/template';
// tslint:disable:nx-enforce-module-boundaries
import {
  createRenderAware,
  RenderAware,
} from '../../../../../../../../libs/template/src/lib/core/render-aware';
import { DEFAULT_STRATEGY_NAME } from '../../../../../../../../libs/template/src/lib/render-strategies/strategies/strategies-map';
import { getEnsureStrategy } from 'libs/template/src/lib/render-strategies/util';

/**
 * @Pipe PushPipe
 *
 * @description
 *
 * The `push` pipe serves as a drop-in replacement for the `async` pipe.
 * It contains intelligent handling of change detection to enable us
 * running in zone-full as well as zone-less mode without any changes to the code.
 *
 * The current way of binding an observable to the view looks like that:
 *  ```html
 *  {{observable$ | async}}
 * <ng-container *ngIf="observable$ | async as o">{{o}}</ng-container>
 * <component [value]="observable$ | async"></component>
 * ```
 *
 * The problem is `async` pipe just marks the component and all its ancestors as dirty.
 * It needs zone.js microtask queue to exhaust until `ApplicationRef.tick` is called to render all dirty marked
 *     components.
 *
 * Heavy dynamic and interactive UIs suffer from zones change detection a lot and can
 * lean to bad performance or even unusable applications, but the `async` pipe does not work in zone-less mode.
 *
 * `push` pipe solves that problem.
 *
 * Included Features:
 *  - Take observables or promises, retrieve their values and render the value to the template
 *  - Handling null and undefined values in a clean unified/structured way
 *  - Triggers change-detection differently if `zone.js` is present or not (`detectChanges` or `markForCheck`)
 *  - Distinct same values in a row to increase performance
 *  - Coalescing of change detection calls to boost performance
 *
 * @usageNotes
 *
 * `push` pipe solves that problem. It can be used like shown here:
 * ```html
 * {{observable$ | push}}
 * <ng-container *ngIf="observable$ | push as o">{{o}}</ng-container>
 * <component [value]="observable$ | push"></component>
 * ```
 *
 * @publicApi
 */
@Pipe({ name: 'pushRcb', pure: false })
export class PushRcbPipe<U> implements PipeTransform, OnDestroy {
  private renderedValue: U | null | undefined;
  private readonly ensureStrategy;

  private readonly subscription: Unsubscribable;
  private readonly RenderAware: RenderAware<U | null | undefined>;
  private renderCallbackSubscription: Unsubscribable = Subscription.EMPTY;

  private readonly templateObserver: RxTemplateObserver<
    U | null | undefined
  > = {
    suspense: () => (this.renderedValue = undefined),
    next: (value: U | null | undefined) => (this.renderedValue = value),
  };

  constructor(cdRef: ChangeDetectorRef) {
    this.ensureStrategy = getEnsureStrategy(getStrategies({ cdRef }));
    this.RenderAware = createRenderAware<U>({
      templateObserver: this.templateObserver,
    });
    this.subscription = this.RenderAware.subscribe();
  }

  transform<T>(
    potentialObservable: null,
    config?: string | Observable<string>,
    renderCallback?: NextObserver<U>
  ): null;
  transform<T>(
    potentialObservable: undefined,
    config?: string | Observable<string>,
    renderCallback?: NextObserver<U>
  ): undefined;
  transform<T>(
    potentialObservable: ObservableInput<T>,
    config?: string | Observable<string>,
    renderCallback?: NextObserver<U>
  ): T;
  transform<T>(
    potentialObservable: ObservableInput<T> | null | undefined,
    config: string | Observable<string> | undefined,
    renderCallback?: NextObserver<U>
  ): T | null | undefined {
    const strategyName = config || DEFAULT_STRATEGY_NAME;
    this.RenderAware.nextStrategy(this.ensureStrategy(strategyName));
    this.RenderAware.nextPotentialObservable(potentialObservable);
    this.subscribeRenderCallback(renderCallback);
    return this.renderedValue as any;
  }

  ngOnDestroy(): void {
    this.renderCallbackSubscription.unsubscribe();
    this.subscription.unsubscribe();
  }

  private subscribeRenderCallback(renderCallback?: NextObserver<U>): void {
    if (renderCallback) {
      this.renderCallbackSubscription.unsubscribe();
      this.renderCallbackSubscription = this.RenderAware.rendered$
        .pipe(map(({ value }) => value))
        .subscribe(renderCallback);
    }
  }
}
