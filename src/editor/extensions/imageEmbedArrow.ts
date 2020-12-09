import { keymap } from 'prosemirror-keymap';
import { EditorState, Selection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { ExtensionType, IExtension, IInitOpts, KeyHandler } from '../base';

interface IArrowHandlerOpts {
  nodeNames: {[key: string]: true};
}

export default class ArrowHandler implements IExtension {
  name = 'arrowHandler';
  type = ExtensionType.Plugin;
  private editor: EditorView;

  constructor(private options: IArrowHandlerOpts) {}

  init({ editor }: IInitOpts) {
    this.editor = editor;
  }

  getHandler(direction: 'up' | 'left'): KeyHandler {
    return (state: EditorState, dispatch?: (tr: Transaction) => void) => {
      const { selection: { $from, $head }, selection } = state;
      const parent = $from.parent;

      if (!this.options.nodeNames[parent.type.name]) {
        return false;
      }

      if (selection.empty && this.editor.endOfTextblock(direction)) {
        if (dispatch) {
          const nextPos = Selection.near(state.doc.resolve($head.before()), -1);
          dispatch(state.tr.setSelection(nextPos));
        }
        return true;
      }
      return false;
    }
  }

  getPlugins() {
    return [
      keymap({
        'ArrowUp': this.getHandler('left'),
        'ArrowLeft': this.getHandler('left'),
      }),
    ];
  }
}