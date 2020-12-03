import { DOMOutputSpecArray, MarkType, NodeType } from 'prosemirror-model';
import { toggleMark } from 'prosemirror-commands';

import { IExtension, ExtensionType } from '../base';

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

  getKeyMaps(options?: { type: MarkType | NodeType }) {
    const type = options!.type;

    return {
      'Mod-u': {
        description: 'Underline selected text',
        handler: toggleMark(type as MarkType),
      }
    };
  }
}
