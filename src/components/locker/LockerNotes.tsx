import React from "react";
import { LockerNotesProps } from '../../types/lockerModal';

const LockerNotes: React.FC<LockerNotesProps> = ({
  notes,
  onChange,
  errors,
  isViewMode
}) => {
  return (
    <div className="pt-4 border-t border-gray-200">
      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
        📝 비고
      </label>
      <textarea
        name="notes"
        id="notes"
        value={notes || ''}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 ${
          errors.notes ? 'border-red-500' : 'border-gray-300'
        }`}
        rows={3}
        disabled={isViewMode}
        placeholder="추가 메모가 있으면 입력해주세요..."
        maxLength={500}
      />
      <div className="flex justify-between items-center mt-1">
        <div className="text-xs text-gray-500">
          {(notes || '').length}/500자
        </div>
        {errors.notes && (
          <p className="text-xs text-red-500">{errors.notes}</p>
        )}
      </div>
    </div>
  );
};

export default LockerNotes;
