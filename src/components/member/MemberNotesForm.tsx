import React from 'react';
import { COMPACT_MODAL_CONFIG } from '../../config/memberConfig';

interface MemberNotesFormProps {
  notes: string | undefined; // notes는 undefined일 수 있음
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isViewMode: boolean;
  isSubmitting: boolean;
  // errors prop은 현재 메모 필드에 특정 에러가 없으므로 제외
}

const MemberNotesForm: React.FC<MemberNotesFormProps> = ({
  notes,
  handleChange,
  isViewMode,
  isSubmitting,
}) => {
  return (
    <div className={`${COMPACT_MODAL_CONFIG.SECTION.background} ${COMPACT_MODAL_CONFIG.SECTION.borderRadius} ${COMPACT_MODAL_CONFIG.SECTION.border} ${COMPACT_MODAL_CONFIG.SECTION.shadow} overflow-hidden`}>
      <div className={`${COMPACT_MODAL_CONFIG.SECTION.headerPadding} bg-gray-50 border-b border-gray-200`}>
        <h3 className={`${COMPACT_MODAL_CONFIG.SECTION.titleSize} text-gray-800`}>
          메모
        </h3>
      </div>
      <div className={COMPACT_MODAL_CONFIG.SECTION.contentPadding}>
        {isViewMode ? (
          <div className={`bg-gray-50 px-3 py-2 ${COMPACT_MODAL_CONFIG.INPUT.borderRadius} min-h-[60px] ${COMPACT_MODAL_CONFIG.INPUT.textSize}`}>
            {notes ? (
              <p className="whitespace-pre-wrap">{notes}</p>
            ) : (
              <p className="text-gray-500">등록된 메모가 없습니다.</p>
            )}
          </div>
        ) : (
          <textarea
            name="notes"
            value={notes || ''}
            onChange={handleChange}
            className={`w-full h-16 ${COMPACT_MODAL_CONFIG.INPUT.padding} border border-gray-300 ${COMPACT_MODAL_CONFIG.INPUT.borderRadius} ${COMPACT_MODAL_CONFIG.INPUT.textSize} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors`}
            placeholder="회원에 대한 특이사항이나 메모를 입력하세요."
            disabled={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default MemberNotesForm;
