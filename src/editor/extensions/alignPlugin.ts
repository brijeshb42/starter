import { EditorState, Transaction } from 'prosemirror-state';
import { ExtensionType, IExtension, IKeyMap } from '../base';
import { isInParentNodeOfType } from '../commands/block';

interface IAlignExtOptions {
  supportedBlocks: string[],
}

export default class AlignPlugin implements IExtension {
  type = ExtensionType.Plugin;
  name = 'align';

  constructor(private options?: IAlignExtOptions) {}

  getKeyMaps() {
    return [{
      type: 'left',
      key: 'L',
    }, {
      type: 'right',
      key: 'R',
    }, {
      type: 'center',
      key: 'E',
    }].reduce((result, meta) => {
      result[`Mod-${meta.key}`] = {
        description: 'Align ' + meta.type,
        handler: (state: EditorState, dispatch?: (tr: Transaction) => void) => {
          const supportedBlocks = this.options?.supportedBlocks || [];
          if (!supportedBlocks.length) {
            return false;
          }
  
          if (!supportedBlocks.some((blockName) => isInParentNodeOfType(state, blockName))) {
            return false;
          }

          if (dispatch) {
            const { $from } = state.selection;
            const parent = $from.parent;

            dispatch(state.tr.setNodeMarkup($from.before($from.depth), undefined, {
              ...parent.attrs,
              align: parent.attrs.align === meta.type ? '' : meta.type,
            }));
          }
  
          return true;
        },
      };
      return result;
    }, {} as IKeyMap);
  }
}