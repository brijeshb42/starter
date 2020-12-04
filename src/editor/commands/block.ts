import { lift, setBlockType, wrapIn } from 'prosemirror-commands';
import { NodeType, Node } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import {
  findParentNode,
  findSelectedNodeOfType,
} from 'prosemirror-utils';

import { KeyHandler } from '../base';

export function isNodeActive(state: EditorState, type: NodeType, attrs?: Object) {
  const predicate = (node: Node) => node.type === type;
  const node = findSelectedNodeOfType(type)(state.selection)
    || findParentNode(predicate)(state.selection);

  if (!node || !attrs || !Object.keys(attrs).length) {
    return !!node;
  }

  return node.node.hasMarkup(type, attrs);
}

export function toggleWrap(type: NodeType): KeyHandler {
  return function(state: EditorState, dispatch?: (tr: Transaction) => void) {
    const isActive = isNodeActive(state, type);

    if (isActive) {
      return lift(state, dispatch);
    }

    return wrapIn(type)(state, dispatch);
  }
}

export function toggleBlockType(type: NodeType, toggleType: NodeType, attrs: Object = {}): KeyHandler {
  return function(state: EditorState, dispatch?: (tr: Transaction) => void) {
    const isActive = isNodeActive(state, type);

    if (isActive) {
      return setBlockType(toggleType)(state, dispatch);
    }

    return setBlockType(type, attrs)(state, dispatch);
  }
}

