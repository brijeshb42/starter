import { lift, wrapIn } from 'prosemirror-commands';
import { NodeSpec } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';

import { ExtensionType, IExtension } from '../base';
import { isInParentNodeOfType } from '../commands/block';

export default class BlockQuote implements IExtension {
  name = 'blockquote';
  type = ExtensionType.Node;

  getSchema() {
    const schema: NodeSpec = {
      group: 'block',
      content: 'block*',
      defining: true,
      parseDOM: [{
        tag: 'blockquote',
      }],
      toDOM() {
        return ['blockquote', {
          class: 'border-solid border-l-4 border-blue-500 pl-3 pt-1 pb-1'
        }, 0];
      }
    };
    return schema;
  }

  getKeyMaps() {
    return {
      'Mod->': {
        description: 'Toggle block to quote',
        handler: (state: EditorState, dispatch?: (tr: Transaction) => void) => {
          if (isInParentNodeOfType(state, this.name)) {
            return lift(state, dispatch);
          }
          
          return wrapIn(state.schema['nodes'][this.name])(state, dispatch);
        },
      },
    };
  }
}