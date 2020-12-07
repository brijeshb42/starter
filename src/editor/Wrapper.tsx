import * as React from 'react';

import ProseEditor from './proseEditor';
import BlockQuote from './extensions/blockquote';
import Bold from './extensions/bold';
import QuoteCaption from './extensions/caption';
import CodeBlock from './extensions/codeblock';
import Document from './extensions/document';
import Heading from './extensions/heading';
import Italic from './extensions/italic';
import Paragraph from './extensions/paragraph';
import Quote from './extensions/quote';
import Text from './extensions/text';
import Underline from './extensions/underline';
import AlignPlugin from './extensions/alignPlugin';
import FloatViewPlugin from './extensions/floatView';
import Link from './extensions/link';

import './Wrapper.scss';
import './extensions/codeblock.css';

export default function EditorWrapper() {
  const ref = React.useRef<null | any>(null);
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
    const quoteCaptionExt = new QuoteCaption();
    const quoteExt = new Quote({
      quoteNode: paragraphExt.name,
      captionNode: quoteCaptionExt.name,
    });
    const floatViewPlugin = new FloatViewPlugin();
    const editor = new ProseEditor(ref.current, {
      extensions: [
        new Document(),
        paragraphExt,
        headingExt,
        new CodeBlock({
          floatPlugin: floatViewPlugin,
        }),
        quoteCaptionExt,
        quoteExt,
        new BlockQuote(),
        new Text(),
        boldExt,
        new Italic(),
        new Underline(),
        new Link({
          floatPlugin: floatViewPlugin,
        }),
        new AlignPlugin({
          supportedBlocks: [headingExt.name, paragraphExt.name],
        }),
        floatViewPlugin,
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
    <div className="h-full w-full relative" ref={ref} onClick={handleClick} />
  );
}