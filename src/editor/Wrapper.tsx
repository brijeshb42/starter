import * as React from 'react';
import Bold from './extensions/bold';

import Document from './extensions/document';
import Italic from './extensions/italic';
import Paragraph from './extensions/paragraph';
import Text from './extensions/text';
import Underline from './extensions/underline';
import ProseEditor from './proseEditor';

export default function EditorWrapper() {
  const ref = React.useRef<null | any>(null);
  const editorRef = React.useRef<null | ProseEditor>(null);

  React.useEffect(() => {
    const editor = new ProseEditor(ref.current, {
      extensions: [
        new Document(),
        new Text(),
        new Paragraph(),
        new Bold(),
        new Italic(),
        new Underline(),
      ],
    });
    editorRef.current = editor;
  }, []);
  return <div className="h-full w-full" ref={ref} />
}