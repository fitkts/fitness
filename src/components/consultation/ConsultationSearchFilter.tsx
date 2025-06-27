import React from 'react';
import { Filter, Search, X, Plus, Upload, Download, Info } from 'lucide-react';
import { ConsultationFilter, ConsultationMember } from '../../types/consultation';
import { Staff } from '../../types/staff';
import { 
  FILTER_GRID_CONFIG,
  CONSULTATION_FILTER_OPTIONS,
  CONSULTATION_COMPACT_LAYOUT_CONFIG,
  CONSULTATION_ACTION_BUTTON_CONFIG,
  CONSULTATION_EXCEL_CONFIG
} from '../../config/consultationFilterConfig';

interface ConsultationSearchFilterProps {
  filter: ConsultationFilter;
  onFilterChange: (filter: ConsultationFilter) => void;
  onReset: () => void;
  onPaginationReset: () => void;
  staffList?: Staff[];
  onAddMember?: () => void;
  onImportSuccess?: () => void;
  showToast?: (type: 'success' | 'error', message: string) => void;
  members?: ConsultationMember[];
  showActionButtons?: boolean;
}

const ConsultationSearchFilter: React.FC<ConsultationSearchFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
  onPaginationReset,
  staffList = [],
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
      status: e.target.value as ConsultationFilter['status'] 
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

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      dateFrom: e.target.value
    });
    onPaginationReset();
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      dateTo: e.target.value
    });
    onPaginationReset();
  };

  // 엑셀 가져오기 핸들러
  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // TODO: 엑셀 파일 처리 로직 구현
    console.log('엑셀 파일 가져오기:', file.name);
    if (showToast) {
      showToast('success', '엑셀 파일을 성공적으로 가져왔습니다.');
    }
    if (onImportSuccess) {
      onImportSuccess();
    }
  };

  // 엑셀 내보내기 핸들러
  const handleExportExcel = () => {
    // TODO: 엑셀 내보내기 로직 구현
    console.log('엑셀 파일 내보내기');
    if (showToast) {
      showToast('success', '엑셀 파일을 성공적으로 내보냈습니다.');
    }
  };

  // 활성 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.search && filter.search.trim() !== '') count++;
    if (filter.status && filter.status !== 'all') count++;
    if (filter.staffName && filter.staffName !== 'all') count++;
    if (filter.gender && filter.gender !== 'all') count++;
    if (filter.dateFrom && filter.dateFrom.trim() !== '') count++;
    if (filter.dateTo && filter.dateTo.trim() !== '') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div 
      className={`${CONSULTATION_COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.wrapper} ${CONSULTATION_COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.padding}`}
      data-testid="consultation-search-filter-container"
    >
      {/* 헤더 */}
      <div className={`${CONSULTATION_COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.headerPadding} ${CONSULTATION_COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.headerBackground}`}>
        <div className={CONSULTATION_COMPACT_LAYOUT_CONFIG.HEADER.container}>
          <div className={CONSULTATION_COMPACT_LAYOUT_CONFIG.HEADER.leftSection}>
            <Filter size={CONSULTATION_COMPACT_LAYOUT_CONFIG.HEADER.icon} className="text-gray-600" />
            <h3 className={CONSULTATION_COMPACT_LAYOUT_CONFIG.HEADER.title}>상담 회원 검색 및 필터</h3>
            {activeFilterCount > 0 && (
              <span className={CONSULTATION_COMPACT_LAYOUT_CONFIG.BADGE.active}>
                {activeFilterCount}개
              </span>
            )}
          </div>
          
          <div className={CONSULTATION_COMPACT_LAYOUT_CONFIG.HEADER.rightSection}>
            {/* 필터 초기화 버튼 */}
            {activeFilterCount > 0 && (
              <button
                onClick={onReset}
                className={CONSULTATION_ACTION_BUTTON_CONFIG.RESET_BUTTON.className}
              >
                <X size={CONSULTATION_ACTION_BUTTON_CONFIG.RESET_BUTTON.iconSize} />
                초기화
              </button>
            )}

            {/* 상담회원 추가 버튼 */}
            {onAddMember && (
              <button
                onClick={onAddMember}
                className={CONSULTATION_ACTION_BUTTON_CONFIG.ADD_MEMBER.className}
                data-testid="add-consultation-member-button"
                title="새로운 상담회원을 등록합니다"
              >
                <Plus size={CONSULTATION_ACTION_BUTTON_CONFIG.ADD_MEMBER.iconSize} className="mr-1" />
                {CONSULTATION_ACTION_BUTTON_CONFIG.ADD_MEMBER.text}
              </button>
            )}
            
            {/* 엑셀 버튼들 */}
            {showActionButtons && (
              <div className={CONSULTATION_ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.container}>
                <button
                  title="엑셀 불러오기"
                  className={CONSULTATION_ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.button}
                  onClick={() => document.getElementById('consultation-excel-import-input')?.click()}
                >
                  <Upload size={CONSULTATION_ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.iconSize} />
                </button>
                <input
                  id="consultation-excel-import-input"
                  type="file"
                  accept={CONSULTATION_EXCEL_CONFIG.SUPPORTED_FORMATS}
                  style={{ display: 'none' }}
                  onChange={handleImportExcel}
                />
                <button
                  title="엑셀 내보내기"
                  className={CONSULTATION_ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.button}
                  onClick={handleExportExcel}
                >
                  <Download size={CONSULTATION_ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.iconSize} />
                </button>
                <button
                  title="엑셀 형식 안내"
                  className={CONSULTATION_ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.infoButton}
                  onClick={() => {/* TODO: 엑셀 형식 안내 모달 */}}
                >
                  <Info size={CONSULTATION_ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.infoIconSize} color="#888" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 필터 컨텐츠 - 12컬럼 그리드 시스템 적용 */}
      <div className={CONSULTATION_COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.contentPadding}>
        <div className="space-y-2">
          <div className={FILTER_GRID_CONFIG.baseGrid}>
            {/* 검색 필드 */}
            <div className={FILTER_GRID_CONFIG.columns.search}>
              <label className={FILTER_GRID_CONFIG.styles.label}>검색</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="회원명, 전화번호..."
                  className={`${FILTER_GRID_CONFIG.styles.input} pl-7`}
                  value={filter.search || ''}
                  onChange={handleSearchChange}
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              </div>
            </div>

            {/* 상담 상태 */}
            <div className={FILTER_GRID_CONFIG.columns.default}>
              <label className={FILTER_GRID_CONFIG.styles.label}>상태</label>
              <select
                className={FILTER_GRID_CONFIG.styles.select}
                value={filter.status || 'all'}
                onChange={handleStatusChange}
              >
                {CONSULTATION_FILTER_OPTIONS.STATUS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label.replace('전체 상태', '전체')}
                  </option>
                ))}
              </select>
            </div>

            {/* 담당자 */}
            <div className={FILTER_GRID_CONFIG.columns.default}>
              <label className={FILTER_GRID_CONFIG.styles.label}>담당자</label>
              <select
                className={FILTER_GRID_CONFIG.styles.select}
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

            {/* 성별 */}
            <div className={FILTER_GRID_CONFIG.columns.default}>
              <label className={FILTER_GRID_CONFIG.styles.label}>성별</label>
              <select
                className={FILTER_GRID_CONFIG.styles.select}
                value={filter.gender || 'all'}
                onChange={handleGenderChange}
              >
                {CONSULTATION_FILTER_OPTIONS.GENDER.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label.replace('전체 성별', '전체')}
                  </option>
                ))}
              </select>
            </div>

            {/* 시작일 */}
            <div className={FILTER_GRID_CONFIG.columns.default}>
              <label className={FILTER_GRID_CONFIG.styles.label}>시작일</label>
              <input
                type="date"
                className={FILTER_GRID_CONFIG.styles.input}
                value={filter.dateFrom || ''}
                onChange={handleDateFromChange}
              />
            </div>

            {/* 종료일 */}
            <div className={FILTER_GRID_CONFIG.columns.default}>
              <label className={FILTER_GRID_CONFIG.styles.label}>종료일</label>
              <input
                type="date"
                className={FILTER_GRID_CONFIG.styles.input}
                value={filter.dateTo || ''}
                onChange={handleDateToChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationSearchFilter; 