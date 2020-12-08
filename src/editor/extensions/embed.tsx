import * as React from 'react';
import { setBlockType } from 'prosemirror-commands';
import { Node as ProsemirrorNode, NodeSpec, NodeType } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView, NodeView } from 'prosemirror-view';

import FormInput, { IField } from '../components/FormInput';
import { ExtensionType, IExtension, IInitOpts, IKeymapOptions } from '../base';
import { isInParentNodeOfType } from '../commands/block';
import FloatViewPlugin from './floatView';
import { keymap } from 'prosemirror-keymap';

class EmbedView implements NodeView {
  dom: HTMLElement;
  contentDOM: HTMLElement;
  private iframe: HTMLIFrameElement;
  private appended = false;

  constructor(private node: ProsemirrorNode, private view: EditorView, private getPos: boolean | (() => number)) {
    this.dom = document.createElement('figure');
    this.iframe = document.createElement('iframe');
    this.iframe.height = '200';
    this.iframe.width = '400';
    this.iframe.allowFullscreen = true;
    this.addIframe();
    this.dom.setAttribute('data-embed', node.attrs.src || '');
    this.contentDOM = document.createElement('figcaption');
    this.dom.appendChild(this.contentDOM);
  }

  private addIframe(oldSrc = '') {
    const { src } = this.node.attrs;

    if (src === oldSrc || !src) {
      return;
    }

    this.iframe.src = this.node.attrs.src;
    if (!this.appended) {
      this.dom.prepend(this.iframe);
      this.appended = true;
    }
  }

  update(node: ProsemirrorNode) {
    if (node.type.name !== 'embed') {
      return false;
    }

    const oldSrc = this.node.attrs.src;
    this.node = node;
    this.addIframe(oldSrc);
    return true;
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
      defining: false,
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
        return ['figure', {
          'data-embed': node.attrs.src || '',
        }, 0];
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

  getNodeView(node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number)): NodeView {
    return new EmbedView(node, view, getPos);
  }

  getPlugins() {
    return [
      keymap({
        'ArrowUp': (state: EditorState, dispatch?: (tr: Transaction) => void) => {
          const { $from } = state.selection;
          const parent = $from.parent;

          if (parent.type.name !== this.name) {
            return false;
          }
          console.log(state, dispatch);
          return false;
        },
      }),
    ];
  }
}