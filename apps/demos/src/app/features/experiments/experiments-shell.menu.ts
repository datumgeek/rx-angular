import { MENU_ITEMS as RX_STATE_MENU_ITEMS } from './state/rx-state.menu';
import { MENU_ITEMS as STRUCTURAL_DIRECTIVES } from './structural-directives/structural-directives.menu';
import { MENU_ITEMS as DIFFER_MENU_ITEMS } from './differ/differ.menu';

export const EXPERIMENTS_MENU = [
  {
    label: 'Differ',
    link: 'differ',
    children: DIFFER_MENU_ITEMS
  },
  {
    link: 'structural-directives',
    label: 'Structural Directives',
    children: STRUCTURAL_DIRECTIVES
  },
  ...RX_STATE_MENU_ITEMS
];
