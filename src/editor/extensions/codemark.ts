import { DOMOutputSpecArray, MarkType } from 'prosemirror-model';
import { toggleMark } from 'prosemirror-commands';

import { IExtension, ExtensionType, IKeymapOptions } from '../base';

export default class CodeMark implements IExtension {
  type = ExtensionType.Mark;
  name = 'inline_code';

  getSchema() {
    return {
      parseDOM: [
        { tag: 'code[data-inline]' },
      ],
      toDOM(): DOMOutputSpecArray {
        return ['code', {
          'data-inline': 'true',
          class: 'inline-block px-2 bg-gray-100 border border-gray-400 rounded-sm text-sm'
        }, 0];
      },
    };
  }

  getKeyMaps(options?: IKeymapOptions) {
    const type = options!.type;

    return {
      'Mod-Alt-?': {
        description: 'Toggle the selection to/from inline code',
        handler: toggleMark(type as MarkType),
      },
    };
  }
}
