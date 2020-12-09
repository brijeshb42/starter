/** @jsx h */
import { h } from 'preact';
import { Mark, MarkSpec } from 'prosemirror-model';
import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';

import { ExtensionType, IExtension, IInitOpts } from '../base';
import FormInput, { IField } from '../components/FormInput';
import FloatViewPlugin from './floatView';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';

interface ILinkOptions {
  openOnClick?: boolean;
  floatPlugin: FloatViewPlugin;
}

export default class Link implements IExtension {
  name = 'link';
  type = ExtensionType.Mark;
  private editor: EditorView;
  constructor(private options?: ILinkOptions) { }

  init({ editor }: IInitOpts) {
    this.editor = editor;
  }

  getSchema() {
    const spec: MarkSpec = {
      attrs: {
        href: {
          default: '',
        },
        title: {
          default: '',
        },
        newTab: {
          default: false,
        },
      },
      inclusive: false,
      parseDOM: [{
        tag: 'a[href]',
        getAttrs(node: string | Node) {
          if (typeof node === 'string') {
            return null;
          }

          return {
            href: (node as Element).getAttribute('href') || '',
            title: (node as Element).getAttribute('title') || '',
            newTab: (node as Element).getAttribute('target') === '_blank',
          };
        }
      }],
      toDOM(mark: Mark) {
        return ['a', {
          title: mark.attrs.title,
          href: mark.attrs.href,
          target: mark.attrs.newTab ? '_blank' : undefined,
          rel: 'noopener noreferrer nofollow',
        }, 0];
      }
    };

    return spec;
  }

  getKeyMaps() {
    return {
      'Mod-k': {
        description: 'Add link to selected text or update metadata if cursor is inside a link',
        handler: (state: EditorState, dispatch?: (tr: Transaction) => void) => {
          const floatPlugin = this.options?.floatPlugin;
          if (!floatPlugin) {
            return false;
          }

          const { selection } = state;
          const node = state.doc.nodeAt(selection.from);
          if (!node) {
            return false;
          }

          const values = {
            title: '',
            href: '',
            newTab: false,
          };
          const mark = node.marks.find((m) => m.type.name === this.name);
          if (!mark) {
            if (selection.empty) {
              return false;
            }
          } else {
            values.href = mark.attrs.href || '';
            values.title = mark.attrs.title || '';
            values.newTab = mark.attrs.newTab || false;
          }

          const fields: IField[] = [{
            type: 'text',
            label: 'Link URL',
            value: values.href,
            name: 'href',
          }, {
            type: 'text',
            label: 'Link Title',
            value: values.title,
            name: 'title',
          }, {
            type: 'boolean',
            label: 'Should open in new tab',
            value: values.newTab,
            name: 'newTab',
          }];

          this.editor.dispatch(this.editor.state.tr.setMeta('dummySelection', {
            from: selection.from,
            to: selection.to,
          }));
          const newState = this.editor.state;
          floatPlugin.mount(
            <FormInput
              fields={fields}
              title="Add link details"
              onSubmit={(values) => {
                floatPlugin.unmount();

                // avoid any descrepancy
                if (newState !== this.editor.state) {
                  return;
                }
                let tr = state.tr;
                if (!values.href) {
                  if (mark) {
                    tr = tr.removeMark(selection.from, selection.to, state.schema.marks[this.name]);
                  }
                } else {
                  tr = tr.addMark(selection.from, selection.to, state.schema.marks[this.name].create(values)).scrollIntoView();
                }

                if (tr === state.tr) {
                  return;
                }
                if (dispatch) {
                  dispatch(tr);
                  this.editor.focus();
                }
              }}
              submitText="Done"
            />
          );
          return false;
        },
      }
    }
  }

  getPlugins() {
    const key = new PluginKey('linkDecoration');
    const plugin = new Plugin({
      key,
      state: {
        init: () => { },
        apply: (tr: Transaction) => {
          const pos = tr.getMeta('dummySelection') as { from: number, to: number };
          if (!pos) {
            return null;
          }

          return DecorationSet.create(tr.doc, [
            Decoration.inline(pos.from, pos.to, {
              class: 'dummySelection',
            }),
          ]);
        },
      },
      props: {
        handleClick: (view, pos, ev) => {
          const openOnClick = this.options?.openOnClick ?? true;
          if (!openOnClick) {
            return false;
          }
          if (!(ev.ctrlKey && ev.altKey)) {
            return false;
          }
          const node = view.state.doc.nodeAt(pos);
          if (!node || !node.marks.length) {
            return false;
          }

          const mark = node.marks.find((m) => m.type.name === this.name);
          if (!mark) {
            return false;
          }

          ev.preventDefault();
          ev.stopPropagation();
          window.open(mark.attrs.href);
          return true;
        },
        decorations(state) {
          return this.getState(state);
        },
      },
    });
    return [plugin];
  }
}