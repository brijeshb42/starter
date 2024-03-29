import { DOMOutputSpecArray, MarkType } from 'prosemirror-model';
import { toggleMark } from 'prosemirror-commands';

import { IExtension, ExtensionType, IKeymapOptions } from '../base';

export default class Bold implements IExtension {
  type = ExtensionType.Mark;
  name = 'bold';

  getSchema() {
    return {
      parseDOM: [
        { tag: 'b' },
        { tag: 'strong' },
        { style: 'font-style=bold' },
      ],
      toDOM(): DOMOutputSpecArray {
        return ['strong', 0];
      },
    };
  }

  getKeyMaps(options?: IKeymapOptions) {
    const type = options!.type;

    return {
      'Mod-b': {
        description: 'Toggle the selection to/from bold',
        handler: toggleMark(type as MarkType),
      },
    };
  }
}
