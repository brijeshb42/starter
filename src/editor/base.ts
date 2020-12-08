import {
  MarkSpec,
  NodeSpec,
  MarkType,
  NodeType,
  Schema,
  Node,
} from 'prosemirror-model';
import {
  EditorState,
  Transaction,
  Plugin,
} from 'prosemirror-state';
import { Decoration, EditorView, NodeView } from 'prosemirror-view';
// import { EditorView } from 'prosemirror-view';

export enum ExtensionType {
  Mark = 'mark',
  Node = 'node',
  Plugin = 'plugin',
}

export type KeyHandler = (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;

export interface IKeymapOptions {
  type?: MarkType | NodeType,
  schema: Schema,
}

interface IKeymapResult {
  // A short description of what this key press does to populate a global list
  // to present to users if required.
  description?: string,
  handler: KeyHandler,
}

export interface IInitOpts {
  editor: EditorView;
}

export type IKeyMap = {
  [key: string]: IKeymapResult;
}

export interface IExtension {
  name: string;
  type: ExtensionType;
  // isFallbackNode?: boolean;
  init?(options: IInitOpts): void;
  getSchema?(): MarkSpec | NodeSpec;
  getPlugins?(): Plugin[];
  getKeyMaps?(options?: IKeymapOptions): IKeyMap;
  getNodeView?(node: Node, view: EditorView, getPos: boolean | (() => number), decorations: Decoration<{[key: string]: any;}>[]): NodeView;
}

export const ALIGNMENT = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};