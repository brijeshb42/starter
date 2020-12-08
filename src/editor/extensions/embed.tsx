/** @jsx h */
import { h, render } from 'preact';
import { useState } from 'preact/hooks';
import { setBlockType } from 'prosemirror-commands';
import { Node as ProsemirrorNode, NodeSpec, NodeType } from 'prosemirror-model';
import { EditorState, Selection, Transaction } from 'prosemirror-state';
import { EditorView, NodeView } from 'prosemirror-view';

import FormInput, { IField } from '../components/FormInput';
import { ExtensionType, IExtension, IInitOpts, IKeymapOptions, KeyHandler } from '../base';
import { isInParentNodeOfType } from '../commands/block';
import FloatViewPlugin from './floatView';
import { keymap } from 'prosemirror-keymap';

function IFrameComponent({ src }: { src: string }): JSX.Element {
  const [ show, setShow ] = useState<boolean>(false);

  function renderInfo() {
    return (
      <p className="embed-info">
        <code>{src}</code>
        <br />
        <button onClick={() => setShow(true)}>
          Show
        </button>
      </p>
    );
  }

  function renderIframe() {
    return (
      <iframe
        src={src}
        allowFullScreen
        width={400}
        height={200}
      />
    );
  }
  return (
    <div className="iframe-container">
      {src ? (
        show ? renderIframe() : renderInfo()
      ) : (
        <p className="embed-info">
          Add embed url by pressing the relevant shortcut
        </p>
      )}
    </div>
  );
}

class EmbedView implements NodeView {
  dom: HTMLElement;
  contentDOM: HTMLElement;
  private innerDOM: HTMLElement;

  constructor(private node: ProsemirrorNode) {
    this.dom = document.createElement('figure');
    this.innerDOM = document.createElement('div');
    this.dom.appendChild(this.innerDOM);
    this.dom.setAttribute('data-embed', node.attrs.src || '');
    this.contentDOM = document.createElement('figcaption');
    this.dom.appendChild(this.contentDOM);
    this.render();
  }

  private render() {
    render(<IFrameComponent src={this.node.attrs.src as string} />, this.innerDOM);
  }

  update(node: ProsemirrorNode) {
    if (node.type.name !== 'embed') {
      return false;
    }

    this.node = node;
    this.dom.setAttribute('data-embed', node.attrs.src || '');
    this.render();
    return true;
  }

  destroy() {
    render(null, this.innerDOM);
  }
}

interface ICodeBlockOptions {
  floatPlugin?: FloatViewPlugin;
}

export default class Embed implements IExtension {
  name = 'embed';
  type = ExtensionType.Node;
  editor: EditorView;

  constructor(private options?: ICodeBlockOptions) {}

  init({ editor }: IInitOpts) {
    this.editor = editor;
  }

  getSchema() {
    const schema: NodeSpec = {
      content: 'text*',
      group: 'block',
      defining: true,
      draggable: true,
      attrs: {
        src: {
          default: '',
        },
      },
      parseDOM: [{
        tag: 'figure[data-embed]',
        contentElement: 'figcaption',
        getAttrs(node: string | Node) {
          return {
            src: typeof node === 'string' ? '' : (node as Element).getAttribute('data-embed') || '',
          };
        }
      }],
      toDOM(node: ProsemirrorNode) {
        return ['figure', 0];
      }
    };
    return schema;
  }

  getKeyMaps(options?: IKeymapOptions) {
    const { type } = options!;
    return {
      'Mod-Alt-e': {
        description: `Toggle block type to/from embed`,
        handler: setBlockType(type as NodeType, {
          src: '',
        }),
      },
      'Mod-Alt-E': {
        description: 'Update metadata of embed block',
        handler: (state: EditorState, dispatch?: (tr: Transaction) => void) => {
          if (!isInParentNodeOfType(state, this.name)) {
            return false;
          }

          const floatPlugin = this.options?.floatPlugin ?? null;

          const { $from } = state.selection;
          const parent = $from.parent;

          if (!floatPlugin) {
            const newSrc = prompt('Please enter the embed url', parent.attrs.src || '');

            if (newSrc && newSrc !== parent.attrs.src && dispatch) {
              dispatch(state.tr.setNodeMarkup($from.before($from.depth), undefined, {
                src: newSrc,
              }));
            }
          } else {
            const values = {
              src: parent.attrs.src || '',
            };
            const fields: IField[] = [{
              type: 'text',
              label: 'Enter embed source',
              value: values.src,
              name: 'src',
            }];
            floatPlugin.mount(
              <FormInput
                fields={fields}
                title="Update embed url"
                submitText="Update"
                onSubmit={(values) => {
                  floatPlugin.unmount();
                  this.editor.dispatch(state.tr.setNodeMarkup($from.before($from.depth), undefined, values));
                  this.editor.focus();
                }}
              />
             );
          }

          return true;
        },
      },
    };
  };

  getNodeView(node: ProsemirrorNode /*, view: EditorView, getPos: boolean | (() => number) */): NodeView {
    return new EmbedView(node);
  }

  getHandler(direction: 'up' | 'left'): KeyHandler {
    return (state: EditorState, dispatch?: (tr: Transaction) => void) => {
      const { selection: { $from, $head }, selection } = state;
      const parent = $from.parent;

      if (parent.type.name !== this.name) {
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