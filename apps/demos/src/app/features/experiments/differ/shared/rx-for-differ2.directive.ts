import {
  ChangeDetectorRef,
  Directive,
  EmbeddedViewRef,
  Input,
  IterableDiffer,
  IterableDiffers,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';

import { Observable, ObservableInput, ReplaySubject, Subscription, Unsubscribable } from 'rxjs';
import { distinctUntilChanged, map, mergeMap, shareReplay, switchAll, tap } from 'rxjs/operators';
import { Hooks } from '../../../../shared/debug-helper/hooks';
import { RxState } from '@rx-angular/state';
import { constantPluck } from './utils';
import { fromFor } from './from-for';

export interface RxForDifferViewContext<T extends object, K = keyof T> {
  $implicit?: T;
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[rxForDiffer2]',
  providers: [RxState]
})
export class RxForDiffer2Directive<U extends object> extends Hooks {
  private subscription: Unsubscribable = new Subscription();
  // private rxDiffer: RxIterableDiffer<U>;
  private differ: IterableDiffer<U>;

  observables$ = new ReplaySubject(1);
  embeddedViews: Map<U, { view: EmbeddedViewRef<any>, item: any }> = new Map();

  enter$: Observable<U>;
  move$: Observable<U>;
  identityChange$: Observable<U>;
  exit$: Observable<U>;

  array$: Observable<U[]> = this.observables$
    .pipe(
      distinctUntilChanged(),
      switchAll()
    );

  @Input()
  set rxForDiffer2(potentialObservable: ObservableInput<U> | null | undefined) {
    this.observables$.next(potentialObservable);
  }

  @Input()
  set rxForDiffer2TrackBy(trackByFnOrKey: string | ((i) => any)) {
    const trackBy = typeof trackByFnOrKey !== 'function' ? constantPluck(trackByFnOrKey) : trackByFnOrKey;
    this.state.set({ trackBy });
  }

  @Input()
  rxForDiffer2DistinctBy(distinctByFnOrKey: string | ((i) => any)) {
    const distinctBy = typeof distinctByFnOrKey !== 'function' ? constantPluck(distinctByFnOrKey) : distinctByFnOrKey;
    this.state.set({ distinctBy });
  }

  constructor(
    private state: RxState<{ trackBy: ((i) => any), distinctBy: ((i) => any) }>,
    private iterableDiffers: IterableDiffers,
    private cdRef: ChangeDetectorRef,
    private readonly templateRef: TemplateRef<RxForDifferViewContext<any>>,
    private readonly viewContainerRef: ViewContainerRef
  ) {
    super();
    this.state.set({ distinctBy: i => i, trackBy: i => i });
    this.state.hold(this.afterViewInit$.pipe(
      tap(() => {
        this.setupNgDiffer();
        this.state.hold(this.enter$, i => this.onEnter(i));
        this.state.hold(this.identityChange$, i => this.onUpdate(i));
        this.state.hold(this.exit$, i => this.onExit(i));
      }),
      )
    );
    this.state.hold(this.onDestroy$, () => this.tearDownDirective());
  }
/*
  private setupDiffer() {
    this.rxDiffer = rxIterableDifferFactory<U & object>({
      trackBy: this.state.get('trackBy')
    });
    this.rxDiffer.connect();
  }
*/
  private setupNgDiffer() {
    this.differ = this.iterableDiffers.find([]).create((idx, item) => this.state.get('trackBy')(item));

    const differResult$ = this.array$.pipe(
      map(newData => this.differ.diff(newData)),
      shareReplay(1)
    );
    this.enter$ = differResult$.pipe(fromFor<U>('forEachAddedItem'), mergeMap(a => a));
    this.move$ = differResult$.pipe(fromFor('forEachMovedItem'), mergeMap(a => a));
    this.identityChange$ = differResult$.pipe(fromFor('forEachIdentityChange'), mergeMap(a => a));
    this.exit$ = differResult$.pipe(fromFor('forEachRemovedItem'), mergeMap(a => a));
    this.cdRef.detectChanges();
  }


  private tearDownDirective() {
    this.viewContainerRef.clear();
    this.subscription.unsubscribe();
  }

  onEnter = (item: U): void => {
    const key = this.state.get('trackBy')(item);
    console.log('key', key, item);
    let existingItem = this.embeddedViews.has(key) ? this.embeddedViews.get(key) : undefined;
    if (!existingItem) {
      const view = this.viewContainerRef
        .createEmbeddedView(this.templateRef, { $implicit: item });
      existingItem = { view, item };
      this.embeddedViews.set(key, existingItem);
      existingItem.view.detectChanges();
    }
  };

  onUpdate = (item: U): void => {
    const key = this.state.get('trackBy')(item);
    const existingItem = this.embeddedViews.has(key) ? this.embeddedViews.get(key) : undefined;
    console.log('onUpdate', existingItem , key);
    if (existingItem) {
      existingItem.view.context.$implicit = item;
      existingItem.view.detectChanges();
    }
  };

  onExit = (item: U): void => {
    console.log('onExit', item);
  };

}
