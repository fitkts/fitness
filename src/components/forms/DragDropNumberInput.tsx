import React, { useState, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { DRAG_DROP_CONFIG } from '../../config/lockerBulkConfig';
import { parseMultipleNumbers, extractTextFromDrop } from '../../utils/lockerBulkUtils';

interface DragDropNumberInputProps {
  value: string[];
  onChange: (numbers: string[]) => void;
  placeholder?: string;
  maxCount?: number;
  disabled?: boolean;
}

const DragDropNumberInput: React.FC<DragDropNumberInputProps> = ({
  value,
  onChange,
  placeholder = DRAG_DROP_CONFIG.PLACEHOLDER_TEXT,
  maxCount = 50,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [textInput, setTextInput] = useState('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const text = extractTextFromDrop(e.nativeEvent);
    if (text) {
      const numbers = parseMultipleNumbers(text);
      const combined = [...value, ...numbers];
      const unique = Array.from(new Set(combined)).slice(0, maxCount);
      onChange(unique);
    }
  }, [value, onChange, maxCount, disabled]);

  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setTextInput(text);
    
    const numbers = parseMultipleNumbers(text);
    onChange(numbers.slice(0, maxCount));
  };

  const handleRemoveNumber = (indexToRemove: number) => {
    const newNumbers = value.filter((_, index) => index !== indexToRemove);
    onChange(newNumbers);
    
    // textInput도 업데이트
    setTextInput(newNumbers.join(', '));
  };

  const handleClear = () => {
    onChange([]);
    setTextInput('');
  };

  return (
    <div className="space-y-4">
      {/* 드래그 앤 드롭 영역 */}
      <div
        className={`
          ${DRAG_DROP_CONFIG.DROP_ZONE_CLASSES}
          ${isDragOver ? DRAG_DROP_CONFIG.DROP_ZONE_ACTIVE_CLASSES : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('number-text-input')?.focus()}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          {placeholder}
        </p>
        <p className="text-xs text-gray-500">
          또는 아래 입력창에 직접 입력하세요
        </p>
      </div>

      {/* 텍스트 입력 영역 */}
      <div>
        <label htmlFor="number-text-input" className="block text-sm font-medium text-gray-700 mb-2">
          락커 번호 입력
        </label>
        <textarea
          id="number-text-input"
          value={textInput}
          onChange={handleTextInputChange}
          disabled={disabled}
          placeholder="락커 번호를 입력하세요 (예: 101, 102, 103 또는 한 줄에 하나씩)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">
          {value.length} / {maxCount} 개 ({maxCount - value.length}개 더 추가 가능)
        </p>
      </div>

      {/* 입력된 번호들 표시 */}
      {value.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              입력된 락커 번호들
            </label>
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              전체 삭제
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-md bg-gray-50">
            {value.map((number, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {number}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveNumber(index)}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropNumberInput; 