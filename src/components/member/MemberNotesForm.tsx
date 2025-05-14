import React from 'react';

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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">메모</h3>
      </div>
      <div className="p-4">
        {isViewMode ? (
          <div className="bg-gray-50 p-3 rounded min-h-[100px]">
            {notes ? (
              <p className="whitespace-pre-wrap">{notes}</p>
            ) : (
              <p className="text-gray-500">등록된 메모가 없습니다.</p>
            )}
          </div>
        ) : (
          <textarea
            name="notes"
            value={notes || ''} // undefined일 경우 빈 문자열로 처리
            onChange={handleChange}
            className="input w-full h-24"
            placeholder="회원에 대한 특이사항이나 메모를 입력하세요."
            disabled={isSubmitting}
          ></textarea>
        )}
      </div>
    </div>
  );
};

export default MemberNotesForm; 