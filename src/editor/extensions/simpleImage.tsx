/** @jsx h */
import { h, render } from 'preact';
import { setBlockType } from 'prosemirror-commands';
import { Node as ProsemirrorNode, NodeSpec, NodeType } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView, NodeView } from 'prosemirror-view';

import { ExtensionType, IExtension, IInitOpts, IKeymapOptions, KeyHandler } from '../base';
import FormInput, { IField } from '../components/FormInput';
import { isInParentNodeOfType } from '../commands/block';
import FloatViewPlugin from './floatView';

interface IImageBlockOptions {
  floatPlugin?: FloatViewPlugin;
}

interface IProps {
  src: string;
  alt: string;
  onImage: () => void;
}

function ImageComponent({ src, alt, onImage }: IProps) {
  return (
    <div className="image-container">
      {src && <img src={src} alt={alt} />}
      {!src && (
        <p className="embed-info">
          <button onClick={onImage}>
            Add image URL
          </button>
        </p>
      )}
    </div>
  );
}

class ImageView implements NodeView {
  dom: HTMLElement;
  innerDOM: HTMLElement;
  contentDOM: HTMLElement;

  constructor(private node: ProsemirrorNode, private view: EditorView, private handleImageMeta: KeyHandler) {
    this.dom = document.createElement('figure');
    this.dom.setAttribute('data-image', '');
    this.innerDOM = document.createElement('div');
    this.contentDOM = document.createElement('figcaption');
    this.dom.appendChild(this.innerDOM);
    this.dom.appendChild(this.contentDOM);
    this.render();
  }

  private render() {
    const { attrs } = this.node;
    const props = {
      src: attrs.src,
      alt: attrs.alt,
    }
    render(<ImageComponent {...props} onImage={this.handleImageURL} />, this.innerDOM);
  }
  
  handleImageURL = () => {
    this.handleImageMeta(this.view.state, this.view.dispatch);
  };

  update(node: ProsemirrorNode) {
    if (node.type.name !== 'image') {
      return false;
    }

    this.node = node;
    this.render();
    return true;
  }
}

export default class SimpleImagePlugin implements IExtension {
  name = 'image';
  type = ExtensionType.Node;
  editor: EditorView;

  constructor(private options?: IImageBlockOptions) {}

  init({ editor }: IInitOpts) {
    this.editor = editor;
  }

  getSchema() {
    const schema: NodeSpec = {
      content: 'text*',
      group: 'block',
      defining: true,
      draggable: true,
      attrs: {
        src: {
          default: '',
        },
        alt: {
          default: '',
        },
      },
      parseDOM: [{
        tag: 'figure[data-image]',
        contentElement: 'figcaption',
        getAttrs(node: string | Node) {
          console.log(node);
          return null;
          // return {
          //   src: typeof node === 'string' ? '' : (node as HTMLImageElement).src,
          // };
        }
      }],
      toDOM(node: ProsemirrorNode) {
        return ['figure', {
          'data-image': node.attrs.src,
        }, 0];
      }
    };
    return schema;
  }

  handleImageMeta = (state: EditorState, dispatch?: (tr: Transaction) => void) => {
    if (!isInParentNodeOfType(state, this.name)) {
      return false;
    }

    const floatPlugin = this.options?.floatPlugin ?? null;

    const { $from } = state.selection;
    const parent = $from.parent;

    if (!floatPlugin) {
      const newSrc = prompt('Please enter the image url', parent.attrs.src || '');
      const newAlt = prompt('Please enter the alt text for the image', parent.attrs.alt || '');

      if (newSrc && newSrc !== parent.attrs.src && dispatch) {
        dispatch(state.tr.setNodeMarkup($from.before($from.depth), undefined, {
          src: newSrc,
          alt: newAlt,
        }));
      }
    } else {
      const values = {
        src: parent.attrs.src || '',
        alt: parent.attrs.alt || '',
      };
      const fields: IField[] = [{
        type: 'text',
        label: 'Enter image url',
        value: values.src,
        name: 'src',
      }, {
        type: 'text',
        label: 'Enter alt text for the image',
        value: values.alt,
        name: 'alt',
      }];
      floatPlugin.mount(
        <FormInput
          fields={fields}
          title="Update image data"
          submitText="Update"
          onSubmit={(values) => {
            floatPlugin.unmount();
            this.editor.focus();
            if (state !== this.editor.state) {
              return;
            }
            this.editor.dispatch(state.tr.setNodeMarkup($from.before($from.depth), undefined, values));
          }}
        />
      );
    }

    return true;
  };

  getKeyMaps(options?: IKeymapOptions) {
    return {
      'Mod-Alt-m': {
        description: 'Create an image block',
        handler: setBlockType(options!.type as NodeType, {
          src: '',
        }),
      },
      'Mod-Alt-M': {
        description: 'Update image metadata',
        handler: this.handleImageMeta,
      },
    };
  }
  
  getNodeView(node: ProsemirrorNode, view: EditorView): NodeView {
    return new ImageView(node, view, this.handleImageMeta);
  }
}