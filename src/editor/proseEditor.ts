import { keymap } from 'prosemirror-keymap';
import { MarkSpec, Node, NodeSpec, Schema } from 'prosemirror-model';
import { EditorState, Plugin, TextSelection, Transaction } from 'prosemirror-state';
import { Decoration, EditorView, NodeView } from 'prosemirror-view';

import { ExtensionType, IExtension, IKeyMap, KeyHandler } from './base';
import { HistoryPlugin } from './extensions/history';
import BaseKeymapPlugin from './extensions/keymap';

interface IOptions {
  extensions?: IExtension[];
  useDefaultExtensions?: boolean;
  doc?: any;
}

const defaultOptions: IOptions = {
  useDefaultExtensions: true,
  extensions: [],
};

export default class ProseEditor {
  private extensions: IExtension[] = [];
  private plugins: Plugin[] = [];
  private schema: Schema;
  private keyMaps: IKeyMap;
  private state: EditorState;
  editor: EditorView;

  constructor(private node: HTMLElement, private options: IOptions = defaultOptions) {
    const extensions = this.options.extensions || [];

    if (options.useDefaultExtensions) {
      const defaultExtensions: IExtension[] = [new BaseKeymapPlugin(), new HistoryPlugin()];
      this.extensions = defaultExtensions.concat(extensions);
    } else {
      this.extensions = extensions;
    }

    this.generateSchema();
    this.generatePlugins();
    this.generateKeyMaps();
    this.generateState();
    this.generateView();
  }

  getEditor() {
    return this.editor!;
  }

  private generateView() {
    if (!this.editor) {
      this.editor = new EditorView(this.node, {
        state: this.state,
        dispatchTransaction: (tr: Transaction) => {
          this.state = this.state.apply(tr);
          this.editor.updateState(this.state);
        },
        nodeViews: this.extensions
          .filter(ext => ext.type !== ExtensionType.Plugin && !!ext.getNodeView)
          .reduce((acc, ext) => {
            acc[ext.name] = (...args) => ext.getNodeView!(...args);
            return acc;
          }, {} as {
            [name: string]: (
              node: Node,
              view: EditorView,
              getPos: (() => number) | boolean,
              decorations: Decoration<{ [key: string]: any; }>[]
            ) => NodeView
          }),
      });
      this.extensions.filter(ext => !!ext.init).forEach(ext => ext.init!({
        editor: this.editor,
      }))
    }
    return this.editor;
  }

  private generateSchema() {
    const marks: { [key: string]: MarkSpec } = {};
    const nodes: { [key: string]: NodeSpec } = {};

    this.extensions.forEach(ext => {
      if (ext.type === ExtensionType.Mark) {
        const spec = ext.getSchema && ext.getSchema();

        if (spec) {
          marks[ext.name] = spec as MarkSpec;
        }
      } else if (ext.type === ExtensionType.Node) {
        const spec = ext.getSchema && ext.getSchema();

        if (spec) {
          nodes[ext.name] = spec as NodeSpec;
        }
      }
    });
    this.schema = new Schema({
      marks,
      nodes,
    });
  }

  private generatePlugins() {
    this.plugins = this.extensions.filter(ext => !!ext.getPlugins).reduce((allPlugins, ext) => {
      const extPlugins = ext.getPlugins!();
      if (extPlugins.length) {
        Array.prototype.push.apply(allPlugins, extPlugins);
      }
      return allPlugins;
    }, []);
  }

  private generateKeyMaps() {
    const initKeyMaps: IKeyMap = {};
    this.keyMaps = this.extensions.reduce((allKeyMap, ext) => {
      const type = ext.type !== ExtensionType.Plugin ? this.schema[ext.type === 'node' ? 'nodes' : 'marks'][ext.name] : undefined;
      const keyMaps = ext.getKeyMaps && ext.getKeyMaps({
        type,
        schema: this.schema,
      });

      if (keyMaps) {
        allKeyMap = {
          ...allKeyMap,
          ...keyMaps,
        }
      }

      return allKeyMap;
    }, initKeyMaps);
  }

  private generateState() {
    this.state = EditorState.create({
      doc: this.options.doc,
      schema: this.schema,
      plugins: [
        ...this.plugins,
        keymap(Object.keys(this.keyMaps).reduce((acc, key) => {
          acc[key] = this.keyMaps[key].handler;
          return acc;
        }, {} as { [key: string]: KeyHandler })),
      ],
    });
  }

  setDoc(data: Object) {
    const { tr, doc } = this.editor.state;
    const newDoc = this.schema.nodeFromJSON(data);
    const selection = TextSelection.create(doc, 0, doc.content.size);
    const transaction = tr.setSelection(selection).replaceSelectionWith(newDoc, false);
    this.editor.dispatch(transaction);
  }
}