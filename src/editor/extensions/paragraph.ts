import {
  Node,
  NodeSpec,
  NodeType,
} from 'prosemirror-model';
import { setBlockType } from 'prosemirror-commands';

import { IExtension, ExtensionType, IKeymapOptions } from '../base';

export default class Paragraph implements IExtension {
  type = ExtensionType.Node;
  name = 'paragraph';
  isFallbackNode = true;

  getSchema() {
    const schema: NodeSpec = {
      attrs: {
        align: {
          default: '',
        },
      },
      content: 'inline*',
      group: 'block',
      draggable: false,
      parseDOM: [{
        tag: 'p',
      }],
      toDOM(node: Node) {
        const { align } = node.attrs;
        let className = 'my-2';

        if (align) {
          className += ` text-${align}`;
        }

        return ['p', { class: className }, 0];
      },
    };

    return schema;
  }

  getKeyMaps(options?: IKeymapOptions) {
    const { type } = options!;
    return {
      'Mod-Alt-.': {
        description: `Toggle block type to paragraph`,
        handler: setBlockType(type as NodeType),
      },
    };
  };
}
