import { DOMOutputSpecArray, MarkType } from 'prosemirror-model';
import { toggleMark } from 'prosemirror-commands';

import { IExtension, ExtensionType, IKeymapOptions } from '../base';

export default class Underline implements IExtension {
  type = ExtensionType.Mark;
  name = 'underline';

  getSchema() {
    return {
      parseDOM: [
        { tag: 'u' },
      ],
      toDOM(): DOMOutputSpecArray {
        return ['u', 0];
      },
    };
  }

  getKeyMaps(options?: IKeymapOptions) {
    const type = options!.type;

    return {
      'Mod-u': {
        description: 'Underline selected text',
        handler: toggleMark(type as MarkType),
      }
    };
  }
}
