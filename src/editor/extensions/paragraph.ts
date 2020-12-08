import {
  Node as ProsemirrorNode,
  NodeSpec,
  NodeType,
} from 'prosemirror-model';
import { setBlockType } from 'prosemirror-commands';

import { IExtension, ExtensionType, IKeymapOptions, ALIGNMENT } from '../base';

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
        getAttrs(node: string | Node) {
          if (typeof node === 'string') {
            return null;
          }

          const className = (node as Element).className;
          const align = className.includes('left') ? 'left' : className.includes('right') ? 'right' : className.includes('center') ? 'center' : ''; 
          return {
            align,
          };
        },
      }],
      toDOM(node: ProsemirrorNode) {
        const { align } = node.attrs;

        if (!align) {
          return ['p', 0];
        }

        return ['p', {
          class: ALIGNMENT[align as 'left' | 'right' | 'center'],
        }, 0];
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
