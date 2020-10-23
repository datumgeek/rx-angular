// EXPERIMENTAL
export {
  RenderStrategy,
  RenderStrategyFactory,
  RenderStrategyFactoryConfig,
  RxNotification,
  StrategySelection,
  renderWithLatestStrategy,
} from './lib/core/render-aware';
export { coalesceWith } from './lib/render-strategies/rxjs/operators/coalesceWith';
export { staticCoalesce } from './lib/render-strategies/static';
export { DEFAULT_STRATEGY_NAME } from './lib/render-strategies/strategies/strategies-map';
export {
  UnpatchEventsDirective,
  UnpatchEventsModule,
} from './lib/experimental/unpatch/events';
export {
  ViewportPrioModule,
  ViewportPrioDirective,
} from './lib/experimental/viewport-prio';
// @TODO clarify if we should exports this
export { getZoneUnPatchedApi, isNgZone } from './lib/core';
export { isViewEngineIvy } from './lib/experimental/core/utils/view-engine-checks.experimental';

// STABLE
export {
  TemplateManager,
  createTemplateManager,
} from './lib/core/utils/template-manager_creator';
export { RxViewContext, RxTemplateObserver } from './lib/core/model';

export {
  getStrategies,
  priorityTickMap,
  SchedulingPriority,
} from './lib/render-strategies';

export { PushPipe, PushModule } from './lib/push';
export { LetDirective, LetModule } from './lib/let';

export { TemplateModule } from './lib/template.module';
