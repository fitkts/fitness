import React from 'react';
import { Search, Filter, X, Plus, Download, Upload, Info } from 'lucide-react';
import { MemberFilter, Staff } from '../../models/types';
import { FILTER_OPTIONS, EXCEL_CONFIG, ACTION_BUTTON_CONFIG, COMPACT_LAYOUT_CONFIG } from '../../config/memberConfig';
import { MemberSearchFilterActions } from '../../types/member';
import * as XLSX from 'xlsx';

interface MemberSearchFilterProps extends MemberSearchFilterActions {
  filter: MemberFilter;
  onFilterChange: (filter: MemberFilter) => void;
  onReset: () => void;
  onPaginationReset: () => void;
  staffList?: Staff[];
  membershipTypes?: string[];
}

const MemberSearchFilter: React.FC<MemberSearchFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
  onPaginationReset,
  staffList = [],
  membershipTypes = [],
  onAddMember,
  onImportSuccess,
  showToast,
  members = [],
  showActionButtons = false,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, search: e.target.value });
    onPaginationReset();
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ 
      ...filter, 
      status: e.target.value as MemberFilter['status'] 
    });
    onPaginationReset();
  };

  const handleStaffNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ 
      ...filter, 
      staffName: e.target.value 
    });
    onPaginationReset();
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ 
      ...filter, 
      gender: e.target.value 
    });
    onPaginationReset();
  };

  const handleMembershipTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ 
      ...filter, 
      membershipType: e.target.value 
    });
    onPaginationReset();
  };

  // 활성 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.search && filter.search.trim() !== '') count++;
    if (filter.status && filter.status !== 'all') count++;
    if (filter.staffName && filter.staffName !== 'all') count++;
    if (filter.gender && filter.gender !== 'all') count++;
    if (filter.membershipType && filter.membershipType !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // 엑셀 내보내기 핸들러
  const handleExportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(members);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, EXCEL_CONFIG.SHEET_NAME);
      XLSX.writeFile(wb, EXCEL_CONFIG.FILE_NAME);
      showToast?.('success', '엑셀 파일이 성공적으로 내보내졌습니다.');
    } catch (error) {
      console.error('엑셀 내보내기 오류:', error);
      showToast?.('error', '엑셀 내보내기 중 오류가 발생했습니다.');
    }
  };

  // 엑셀 불러오기 핸들러
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        // TODO: 실제 import 로직 구현 필요
        console.log('Import data:', jsonData);
        showToast?.('success', '엑셀 데이터를 성공적으로 가져왔습니다.');
        onImportSuccess?.();
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('엑셀 불러오기 오류:', error);
      showToast?.('error', '엑셀 파일 처리 중 오류가 발생했습니다.');
    }

    // 파일 input 초기화
    e.target.value = '';
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.padding} overflow-hidden sticky top-4 z-20`}
      data-testid="member-search-filter-container"
    >
      {/* 헤더 */}
      <div className={`${COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.headerPadding} bg-gray-50 border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Filter size={COMPACT_LAYOUT_CONFIG.HEADER.icon} className="text-gray-600" />
            <h3 className={COMPACT_LAYOUT_CONFIG.HEADER.title}>회원 검색 및 필터</h3>
            {activeFilterCount > 0 && (
              <span className={`bg-blue-100 text-blue-800 ${COMPACT_LAYOUT_CONFIG.HEADER.badge} font-medium px-1.5 py-0.5 rounded-full`}>
                {activeFilterCount}개
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* 필터 초기화 버튼 */}
            {activeFilterCount > 0 && (
              <button
                onClick={onReset}
                className="flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={10} />
                초기화
              </button>
            )}
            
            {/* 액션 버튼들 */}
            {showActionButtons && (
              <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-300">
                {/* 회원 추가 버튼 */}
                {onAddMember && (
                  <button
                    onClick={onAddMember}
                    className={ACTION_BUTTON_CONFIG.ADD_MEMBER.className}
                  >
                    <Plus size={ACTION_BUTTON_CONFIG.ADD_MEMBER.iconSize} className="mr-1" />
                    {ACTION_BUTTON_CONFIG.ADD_MEMBER.text}
                  </button>
                )}

                {/* 엑셀 버튼 그룹 */}
                <div className={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.container}>
                  <button
                    title="엑셀 불러오기"
                    className={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.button}
                    onClick={() => document.getElementById('excel-import-input')?.click()}
                  >
                    <Upload size={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.iconSize} />
                  </button>
                  <input
                    id="excel-import-input"
                    type="file"
                    accept={EXCEL_CONFIG.SUPPORTED_FORMATS}
                    style={{ display: 'none' }}
                    onChange={handleImportExcel}
                  />
                  <button
                    title="엑셀 내보내기"
                    className={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.button}
                    onClick={handleExportExcel}
                  >
                    <Download size={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.iconSize} />
                  </button>
                  <button
                    title="엑셀 형식 안내"
                    className={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.infoButton}
                    onClick={() => {/* TODO: 엑셀 형식 안내 모달 */}}
                  >
                    <Info size={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.infoIconSize} color="#888" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 필터 컨텐츠 */}
      <div className={COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.contentPadding}>
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 ${COMPACT_LAYOUT_CONFIG.GRID.gap}`}>
          {/* 검색 박스 - 가장 작은 크기로 */}
          <div>
            <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} font-medium text-gray-700 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>
              검색
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="회원명..."
                className={`w-full pl-7 pr-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={filter.search || ''}
                onChange={handleSearchChange}
              />
              <Search
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={12}
              />
            </div>
          </div>

          {/* 상태별 필터 */}
          <div>
            <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} font-medium text-gray-700 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>
              상태
            </label>
            <select
              className={`w-full px-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={filter.status || 'all'}
              onChange={handleStatusChange}
            >
              {FILTER_OPTIONS.STATUS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 담당자별 필터 */}
          <div>
            <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} font-medium text-gray-700 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>
              담당자
            </label>
            <select
              className={`w-full px-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={filter.staffName || 'all'}
              onChange={handleStaffNameChange}
            >
              <option value="all">전체</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.name}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>

          {/* 성별 필터 */}
          <div>
            <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} font-medium text-gray-700 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>
              성별
            </label>
            <select
              className={`w-full px-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={filter.gender || 'all'}
              onChange={handleGenderChange}
            >
              <option value="all">전체</option>
              <option value="남성">남성</option>
              <option value="여성">여성</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 이용권별 필터 */}
          <div>
            <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} font-medium text-gray-700 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>
              이용권
            </label>
            <select
              className={`w-full px-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={filter.membershipType || 'all'}
              onChange={handleMembershipTypeChange}
            >
              <option value="all">전체</option>
              {membershipTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSearchFilter; 