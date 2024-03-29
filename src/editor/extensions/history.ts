import { undo, redo, history } from 'prosemirror-history';
// import { keymap } from 'prosemirror-keymap';

import { IExtension, ExtensionType } from '../base';

export class HistoryPlugin implements IExtension {
  type = ExtensionType.Plugin;
  name = 'history';

  getKeyMaps() {
    return {
      'Mod-z': {
        description: 'Undo last change',
        handler: undo,
      },
      'Mod-y': {
        description: 'Redo last change',
        handler: redo,
      }
    };
  }

  getPlugins() {
    return [
      history(),
  //     keymap({
  //       'Mod-z': undoInputRule,
  //     }),
    ];
  }
}