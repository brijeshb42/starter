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

import './Wrapper.scss';
import './proseEditor.scss';
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
    // const quoteCaptionExt = new QuoteCaption();
    // const quoteExt = new Quote({
    //   quoteNode: paragraphExt.name,
    //   captionNode: quoteCaptionExt.name,
    // });
    const floatViewPlugin = new FloatViewPlugin();
    const editor = new ProseEditor(ref.current, {
      extensions: [
        new Document(),
        paragraphExt,
        headingExt,
        new CodeBlock({
          floatPlugin: floatViewPlugin,
        }),
        new Embed({
          floatPlugin: floatViewPlugin,
        }),
        new BlockQuote(),
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
    <div className="h-full w-4/5 relative" ref={ref} onClick={handleClick} />
  );
}