import React from 'react';
import { COMMON_FILTER_LAYOUT } from '../../config/commonFilterConfig';

interface FilterFieldProps {
  label: string;
  type?: 'text' | 'select' | 'date';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  className?: string;
}

/**
 * 필터에서 사용하는 공통 입력 필드 컴포넌트
 * 일관된 스타일과 동작을 제공
 */
const FilterField: React.FC<FilterFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  options,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={handleChange}
            className={COMMON_FILTER_LAYOUT.INPUT_FIELD.select}
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={handleChange}
            className={COMMON_FILTER_LAYOUT.INPUT_FIELD.input}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={COMMON_FILTER_LAYOUT.INPUT_FIELD.input}
          />
        );
    }
  };

  return (
    <div className={`${COMMON_FILTER_LAYOUT.INPUT_FIELD.wrapper} ${className}`}>
      <label className={COMMON_FILTER_LAYOUT.INPUT_FIELD.label}>
        {label}
      </label>
      {renderInput()}
    </div>
  );
};

export default FilterField;
