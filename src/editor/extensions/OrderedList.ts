import { AttributeSpec, NodeSpec, NodeType } from 'prosemirror-model';

import { ExtensionType, IExtension, IKeyMap, IKeymapOptions } from '../base';
import toggleList from '../commands/block';

interface IOrderedListOpts {
  childName: string;
}

export default class OrderedList implements IExtension {
  name = 'ordered_list';
  type = ExtensionType.Node;
  listTag = 'ol';
  listAttrs: {[key: string]: AttributeSpec} = {
    order: {
      default: 1,
    },
  };
  toggleKey = 'Mod-Alt-9';

  constructor(private options: IOrderedListOpts) {}

  getSchema() {
    const schema: NodeSpec = {
      attrs: this.listAttrs,
      defining: true,
      draggable: false,
      content: `${this.options.childName}+`,
      group: 'block',
      parseDOM: [{
        tag: this.listTag,
        getAttrs: (node) => {
          if (!this.listAttrs) {
            return null;
          }
          if (typeof node === 'string') {
            return null;
          }

          const order = (node as Element).getAttribute('start');

          return {
            order: order === null ? 1 : +order,
          };
        }
      },],
      toDOM: (node) => {
        if (!this.listAttrs) {
          return [this.listTag, 0];
        }
        return (node.attrs.order === 1 ? [this.listTag, 0] : [this.listTag, { start: node.attrs.order }, 0]);
      },
    };
    return schema;
  }
  
  getKeyMaps(options: IKeymapOptions): IKeyMap {
    const type = options.type as NodeType;
    return {
      [this.toggleKey]: {
        description: '',
        handler: toggleList(type, options.schema.nodes[this.options.childName]),
      },
    };
  }
}