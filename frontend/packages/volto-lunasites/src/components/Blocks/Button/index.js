import Edit from './Edit';
import View from './View';
import buttonSVG from '@plone/volto/icons/bold.svg';

export default {
  id: 'lunaButton',
  title: 'Luna Button',
  icon: buttonSVG,
  group: 'common',
  view: View,
  edit: Edit,
  restricted: false,
  mostUsed: true,
  sidebarTab: 1,
  blockHasOwnFocusManagement: true,
  defaults: {
    text: 'Button',
    buttonType: 'filled',
    color: 'primary',
    size: 'm',
    width: 'fit',
    align: 'left',
  },
};