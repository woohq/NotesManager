import React, { createContext, useContext, useState } from 'react';

const EditorContext = createContext(null);

export function EditorProvider({ children }) {
  const [activeEditor, setActiveEditor] = useState(null);

  const value = {
    editor: activeEditor,
    setEditor: (editor) => {
      if (editor) {
        setActiveEditor(editor);
      }
    }
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}

export default EditorContext;