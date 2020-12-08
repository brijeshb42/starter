import { IKeyMap, IKeymapOptions } from 'editor/base';
import * as monaco from 'monaco-editor';
import { exitCode } from 'prosemirror-commands';
import { Node as ProsemirrorNode } from 'prosemirror-model';
import { TextSelection, Selection, EditorState, Transaction } from 'prosemirror-state';
import { EditorView, NodeView } from 'prosemirror-view';

import CodeBlock from './codeblock';

type ICodeEditor = monaco.editor.IStandaloneCodeEditor & {
  onWillType(listener: (ev: string) => void): void;
};

function computeChange(oldVal: string, newVal: string) {
  if (oldVal == newVal) return null
  let start = 0, oldEnd = oldVal.length, newEnd = newVal.length
  while (start < oldEnd && oldVal.charCodeAt(start) == newVal.charCodeAt(start)) ++start
  while (oldEnd > start && newEnd > start &&
         oldVal.charCodeAt(oldEnd - 1) == newVal.charCodeAt(newEnd - 1)) { oldEnd--; newEnd-- }
  return {from: start, to: oldEnd, text: newVal.slice(start, newEnd)}
}

class MonacoEditorView implements NodeView {
  dom: HTMLDivElement;
  private editor: ICodeEditor
  private updating = false;
  private incomingChanges = false;
  private mod: 'metaKey' | 'ctrlKey' = /Mac/.test(navigator.platform) ? 'metaKey' : 'ctrlKey';
  private lastLang: string;

  constructor(private node: ProsemirrorNode, private view: EditorView, private getPos: (() => number) | boolean, private keyMaps?: IKeyMap) {
    this.dom = document.createElement('div');
    this.dom.className = 'monaco-container';
    this.dom.style.minHeight = '200px';
    this.editor = monaco.editor.create(this.dom, {
      value: this.node.textContent,
      lineNumbers: node.attrs.showLineNumbers ? 'on' : 'off',
      language: node.attrs.language,
      scrollBeyondLastLine: false,
      minimap: {
        enabled: false,
      },
      fontSize: 14,
      fontLigatures: true,
      contextmenu: false,
      tabSize: 2,
      insertSpaces: true,
      detectIndentation: false,
    }) as ICodeEditor;
    this.lastLang = node.attrs.language;
    setTimeout(() => {
      this.editor.layout();
    }, 20);
    this.editor.onDidChangeModelContent(() => {
      if (!this.updating) {
        this.valueChanged();
        this.forwardSelection();
      }
      this.incomingChanges = false;
      this.adjustHeight();
    });
    this.editor.onDidFocusEditorText(() => {
      this.forwardSelection();
      this.dom.classList.add('monaco-container--focussed');
    });
    this.editor.onDidBlurEditorText(() => {
      this.dom.classList.remove('monaco-container--focussed');
    });
    this.editor.onWillType(() => {
      this.incomingChanges = true;
    });
    this.editor.onKeyDown((ev) => {
      if (ev[this.mod] && ev.altKey) {
        // update language/line numbers
        if (ev.shiftKey && ev.keyCode === monaco.KeyCode.KEY_L) {
          ev.preventDefault();
          this.keyMaps!['Mod-Alt-L'].handler(this.view.state, this.view.dispatch);
          return;
        }
        
        // Toggle code block
        if (ev.keyCode === monaco.KeyCode.US_SLASH) {
          ev.preventDefault();
          this.keyMaps!['Mod-Alt-/'].handler(this.view.state, this.view.dispatch);
          this.view.focus();
          return;
        }
      }

      // exit code block
      if (ev.ctrlKey && ev.keyCode === monaco.KeyCode.Enter) {
        ev.preventDefault();
        if (exitCode(view.state, view.dispatch)) {
          view.focus();
        }
        return;
      }

      // handle undo/redo
      // commenting because it is not trivial. undo/redo in code editor will register as normal text change in the
      // main prosemirror editor and not as undo/redo stack. This is OK for now.
      // if (ev[this.mod] && (ev.keyCode === monaco.KeyCode.KEY_Z || ev.keyCode === monaco.KeyCode.KEY_Y)) {
      //   if (ev.shiftKey || ev.keyCode === monaco.KeyCode.KEY_Y) {
      //     redo(view.state, view.dispatch);
      //   } else if (ev.keyCode === monaco.KeyCode.KEY_Z) {
      //     undo(view.state, view.dispatch);
      //   }
      //   return;
      // }

      if (ev.ctrlKey || ev.shiftKey || ev.altKey || ev.metaKey) {
        return;
      }

      // move cursor outside code block seemlessly
      switch (ev.keyCode) {
        case monaco.KeyCode.UpArrow:
          ev.preventDefault();
          this.maybeEscape('line', -1);
          return;
        case monaco.KeyCode.LeftArrow:
          ev.preventDefault();
          this.maybeEscape('char', -1);
          return;
        case monaco.KeyCode.DownArrow:
          ev.preventDefault();
          this.maybeEscape('line', 1);
          return;
        case monaco.KeyCode.RightArrow:
          ev.preventDefault();
          this.maybeEscape('char', 1);
          return;
      }
    });
    this.editor.onDidChangeCursorPosition(() => {
      if (!this.updating || !this.incomingChanges) {
        this.forwardSelection();
      }
    });
    window.addEventListener('resize', this.resize);
  }

  private adjustHeight() {
    const contentHeight = this.editor.getContentHeight();
    let height = 500;
    if (contentHeight <= 200) {
      height = 200;
    } else if (contentHeight <= 500) {
      height = contentHeight;
    }
    this.dom.style.height = `${height}px`;
    this.editor.layout();
  }

