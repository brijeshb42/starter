import * as React from 'react';

import Editor from '../editor/Wrapper';

export default function App() {
  return (
    <section className="flex flex-col h-screen overflow-hidden">
      <header className="flex flex-shrink border-b">
        Logo
      </header>
      <section className="flex flex-1 overflow-hidden">
        <aside className="w-1/5 border-r overflow-auto">
          Sidebar
        </aside>
        <article className="w-4/5 overflow-auto">
          <Editor />
        </article>
      </section>
      <footer className="flex flex-shrink border-t">
        Footer
      </footer>
    </section>
  );
}
