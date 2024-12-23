import React, { useState } from 'react';
import { ChevronDown, Plus, Trash2, StickyNote, ListTodo, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { CreateCabinetDialog, DeleteCabinetDialog } from './CabinetDialogs';

const CabinetHeader = ({ 
  cabinets, 
  currentCabinet, 
  onCabinetChange,
  onCabinetCreate,
  onCabinetDelete,
  onCreateNote 
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cabinetToDelete, setCabinetToDelete] = useState(null);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

  const handleCabinetCreate = async (name) => {
    await onCabinetCreate(name);
    setIsCreateDialogOpen(false);
  };

  const handleDeleteClick = (cabinet) => {
    setCabinetToDelete(cabinet);
    setIsDeleteDialogOpen(true);
  };

  const handleCabinetDelete = async () => {
    if (cabinetToDelete) {
      await onCabinetDelete(cabinetToDelete._id);
      setIsDeleteDialogOpen(false);
      setCabinetToDelete(null);
    }
  };

  return (
    <div className="cabinet-header">
      <div className="flex items-center gap-4">
        {/* Cabinet Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-lg font-semibold text-gray-800 hover:bg-gray-100 rounded-md transition-colors focus:outline-none">
            {currentCabinet?.name || 'Select Cabinet'}
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {cabinets.map((cabinet) => (
              <DropdownMenuItem
                key={cabinet._id}
                className="flex items-center justify-between group"
                onSelect={(e) => {
                  if (e.target.closest('.delete-button')) {
                    e.preventDefault();
                    return;
                  }
                  onCabinetChange(cabinet);
                }}
              >
                <span>{cabinet.name}</span>
                {cabinet.name !== 'Default Cabinet' && (
                  <button
                    className="delete-button opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(cabinet);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-blue-600"
              onSelect={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>New Cabinet</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add Note Dropdown */}
        <DropdownMenu open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
          <DropdownMenuTrigger className="px-3 py-2 bg-[#f9fafb] border border-[#e5e7eb] rounded text-[#6b7280] cursor-pointer text-sm transition-all hover:bg-[#f3f4f6] hover:border-[#d1d5db] hover:text-[#374151] flex items-center gap-2 focus:outline-none">
            <Plus className="h-4 w-4" />
            Add Note
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem
              onClick={() => {
                onCreateNote('standard');
                setIsAddNoteOpen(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5"
            >
              <StickyNote className="h-4 w-4" />
              <span>Standard Note</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                onCreateNote('task');
                setIsAddNoteOpen(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5"
            >
              <ListTodo className="h-4 w-4" />
              <span>Task List</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                onCreateNote('calendar');
                setIsAddNoteOpen(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5"
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar Note</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CreateCabinetDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onConfirm={handleCabinetCreate}
      />

      <DeleteCabinetDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        cabinet={cabinetToDelete}
        onConfirm={handleCabinetDelete}
      />
    </div>
  );
};

export default CabinetHeader;