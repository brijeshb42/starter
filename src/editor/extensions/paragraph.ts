import {
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
      content: 'inline*',
      group: 'block',
      draggable: false,
      parseDOM: [{
        tag: 'p',
      }],
      toDOM() {
        return ['p', { class: 'my-2'}, 0];
      },
    };

    return schema;
  }

  getKeyMaps(options?: IKeymapOptions) {
    const { type } = options!;
    return {
      'Mod-G': {
        description: `Toggle block type to paragraph`,
        handler: setBlockType(type as NodeType),
      },
      // 'Shift-Enter': {
      //   description: 'Insert new line without creating a new paragraph',
      //   handler: (state: EditorState, dispatch?: (tr: Transaction) => void) => {
      //     const { $head, $anchor } = state.selection;
      //     if (!$head.sameParent($anchor)) {
      //       return false;
      //     }

      //     if ($head.parent.type.name === this.name) {
      //       if (dispatch) {
      //         dispatch(state.tr.insertText('\n').scrollIntoView());
      //       }
      //       return true;
      //     }

      //     return false;
      //   }
      // }
    };
  };
}
