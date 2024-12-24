import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { useEditor } from '../EditorContext';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Quote, 
  GripHorizontal
} from 'lucide-react';

const FloatingToolbar = () => {
  const { editor } = useEditor();
  const [position] = useState({ x: -430, y: 0 });

  const handleCommand = (command) => {
    if (!editor) return;
    command();
  };

  const ToolbarButton = ({ command, isActive, icon: Icon, tooltip }) => (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        handleCommand(command);
      }}
      className={`p-1.5 rounded hover:bg-gray-100 w-full flex items-center justify-center ${
        isActive ? 'bg-gray-100 text-blue-500' : 'text-gray-700'
      }`}
      title={tooltip}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <Draggable
      handle=".toolbar-handle"
      defaultPosition={position}
      bounds="parent"
    >
      <div className="fixed z-50 shadow-lg rounded-lg bg-white border border-gray-200 w-[40px]">
        {/* Header */}
        <div className="toolbar-handle flex items-center justify-center px-2 py-1.5 bg-gray-50 rounded-t-lg cursor-move border-b">
          <GripHorizontal className="w-4 h-4 text-gray-400" />
        </div>

        {/* Vertical Toolbar Content */}
        <div className="p-1 space-y-1 flex flex-col">
          {/* Text Formatting */}
          <ToolbarButton
            command={() => editor.chain().focus().toggleBold().run()}
            isActive={editor?.isActive('bold')}
            icon={Bold}
            tooltip="Bold"
          />
          <ToolbarButton
            command={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor?.isActive('italic')}
            icon={Italic}
            tooltip="Italic"
          />
          <ToolbarButton
            command={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor?.isActive('strike')}
            icon={Strikethrough}
            tooltip="Strikethrough"
          />
          
          {/* Divider */}
          <div className="h-px bg-gray-200 my-1" />
          
          {/* Block Formatting */}
          <ToolbarButton
            command={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor?.isActive('codeBlock')}
            icon={Code}
            tooltip="Code Block"
          />
          <ToolbarButton
            command={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor?.isActive('blockquote')}
            icon={Quote}
            tooltip="Block Quote"
          />
        </div>
      </div>
    </Draggable>
  );
};

export default FloatingToolbar;