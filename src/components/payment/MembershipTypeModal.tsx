import React, { useState } from 'react';
import Modal from '../common/Modal';
import { CreditCard, Settings2 } from 'lucide-react';
import MembershipTypeForm from './MembershipTypeForm';
import { MembershipType } from '../../models/types';

interface MembershipTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  membershipType: MembershipType | null;
  isViewMode: boolean;
}

const MembershipTypeModal: React.FC<MembershipTypeModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  membershipType,
  isViewMode,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderHeader = () => (
    <div className="flex items-center">
      <Settings2 className="mr-2 h-5 w-5 text-gray-500" />
      <h2>{isViewMode ? '이용권 상세 정보' : (membershipType ? '이용권 수정' : '새 이용권 추가')}</h2>
    </div>
  );

  const renderFooter = () => (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
        disabled={isSubmitting}
      >
        {isViewMode ? '닫기' : '취소'}
      </button>
      {!isViewMode && (
        <button
          type="submit"
          form="membership-type-form"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? '저장 중...' : (membershipType ? '수정' : '추가')}
        </button>
      )}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={renderHeader()}
      footer={renderFooter()}
      size="md"
    >
      <MembershipTypeForm
        formId="membership-type-form"
        initialMembershipType={membershipType}
        isViewMode={isViewMode}
        onSubmitSuccess={onSaveSuccess}
        setSubmitLoading={setIsSubmitting}
      />
    </Modal>
  );
};

export default MembershipTypeModal; 