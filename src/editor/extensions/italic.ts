import { DOMOutputSpecArray, MarkType } from 'prosemirror-model';
import { toggleMark } from 'prosemirror-commands';

import { IExtension, ExtensionType, IKeymapOptions } from '../base';

export default class Italic implements IExtension {
  type = ExtensionType.Mark;
  name = 'italic';

  getSchema() {
    return {
      parseDOM: [
        { tag: 'i' },
        { tag: 'em' },
        { style: 'font-style=italic' },
      ],
      toDOM(): DOMOutputSpecArray {
        return ['em', 0];
      },
    };
  }

  getKeyMaps(options?: IKeymapOptions) {
    const type = options!.type;

    return {
      'Mod-i': {
        description: 'Toggle the selection to/from italic',
        handler: toggleMark(type as MarkType),
      }
    };
  }
}
