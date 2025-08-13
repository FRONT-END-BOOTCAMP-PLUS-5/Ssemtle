'use client';

import { useState } from 'react';
import { TbFilter } from 'react-icons/tb';
import { IoChevronDown } from 'react-icons/io5';

interface FilterOption {
  id: number | string;
  name: string;
  checked: boolean;
}

interface FilterDropdownProps {
  title: string;
  options: FilterOption[];
  onSelectionChange: (selectedIds: (number | string)[]) => void;
  mode?: 'checkbox' | 'radio';
}

export default function FilterDropdown({
  title,
  options,
  onSelectionChange,
  mode = 'checkbox',
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionChange = (optionId: number | string) => {
    if (mode === 'radio') {
      // For radio buttons, only one option can be selected
      onSelectionChange([optionId]);
    } else {
      // For checkboxes, multiple options can be selected
      const updatedOptions = options.map((option) =>
        option.id === optionId
          ? { ...option, checked: !option.checked }
          : option
      );

      const selectedIds = updatedOptions
        .filter((option) => option.checked)
        .map((option) => option.id);

      onSelectionChange(selectedIds);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="inline-flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-700 hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <TbFilter className="h-4 w-4" />
          <span>{title}</span>
        </div>
        <IoChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
          <div className="p-2">
            {options.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-50"
              >
                <input
                  type={mode}
                  name={mode === 'radio' ? title : undefined}
                  checked={option.checked}
                  onChange={() => handleOptionChange(option.id)}
                  className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
