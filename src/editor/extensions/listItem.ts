import { NodeSpec, NodeType } from 'prosemirror-model';
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list';

import { ExtensionType, IExtension, IKeyMap, IKeymapOptions } from '../base';

export default class ListItem implements IExtension {
  name = 'list_item';
  type = ExtensionType.Node;

  getSchema() {
    const schema: NodeSpec = {
      defining: true,
      draggable: false,
      parseDOM: [{ tag: 'li' }],
      toDOM() {
        return ['li', 0];
      },
      content: 'paragraph block*',
    };
    return schema;
  }
  
  getKeyMaps(options: IKeymapOptions): IKeyMap {
    const type = options.type as NodeType;
    return {
      'Enter': {
        description: '',
        handler: splitListItem(type),
      },
      'Tab': {
        description: '',
        handler: sinkListItem(type),
      },
      'Shift-Tab': {
        description: '',
        handler: liftListItem(type),
      }
    };
  }
}