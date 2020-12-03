import { keymap } from 'prosemirror-keymap';
import { MarkSpec, NodeSpec, Schema } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { ExtensionType, IExtension, IKeyMap, KeyHandler } from './base';
import { HistoryPlugin } from './extensions/history';
import BaseKeymapPlugin from './extensions/keymap';

import 'prosemirror-view/style/prosemirror.css';

interface IOptions {
  extensions?: IExtension[];
  useDefaultExtensions?: boolean;
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
  private editor: EditorView | null = null;

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

  generateView() {
    if (!this.editor) {
      this.editor = new EditorView(this.node, {
        state: this.state,
      });
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
    this.plugins = this.extensions.reduce((allPlugins, ext) => {
      const extPlugins = ext.getPlugins && ext.getPlugins();

      if (extPlugins && extPlugins.length) {
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
      schema: this.schema,
      plugins: [
        ...this.plugins,
        keymap(Object.keys(this.keyMaps).reduce((acc, key) => {
          acc[key] = this.keyMaps[key].handler;
          return acc;
        }, {} as {[key: string]: KeyHandler})),
      ],
    });
  }
}