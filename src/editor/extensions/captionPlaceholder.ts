import { Node } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { ExtensionType, IExtension } from '../base';

interface IPlaceholderOpts {
  nodeNames: {[key: string]: true};
}

export default class CaptionPlaceholder implements IExtension {
  name = 'placeholder';
  type = ExtensionType.Plugin;

  constructor(private options: IPlaceholderOpts) {}

  getPlugins() {
    return [
      new Plugin({
        props: {
          decorations: (state) => {
            const { options } = this;
            const decorations: Decoration[] = [];
            const decorate = (node: Node, pos: number) => {
              if (options.nodeNames[node.type.name] && node.type.isBlock && node.childCount === 0) {
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: 'empty-caption'
                  })
                );
              }
            };
            state.doc.descendants(decorate);
            return DecorationSet.create(state.doc, decorations);
          },
        }
      }),
    ];
  }
}