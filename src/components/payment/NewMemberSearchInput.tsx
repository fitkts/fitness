import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface MemberOption {
  id: number;
  name: string;
  // 필요한 경우 다른 회원 정보 추가
}

interface NewMemberSearchInputProps {
  options: MemberOption[]; // 전체 회원 목록
  onMemberSelect: (member: MemberOption) => void;
  initialSearchTerm?: string; // 초기 검색어 (예: 수정 시)
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

const NewMemberSearchInput: React.FC<NewMemberSearchInputProps> = ({
  options,
  onMemberSelect,
  initialSearchTerm = '',
  placeholder = '회원 검색...',
  disabled = false,
  error,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [filteredOptions, setFilteredOptions] = useState<MemberOption[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 검색어 변경 시 필터링된 옵션 업데이트
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions([]);
      setIsDropdownVisible(false);
      return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const newFilteredOptions = options.filter((option) =>
      option.name.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredOptions(newFilteredOptions);
    setIsDropdownVisible(newFilteredOptions.length > 0);
    setActiveIndex(-1); // 검색 결과 변경 시 activeIndex 초기화
  }, [searchTerm, options]);

  // 외부 클릭 감지하여 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputFocus = () => {
    if (filteredOptions.length > 0) {
      setIsDropdownVisible(true);
    }
  };

  const selectMember = useCallback((member: MemberOption) => {
    onMemberSelect(member);
    setSearchTerm(member.name); // 선택된 회원의 이름으로 검색창 업데이트
    setIsDropdownVisible(false);
    inputRef.current?.focus(); // 선택 후에도 포커스 유지 (선택사항)
  }, [onMemberSelect]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownVisible || filteredOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          selectMember(filteredOptions[activeIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownVisible(false);
        break;
      default:
        break;
    }
  };
  
  // 드롭다운 아이템 스크롤
  useEffect(() => {
    if (activeIndex !== -1 && dropdownRef.current) {
      const activeItem = dropdownRef.current.children[activeIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
        autoComplete="off"
      />
      {isDropdownVisible && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg z-[100]" // z-index는 모달보다 높게 설정
        >
          {filteredOptions.map((option, index) => (
            <div
              key={option.id}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                index === activeIndex ? 'bg-blue-100' : ''
              }`}
              onMouseDown={(e) => e.preventDefault()} // input blur 방지
              onClick={() => selectMember(option)}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default NewMemberSearchInput; 