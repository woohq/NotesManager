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
  onCreateNote,
  isCreateDisabled
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cabinetToDelete, setCabinetToDelete] = useState(null);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

  const handleCabinetCreate = async (name) => {
    try {
      const newCabinet = await onCabinetCreate(name);
      setIsCreateDialogOpen(false);
      return newCabinet;
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteClick = (cabinet, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCabinetToDelete(cabinet);
    setIsDeleteDialogOpen(true);
  };

  const handleCabinetDelete = async () => {
    if (cabinetToDelete) {
      try {
        const nextCabinet = cabinets.find(c => c.name === 'Default Cabinet' && c._id !== cabinetToDelete._id)
          || cabinets.find(c => c._id !== cabinetToDelete._id);

        await onCabinetDelete(cabinetToDelete._id);

        if (currentCabinet?._id === cabinetToDelete._id && nextCabinet) {
          onCabinetChange(nextCabinet);
        }

        setIsDeleteDialogOpen(false);
        setCabinetToDelete(null);
      } catch (error) {
        throw error;
      }
    }
  };

  const handleCabinetSelect = (cabinet) => {
    onCabinetChange(cabinet);
  };

  return (
    <div className="cabinet-header">
      <div className="flex items-center gap-4">
        {/* Cabinet Selector */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-lg font-semibold text-gray-800 hover:bg-gray-100 rounded-md transition-colors focus:outline-none max-w-[24rem]">
            <span className="truncate">
              {cabinets.length === 0 ? 'Click Here to Create a Cabinet' : (currentCabinet?.name || 'Select Cabinet')}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[14rem] max-w-[24rem]">
            {cabinets.map((cabinet) => (
              <DropdownMenuItem
                key={cabinet._id}
                className="flex items-center justify-between group gap-2"
                onClick={() => handleCabinetSelect(cabinet)}
              >
                <span className="truncate">{cabinet.name}</span>
                <button
                  className="delete-button opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity shrink-0"
                  onClick={(e) => handleDeleteClick(cabinet, e)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </DropdownMenuItem>
            ))}
            {cabinets.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              className="flex items-center gap-2 text-blue-600"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsCreateDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              <span>New Cabinet</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add Note Dropdown */}
        <DropdownMenu open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
          <DropdownMenuTrigger
            className={`px-3 py-2 bg-[#f9fafb] border border-[#e5e7eb] rounded text-[#6b7280] transition-all 
              ${isCreateDisabled || cabinets.length === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:bg-[#f3f4f6] hover:border-[#d1d5db] hover:text-[#374151]'}`}
            disabled={isCreateDisabled || cabinets.length === 0}
          >
            <Plus className="h-4 w-4 inline-block mr-2" />
            Add Note
          </DropdownMenuTrigger>
          {!isCreateDisabled && (
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
          )}
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