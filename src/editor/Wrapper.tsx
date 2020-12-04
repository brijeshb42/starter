import * as React from 'react';
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
import ProseEditor from './proseEditor';

import './Wrapper.scss';

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

  React.useEffect(() => {
    const boldExt = new Bold();
    const paragraphExt = new Paragraph();
    const quoteCaptionExt = new QuoteCaption();
    const quoteExt = new Quote({
      quoteNode: paragraphExt.name,
      captionNode: quoteCaptionExt.name,
    });
    const editor = new ProseEditor(ref.current, {
      extensions: [
        new Document(),
        paragraphExt,
        new Heading(),
        new CodeBlock(),
        quoteCaptionExt,
        quoteExt,
        new Text(),
        boldExt,
        new Italic(),
        new Underline(),
      ],
      useDefaultExtensions: true,
    });
    editorRef.current = editor;
    editor.editor!.focus();

    return () => {
      editor.editor!.destroy();
    };
  }, []);
  return <div className="h-full w-full" ref={ref} onClick={handleClick} />
}
