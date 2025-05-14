import React from 'react';
import { Payment, MembershipTypeOption, PaymentMethod, PaymentStatus } from '../../types/payment';
import { PaymentOption } from '../../types/payment';
import { formatCurrency } from './PaymentUtils';
import MemberSearchInput from './MemberSearchInput';
import MembershipTypeSelect from './MembershipTypeSelect';
import AmountInput from './AmountInput';
import PaymentDatePicker from './PaymentDatePicker';

interface PaymentFormProps {
  formData: Payment;
  errors: Record<string, string>;
  memberSearch: string;
  filteredMembers: PaymentOption[];
  membershipTypeOptions: MembershipTypeOption[];
  isViewMode: boolean;
  isSubmitting: boolean;
  onMemberSearchChange: (value: string) => void;
  onSelectMember: (id: number, name: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onOpenMembershipTypeModal?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  formData,
  errors,
  memberSearch,
  filteredMembers,
  membershipTypeOptions,
  isViewMode,
  isSubmitting,
  onMemberSearchChange,
  onSelectMember,
  handleChange,
  onOpenMembershipTypeModal,
}) => {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <MemberSearchInput 
        memberSearch={memberSearch}
        filteredMembers={filteredMembers}
        isViewMode={isViewMode}
        isSubmitting={isSubmitting}
        selectedMemberName={formData.memberName}
        onMemberSearchChange={onMemberSearchChange}
        onSelectMember={onSelectMember}
        error={errors.memberId || errors.memberName}
      />

      <MembershipTypeSelect
        membershipType={formData.membershipType}
        membershipTypeOptions={membershipTypeOptions}
        isViewMode={isViewMode}
        isSubmitting={isSubmitting}
        error={errors.membershipType}
        handleChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)}
        onOpenMembershipTypeModal={onOpenMembershipTypeModal}
      />

      <AmountInput 
        amount={formData.amount}
        isViewMode={isViewMode}
        isSubmitting={isSubmitting}
        error={errors.amount}
        handleChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          결제 방법 <span className="text-red-500">*</span>
        </label>
        {isViewMode ? (
          <div className="p-2 border rounded bg-gray-50 min-h-[40px] flex items-center">{formData.paymentMethod}</div>
        ) : (
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${errors.paymentMethod ? 'border-red-500' : 'border-gray-300'}`}
            disabled={isSubmitting}
            required
          >
            {Object.values(PaymentMethod).map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        )}
        {errors.paymentMethod && (
          <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
        )}
      </div>

      <PaymentDatePicker
        label="결제일"
        name="paymentDate"
        value={formData.paymentDate}
        isViewMode={isViewMode}
        isSubmitting={isSubmitting}
        error={errors.paymentDate}
        required={true}
        handleChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)}
      />

      <PaymentDatePicker
        label="시작일"
        name="startDate"
        value={formData.startDate}
        isViewMode={isViewMode}
        isSubmitting={isSubmitting}
        error={errors.startDate}
        required={true}
        handleChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          종료일
        </label>
        <div className="p-2 border rounded bg-gray-50 min-h-[40px] flex items-center">{formData.endDate || '-'}</div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          상태 <span className="text-red-500">*</span>
        </label>
        {isViewMode ? (
          <div className="p-2 border rounded bg-gray-50 min-h-[40px] flex items-center">{formData.status}</div>
        ) : (
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
            disabled={isSubmitting}
            required
          >
            {Object.values(PaymentStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        )}
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          메모
        </label>
        {isViewMode ? (
          <div className="p-2 border rounded bg-gray-50 min-h-[60px] whitespace-pre-wrap">
            {formData.notes || '-'}
          </div>
        ) : (
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 min-h-[60px]"
            disabled={isSubmitting}
          />
        )}
      </div>
    </form>
  );
};

export default PaymentForm; 