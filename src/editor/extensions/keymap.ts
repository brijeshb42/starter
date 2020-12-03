import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';

import { IExtension, ExtensionType } from '../base';

export default class BaseKeymapPlugin implements IExtension {
  type = ExtensionType.Plugin;
  name = 'base_keymap';

  getPlugins() {
    return [
      keymap(baseKeymap),
    ];
  }
}
