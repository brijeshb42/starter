import {
  NodeSpec,
  NodeType,
  Node,
} from 'prosemirror-model';
import { setBlockType } from 'prosemirror-commands';

import { IExtension, ExtensionType, IKeyMap, IKeymapOptions } from '../base';

interface IHeadingOptions {
  levels: number[];
}

export default class Heading implements IExtension {
  type = ExtensionType.Node;
  name = 'heading';
  classes = ['4xl', '3xl', '2xl', 'xl', 'lg', 'base'];

  constructor(public options: IHeadingOptions = { levels: [1, 2, 3, 4, 5, 6] }) {}

  getSchema() {
    const { levels } = this.options;
    const { classes } = this;

    return {
      attrs: {
        level: {
          default: levels[0],
        },
        align: {
          default: '',
        },
      },
      marks: '',
      content: 'inline*',
      group: 'block',
      defining: true,
      draggable: false,
      parseDOM: levels.map((level: number) => ({
        tag: `h${level}`,
        attrs: { level },
      })),
      toDOM(node: Node) {
        const { level, align } = node.attrs;
        let className = `py-3 font-bold text-${classes[level - 1]}`;

        if (align) {
          className += ` text-${align}`;
        }

        return [`h${level}`, { class: className }, 0];
      },
    } as NodeSpec;
  }

  getKeyMaps(options?: IKeymapOptions) {
    const { type } = options!;
    const { levels } = this.options;

    return levels.reduce((result: IKeyMap, level: number) => {
      result[`Ctrl-Shift-${level}`] = {
        description: `Toggle block type to h${level}`,
        handler: setBlockType(type as NodeType, { level }),
      };
      return result;
    }, {} as IKeyMap);
  }
}

