import {
  MarkType,
  NodeSpec,
  NodeType,
} from 'prosemirror-model';
import { setBlockType } from 'prosemirror-commands';

import { IExtension, ExtensionType } from '../base';

export default class Paragraph implements IExtension {
  type = ExtensionType.Node;
  name = 'paragraph';
  isFallbackNode = true;

  getSchema() {
    const schema: NodeSpec = {
      content: 'inline*',
      group: 'block',
      draggable: false,
      parseDOM: [{
        tag: 'p',
      }],
      toDOM() {
        return ['p', 0];
      },
    };

    return schema;
  }

  getKeyMaps(options?: { type: MarkType | NodeType }) {
    const { type } = options!;
    return {
      'Mod-G': {
        description: `Toggle block type to paragraph`,
        handler: setBlockType(type as NodeType),
      },
    };
  };
}
