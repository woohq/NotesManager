import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Extension } from '@tiptap/core';

const CustomKeymap = Extension.create({
  name: 'customKeymap',
  addAttributes() {
    return {
      indent: {
        default: 0,
        renderHTML: attributes => ({
          style: `padding-left: ${attributes.indent * 2}em`
        }),
        parseHTML: element => {
          return parseInt(element.style.paddingLeft) || 0;
        }
      }
    };
  },
  addKeyboardShortcuts() {
    return {
      'Enter': ({ editor }) => {
        if (!editor.isActive('paragraph')) {
          return false;
        }
        
        // Insert a new paragraph with indent 0
        editor
          .chain()
          .insertContent({ type: 'paragraph', attrs: { indent: 0 } })
          .run();
        
        return true;
      }
    };
  },
});

const RichTextEditor = ({ content, onChange, onEditorReady, className }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      TextStyle,
      FontFamily,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      CustomKeymap,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
      },
      handleKeyDown: (view, event) => {
        // Handle Tab
        if (event.key === 'Tab') {
          event.preventDefault();
          const { state, dispatch } = view;
          
          if (event.shiftKey) {
            // Outdent with Shift+Tab - one level at a time
            state.doc.nodesBetween(state.selection.from, state.selection.to, (node, pos) => {
              if (node.type.name === 'paragraph') {
                const indent = Math.max((node.attrs.indent || 0) - 1, 0);
                dispatch(state.tr.setNodeMarkup(pos, null, {
                  ...node.attrs,
                  indent,
                }));
              }
            });
          } else {
            // Indent with Tab
            state.doc.nodesBetween(state.selection.from, state.selection.to, (node, pos) => {
              if (node.type.name === 'paragraph') {
                const indent = Math.min((node.attrs.indent || 0) + 1, 10);
                dispatch(state.tr.setNodeMarkup(pos, null, {
                  ...node.attrs,
                  indent,
                }));
              }
            });
          }
          return true;
        }

        // Handle Backspace
        if (event.key === 'Backspace') {
          const { state, dispatch } = view;
          const { empty, $cursor } = state.selection;
          if (empty && $cursor) {
            const node = $cursor.parent;
            const isEmpty = node.content.size === 0;
            const hasIndent = node.attrs.indent > 0;
            
            if (isEmpty && hasIndent) {
              event.preventDefault();
              dispatch(state.tr.setNodeMarkup($cursor.before(), null, {
                ...node.attrs,
                indent: 0,
              }));
              return true;
            }
          }
        }

        return false;
      },
    },
  });

  useEffect(() => {
    if (editor) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;