import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { render, unmountComponentAtNode } from 'react-dom';

import { ExtensionType, IExtension } from '../base';

export default class FloatViewPlugin implements IExtension {
  name = 'floatView'
  type = ExtensionType.Plugin;
  key = new PluginKey(this.name);
  editor: EditorView;
  private dom: HTMLElement;
  private attached = false;
  private shown = false;
  private dimension: { width: number, height: number };
  private mounted = false;

  constructor() {
    this.dom = document.createElement('div');
    this.dom.className = this.name + ' absolute p-3 border rounded bg-white border-gray-500';
    this.dom.style.top = '0px';
    this.dom.style.left = '0px';
    this.dom.style.visibility = 'hidden';
  }

  getPlugins() {
    const floatPlugin = new Plugin({
      key: this.key,
      view: (view: EditorView) => {
        this.editor = view;
        this.attached = true;
        view.dom.parentElement?.appendChild(this.dom);
        this.calculateDimension();
        return this;
      }
    });

    return [floatPlugin];
  }

  getDom() {
    return this.dom;
  }

  mount(element: JSX.Element) {
    if (this.mounted) {
      this.unmount();
    }
    render(element, this.dom, () => {
      this.mounted = true;
      this.shown = true;
      this.dom.style.visibility = 'initial';
      this.calculateDimension(true);
    });
  }

  unmount() {
    this.shown = false;
    this.dom.style.visibility = 'hidden';
    unmountComponentAtNode(this.dom);
    this.mounted = false;
  }

  update(view: EditorView, prevState: EditorState) {
    this.editor = view;
    if (!this.attached) {
      this.attached = true;
      view.dom.parentElement?.appendChild(this.dom);
    }

    if (!this.shown) {
      return;
    }

    const sel = this.editor.state.selection;
    const prevSel = prevState.selection;

    if (!sel.eq(prevSel)) {
      this.unmount();
      this.updatePosition();
    }
  }

  destroy() {
    if (!this.attached) {
      return;
    }
    this.unmount();
    this.editor.dom.parentElement?.removeChild(this.dom);
  }

  private calculateDimension(updatePos = false) {
    if (!this.shown) {
      return;
    }
    const rect = this.dom.getBoundingClientRect();
    this.dimension = {
      width: rect.width,
      height: rect.height,
    }

    if (updatePos) {
      this.updatePosition();
    }
  }

  private updatePosition() {
    const { selection } = this.editor.state;
    const parentNode = this.editor.dom;

    const rect1 = parentNode.getBoundingClientRect();
    const rect2 = this.editor.coordsAtPos(selection.from);

    let top = Math.abs(rect1.top - rect2.top);
    let left = (rect2.left - rect1.left);

    if (top < this.dimension.height) {
      top = top + Math.abs(rect2.bottom - rect2.top); //this.dimension.height;
    } else {
      top = top - this.dimension.height;
    }
    if (left + this.dimension.width >= rect1.width) {
      left = rect1.width - this.dimension.width;
    }

    this.dom.style.transform = `translate(${left}px, ${top}px)`;
    // this.dom.style.left = left + 'px';
    // this.dom.style.top = top + 'px';
  }
}