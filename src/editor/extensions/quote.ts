import { NodeSpec } from 'prosemirror-model';
import { ExtensionType, IExtension } from '../base';
import { EditorState } from 'prosemirror-state';

interface IQuoteOptions {
  quoteNode: string;
  captionNode: string;
}

export default class Quote implements IExtension {
  name = 'quote';
  type = ExtensionType.Node;

  constructor(private options: IQuoteOptions) {}

  getSchema() {
    const schema: NodeSpec = {
      group: 'block',
      content: `${this.options.quoteNode} ${this.options.captionNode}`,
      defining: true,
      parseDOM: [{
        tag: 'blockquote[data-quote]',
      }],
      toDOM() {
        return ['blockquote', {
          'data-quote': 'true',
          class: 'border-solid border-l-4 border-blue-500 pl-3 pt-1 pb-1'
        }, 0];
      }
    };
    return schema;
  }

  getKeyMaps() {
    return {
      'Mod-"': {
        description: 'Toggle block to quote',
        handler: (state: EditorState) => {
          const { $from, $to } = state.selection;

          if (!$from.sameParent($to)) {
            return false;
          }

          if ($from.parent.type.name !== this.options.quoteNode) {
            return false;
          }

          console.log({ $from, $to });
          return false;
        },
      },
    };
  }
}