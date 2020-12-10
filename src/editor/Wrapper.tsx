import * as React from 'react';

import ProseEditor from './proseEditor';
import BlockQuote from './extensions/blockquote';
import Bold from './extensions/bold';
import CodeBlock from './extensions/monacoCodeBlock';
import Document from './extensions/document';
import Heading from './extensions/heading';
import Italic from './extensions/italic';
import Paragraph from './extensions/paragraph';
import Text from './extensions/text';
import Underline from './extensions/underline';
import AlignPlugin from './extensions/alignPlugin';
import FloatViewPlugin from './extensions/floatView';
import Link from './extensions/link';
import CodeMark from './extensions/codemark';
import Embed from './extensions/embed';
import SimpleImage from './extensions/simpleImage';
import ArrowHandler from './extensions/imageEmbedArrow';

import './Wrapper.scss';
import './proseEditor.scss';
import CaptionPlaceholder from './extensions/captionPlaceholder';
import ListItem from './extensions/listItem';
import OrderedList from './extensions/OrderedList';
import UnorderedList from './extensions/UnorderedList';

export default function EditorWrapper() {
  const ref = React.useRef<null | HTMLDivElement>(null);
  const editorRef = React.useRef<null | ProseEditor>(null);

  function handleClick(ev: React.MouseEvent<HTMLDivElement>) {
    if (ev.target !== ref.current) {
      return;
    }

    if (editorRef.current) {
      editorRef.current.editor!.focus();
    }
  }

  React.useLayoutEffect(() => {
    const boldExt = new Bold();
    const paragraphExt = new Paragraph();
    const headingExt = new Heading();
    const floatViewPlugin = new FloatViewPlugin();
    const embedExt = new Embed({
      floatPlugin: floatViewPlugin,
    });
    const imageExt = new SimpleImage({
      floatPlugin: floatViewPlugin,
    });
    const listItemExt = new ListItem();
    const editor = new ProseEditor(ref.current!, {
      extensions: [
        new Document(),
        paragraphExt,
        headingExt,
        listItemExt,
        new CodeBlock({
          floatPlugin: floatViewPlugin,
        }),
        embedExt,
        imageExt,
        new BlockQuote(),
        new OrderedList({
          childName: listItemExt.name,
        }),
        new UnorderedList({
          childName: listItemExt.name,
        }),
        new Text(),
        boldExt,
        new Italic(),
        new CodeMark(),
        new Underline(),
        new Link({
          floatPlugin: floatViewPlugin,
        }),
        new AlignPlugin({
          supportedBlocks: [headingExt.name, paragraphExt.name],
        }),
        floatViewPlugin,
        new CaptionPlaceholder({
          nodeNames: {
            [imageExt.name]: true,
            [embedExt.name]: true,
          },
        }),
        new ArrowHandler({
          nodeNames: {
            [imageExt.name]: true,
            [embedExt.name]: true,
          },
        }),
      ],
      useDefaultExtensions: true,
    });
    editorRef.current = editor;
    editor.editor!.focus();

    return () => {
      editor.editor!.destroy();
    };
  }, []);
  
  return (
    <div
      className="h-full w-4/5 relative"
      ref={ref}
      onClick={handleClick}
     />
  );
}