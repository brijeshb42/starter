import { lift, setBlockType, wrapIn } from 'prosemirror-commands';
import { NodeType, Node as ProsemirrorNode } from 'prosemirror-model';
import { liftListItem, wrapInList } from 'prosemirror-schema-list';
import { EditorState, Transaction } from 'prosemirror-state';

import { KeyHandler } from '../base';

export function isInParentNodeOfType(state: EditorState, name: string): null | { pos: number, start: number, depth: number, node: ProsemirrorNode } {
  const { selection: { $from, $to } } = state;

  if (!$from.sameParent($to)) {
    return null;
  }

  for (let i = $from.depth; i > 0; i--) {
    const node = $from.node(i);
    if (node.type.name === name) {
      return {
        pos: i > 0 ? $from.before(i) : 0,
        start: $from.start(i),
        depth: i,
        node,
      };
    }
  }

  return null;
}

export function toggleWrap(type: NodeType): KeyHandler {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const isActive = isInParentNodeOfType(state, type.name);

    if (isActive) {
      return lift(state, dispatch);
    }

    return wrapIn(type)(state, dispatch);
  }
}

export function toggleBlockType(type: NodeType, toggleType: NodeType, attrs: Object = {}): KeyHandler {
  return function (state: EditorState, dispatch?: (tr: Transaction) => void) {
    const isActive = isInParentNodeOfType(state, type.name);

    if (isActive) {
      return setBlockType(toggleType)(state, dispatch);
    }

    return setBlockType(type, attrs)(state, dispatch);
  }
}

export default function toggleList(listType: NodeType, itemType: NodeType) {
  const listTypes = ['ordered_list', 'unordered_list'];
  return (state: EditorState, dispatch?: (tr: Transaction) => void) => {
    const { selection } = state;
    const { $from, $to } = selection;
    const range = $from.blockRange($to);

    if (!range) {
      return false;
    }

    const parentList = isInParentNodeOfType(state, listTypes[0]) || isInParentNodeOfType(state, listTypes[1]);

    if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
      if (parentList.node.type === listType) {
        return liftListItem(itemType)(state, dispatch);
      }

      if (listTypes.includes(parentList.node.type.name) && listType.validContent(parentList.node.content)) {
        const { tr } = state
        tr.setNodeMarkup(parentList.pos, listType)

        if (dispatch) {
          dispatch(tr)
        }

        return false
      }
    }

    return wrapInList(listType)(state, dispatch)
  }
}