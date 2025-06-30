import React, { useState, useEffect, useRef, useCallback } from 'react';
import { COMMON_MODAL_CONFIG } from '../../config/commonFilterConfig';

export interface MemberOption {
  id: number;
  name: string;
  memberId?: string; // 회원 ID를 문자열로 저장하기 위한 추가 필드
  // 필요한 경우 다른 회원 정보 추가
}

interface NewMemberSearchInputProps {
  options: MemberOption[]; // 전체 회원 목록
  onMemberSelect: (member: MemberOption | null) => void;
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
    // 검색어가 변경되면 선택 해제
    if (e.target.value.trim() === '') {
      onMemberSelect(null);
    }
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

  // 입력 필드 클래스 생성
  const inputClass = `${COMMON_MODAL_CONFIG.INPUT.baseInput} ${
    error ? COMMON_MODAL_CONFIG.INPUT.errorBorder : COMMON_MODAL_CONFIG.INPUT.normalBorder
  } ${disabled ? 'bg-gray-50 text-gray-500' : ''}`;

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
        className={inputClass}
        autoComplete="off"
      />
      {isDropdownVisible && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className={`absolute mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 ${COMMON_MODAL_CONFIG.INPUT.borderRadius} shadow-lg z-[100]`}
        >
          {filteredOptions.map((option, index) => (
            <div
              key={option.id}
              className={`${COMMON_MODAL_CONFIG.INPUT.padding} cursor-pointer hover:bg-gray-100 transition-colors ${
                index === activeIndex ? 'bg-blue-100' : ''
              } ${index === 0 ? 'rounded-t-md' : ''} ${index === filteredOptions.length - 1 ? 'rounded-b-md' : ''}`}
              onMouseDown={(e) => e.preventDefault()} // input blur 방지
              onClick={() => selectMember(option)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className={`${COMMON_MODAL_CONFIG.INPUT.textSize} font-medium text-gray-900`}>
                {option.name}
              </div>
              {option.memberId && (
                <div className={`${COMMON_MODAL_CONFIG.INPUT.helpTextSize} text-gray-500`}>
                  ID: {option.memberId}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {error && (
        <p className={`${COMMON_MODAL_CONFIG.INPUT.helpTextSize} text-red-600 ${COMMON_MODAL_CONFIG.INPUT.helpTextMargin}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default NewMemberSearchInput; 