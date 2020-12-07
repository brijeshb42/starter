import { lift, setBlockType, wrapIn } from 'prosemirror-commands';
import { NodeType } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';

import { KeyHandler } from '../base';

export function isInParentNodeOfType(state: EditorState, name: string): boolean {
  const { selection: { $from, $to } } = state;

  if (!$from.sameParent($to)) {
    return false;
  }

  for (let i = $from.depth; i > 0; i--) {
    const node = $from.node(i);
    if (node.type.name === name) {
      return true;
    }
  }

  return false;
}

export function toggleWrap(type: NodeType): KeyHandler {
  return function(state: EditorState, dispatch?: (tr: Transaction) => void) {
    const isActive = isInParentNodeOfType(state, type.name);

    if (isActive) {
      return lift(state, dispatch);
    }

    return wrapIn(type)(state, dispatch);
  }
}

export function toggleBlockType(type: NodeType, toggleType: NodeType, attrs: Object = {}): KeyHandler {
  return function(state: EditorState, dispatch?: (tr: Transaction) => void) {
    const isActive = isInParentNodeOfType(state, type.name);

    if (isActive) {
      return setBlockType(toggleType)(state, dispatch);
    }

    return setBlockType(type, attrs)(state, dispatch);
  }
}

