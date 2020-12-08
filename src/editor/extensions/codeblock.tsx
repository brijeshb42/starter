import * as React from 'react';
import { Node as ProsemirrorNode, NodeSpec, NodeType } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';

import { ExtensionType, IExtension, IInitOpts, IKeyMap, IKeymapOptions } from '../base';
import FormInput, { IField } from '../components/FormInput';
import { isInParentNodeOfType, toggleBlockType } from '../commands/block';
import FloatViewPlugin from './floatView';
import { EditorView } from 'prosemirror-view';

interface ICodeBlockOptions {
  defaultBlockType?: string;
  marks?: string;
  floatPlugin?: FloatViewPlugin;
}

export default class CodeBlock implements IExtension {
  name = 'code';
  type = ExtensionType.Node;
  editor: EditorView;

  constructor(public options?: ICodeBlockOptions) {}

  init({ editor }: IInitOpts) {
    this.editor = editor;
  }

  getSchema() {
    return {
      content: 'text*',
      marks: this.options?.marks || '',
      group: 'block',
      code: true,
      defining: true,
      draggable: false,
      attrs: {
        language: {
          default: '',
        },
        showLineNumbers: {
          default: true,
        }
      },
      parseDOM: [{
        tag: 'pre[data-language]',
        preserveWhitespace: 'full',
        getAttrs(node: string | Node) {
          if (typeof node === 'string') {
            return null;
          }

          return {
            language: (node as Element).getAttribute('data-language'),
            showLineNumbers: false,
          };
        },
      }],
      toDOM(node: ProsemirrorNode) {
        const { language = '' } = node.attrs!;
        return [
          'pre', {
            'data-language': language,
            spellcheck: 'false',
          },
          ['code', 0],
        ];
      },
    } as NodeSpec;
  }

  getKeyMaps({ type, schema }: IKeymapOptions) {
    const keyMaps: IKeyMap = {
      'Mod-Alt-/': {
        description: '',
        handler: toggleBlockType(type as NodeType, schema.nodes[this.options?.defaultBlockType || 'paragraph'] || type),
      },
      'Mod-Alt-L': {
        description: 'Set language and other metadata of a code block',
        handler: (state: EditorState, dispatch?: (tr: Transaction) => void) => {
          const floatPlugin = this.options?.floatPlugin ?? null;

          if (!isInParentNodeOfType(state, this.name)) {
            return false;
          }

          const { $from } = state.selection;
          const parent = $from.parent;

          if (!floatPlugin) {
            const newLang = prompt('Please enter the language for the code block', parent.attrs.language);

            if (newLang && newLang !== parent.attrs.language && dispatch) {
              dispatch(state.tr.setNodeMarkup($from.before($from.depth), undefined, {
                language: newLang,
              }));
            }

            return true;
          }

          const values = {
            language: parent.attrs.language || '',
            showLineNumbers: parent.attrs.showLineNumbers || false,
          };

          const fields: IField[] = [{
            type: 'text',
            label: 'Code language',
            value: values.language,
            name: 'language',
          }, {
            type: 'boolean',
            label: 'Show line numbers',
            value: values.showLineNumbers,
            name: 'showLineNumbers',
          }];
          
          floatPlugin.mount(
            <FormInput
              fields={fields}
              title="Update code metadata"
              submitText="Done"
              onSubmit={(values) => {
                floatPlugin.unmount();
                this.editor.dispatch(state.tr.setNodeMarkup($from.before($from.depth), undefined, values));
                this.editor.focus();
              }}
            />
          );
          return true;
        },
      }
    };

    return keyMaps;
  }
}