import { Component, Input } from '@angular/core';
import { isObservable, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RxState } from '@rx-angular/state';
import { TestItem, toBoolean } from '../../../../shared/debug-helper/value-provider';

@Component({
  selector: 'rxa-rx-for-value',
  template: `
    <mat-icon class="item" [ngClass]="{red:!v, green:v}" *rxLet="value$; let v">
      {{v ? 'check' : 'highlight_off'}}</mat-icon>
    <rxa-dirty-check></rxa-dirty-check>
  `,
  styles: [`
    .item.red {
      color: red;
    }
    .item.green {
      color: green;
    }
    .value.number {
    }
    .value.string {
    }
    .value.object {
    }
    .value.array {
    }
  `],
  host: {
    class: 'd-flex justify-content-center align-items-center flex-column w-100 m-1 p-1 dh-embedded-view'
  },
  providers: [RxState]
})
export class RxForValueComponent {

  value$ = this.state.select(map(s => toBoolean(s.item.value, 0.5)));

  @Input()
  set value(o: Observable<TestItem> | TestItem) {
    this.state.connect('item', isObservable(o) ? o : of(o));
  }

  constructor(public state: RxState<{ item: TestItem }>) { }

}
