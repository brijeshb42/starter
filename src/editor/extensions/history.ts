import { history, undo, redo } from 'prosemirror-history';

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
    ]
  }
}