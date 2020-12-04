import { Node as ProsemirrorNode, NodeSpec, NodeType } from 'prosemirror-model';

import { ExtensionType, IExtension, IKeymapOptions } from '../base';
import { toggleBlockType } from '../commands/block';

interface ICodeBlockOptions {
  defaultBlockType: string;
  marks?: string;
}

export default class CodeBlock implements IExtension {
  name = 'code';
  type = ExtensionType.Node;

  constructor(private options?: ICodeBlockOptions) {}

  getSchema() {
    return {
      content: 'text*',
      marks: this.options?.marks || '',
      group: 'block',
      code: true,
      defining: true,
      draggable: false,
      attrs: {
        language: {
          default: '',
        },
      },
      parseDOM: [{
        tag: 'pre[data-language]',
        preserveWhitespace: 'full',
        getAttrs(node: string | Node) {
          if (typeof node === 'string') {
            return null;
          }

          return {
            language: (node as Element).getAttribute('data-language'),
          };
        },
      }],
      toDOM(node: ProsemirrorNode) {
        const { language = '' } = node.attrs!;
        return [
          'pre', {
            'data-language': language,
            spellcheck: 'false',
            class: 'bg-gray-100 p-2 border mb-2'
          },
          ['code', 0],
        ];
      },
    } as NodeSpec;
  }

  getKeyMaps({ type, schema }: IKeymapOptions) {
    return {
      'Mod-/': {
        description: '',
        handler: toggleBlockType(type as NodeType, schema.nodes[this.options?.defaultBlockType || 'paragraph'] || type),
      }
    }
  }
}