  resize = () => {
    this.editor.layout();
  };

  maybeEscape(unit: 'char' | 'line', dir: 1 | -1) {
    const pos = this.editor.getPosition()!;
    const model = this.editor.getModel()!;
    const sel = this.editor.getSelection()!;
    if (!sel.isEmpty() || pos.lineNumber !== (dir < 0 ? 1 : model.getLineCount()) || (unit === 'char' && pos.column !== (dir < 0 ? 1 : model.getLineLength(pos.lineNumber) + 1))) {
      return;
    }
    this.view.focus();
    if (typeof this.getPos !== 'function') {
      return;
    }

    const targetPos = this.getPos() + (dir < 0 ? 0 : this.node.nodeSize);
    const selection = Selection.near(this.view.state.doc.resolve(targetPos), dir);
    this.view.dispatch(this.view.state.tr.setSelection(selection).scrollIntoView());
    this.view.focus();
  }

  asProseMirrorSelection(doc: ProsemirrorNode): TextSelection {
    let offset = typeof this.getPos === 'function' ? this.getPos() + 1 : 0;
    const edSel = this.editor.getSelection()!;
    const model = this.editor.getModel()!;
    let anchor = model.getOffsetAt(edSel.getStartPosition()) + offset;
    let head = model.getOffsetAt(edSel.getEndPosition()) + offset;
    return TextSelection.create(doc, anchor, head)
  }

  forwardSelection() {
    if (!this.editor.hasTextFocus()) {
      return;
    }
    const { state } = this.view;
    const selection = this.asProseMirrorSelection(state.doc);
    if (!selection.eq(state.selection)) {
      this.view.dispatch(state.tr.setSelection(selection));
    }
  }

  setSelection(anchor: number, head: number) {
    this.editor.focus();
    this.updating = true;
    const model = this.editor.getModel()!;
    const sel = monaco.Selection.fromPositions(model.getPositionAt(anchor), model.getPositionAt(head));
    this.editor.setSelection(sel);
    this.updating = false;
  }

  valueChanged() {
    const change = computeChange(this.node.textContent, this.editor.getValue());
    if (change) {
      const start = typeof this.getPos === 'function' ? this.getPos() + 1 : 0;
      const tr = this.view.state.tr.replaceWith(
        start + change.from, start + change.to,
        change.text ? this.view.state.schema.text(change.text) : null)
      this.view.dispatch(tr)
    }
  }

  update(node: ProsemirrorNode) {
    if (node.type !== this.node.type) {
      return false;
    }

    if (this.node.attrs.showLineNumbers !== node.attrs.showLineNumbers) {
      this.editor.updateOptions({
        lineNumbers: node.attrs.showLineNumbers ? 'on' : 'off',
      });
    }
    this.node = node;

    if (node.attrs.language !== this.lastLang) {
      this.lastLang = node.attrs.language;
      monaco.editor.setModelLanguage(this.editor.getModel()!, this.lastLang);
    }

    const change = computeChange(this.editor.getValue(), node.textContent);
    if (change) {
      this.updating = true;
      const model = this.editor.getModel()!;
      const selection = monaco.Selection.fromPositions(model.getPositionAt(change.from), model.getPositionAt(change.to));
      this.editor.executeEdits('', [{
        range: selection,
        text: change.text,
      }]);
      this.updating = false;
    }
    return true
  }

  selectNode() {
    this.editor.focus();
  }

  stopEvent(ev: Event) {
    if (ev instanceof KeyboardEvent && ev[this.mod] && ev.key === 'L') {
      return false
    }
    return true;
  }

  destroy() {
    window.removeEventListener('resize', this.resize);
    this.editor.dispose();
  }
}

export default class MonacoCodeBlock extends CodeBlock {
  keyMaps?: IKeyMap;

  getSchema() {
    const schema = super.getSchema();
    schema.draggable = true;
    schema.isolating = true;
    return schema;
  }

  getNodeView(node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number)): NodeView {
    return new MonacoEditorView(node, view, getPos, this.keyMaps);
  }

  getArrowHandler(dir: 'left' | 'right' | 'up' | 'down') {
    return (state: EditorState, dispatch?: (tr: Transaction) => void) => {
      if (state.selection.empty && this.editor.endOfTextblock(dir)) {
        let side = dir == 'left' || dir == 'up' ? -1 : 1, $head = state.selection.$head
        let nextPos = Selection.near(state.doc.resolve(side > 0 ? $head.after() : $head.before()), side)
        if (nextPos.$head && nextPos.$head.parent.type.name === this.name) {
          if (dispatch) {
            dispatch(state.tr.setSelection(nextPos))
          }
          return true
        }
      }
      return false
    };
  }

  getKeyMaps(options: IKeymapOptions) {
    if (this.keyMaps) {
      return this.keyMaps;
    }
    const keyMaps = super.getKeyMaps(options);
    keyMaps['ArrowLeft'] = {
      description: '',
      handler: this.getArrowHandler('left'),
    };
    keyMaps['ArrowRight'] = {
      description: '',
      handler: this.getArrowHandler('right'),
    };
    keyMaps['ArrowUp'] = {
      description: '',
      handler: this.getArrowHandler('up'),
    };
    keyMaps['ArrowDown'] = {
      description: '',
      handler: this.getArrowHandler('down'),
    };
    this.keyMaps = keyMaps;
    return this.keyMaps;
  }
}