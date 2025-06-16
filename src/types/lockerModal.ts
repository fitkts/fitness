// 락커 모달 리팩토링을 위한 타입 정의
import { Locker, Member, LockerSize } from '../models/types';

// 공통 Props
export interface BaseLockerFormProps {
  isViewMode: boolean;
  errors: Record<string, string>;
}

// 기본 정보 컴포넌트
export interface LockerBasicInfoData {
  number: string;
  status: 'available' | 'occupied' | 'maintenance';
  size?: LockerSize;
  location?: string;
}

export interface LockerBasicInfoProps extends BaseLockerFormProps {
  formData: LockerBasicInfoData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSizeChange?: (size: LockerSize) => void;
}

// 회원 정보 컴포넌트
export interface LockerMemberInfoProps extends BaseLockerFormProps {
  selectedMember: Member | null;
  searchTerm: string;
  searchResults: Member[];
  isSearching: boolean;
  onSearch: (term: string) => void;
  onSelectMember: (member: Member) => void;
  onClearMember: () => void;
}

// 사용 기간 컴포넌트
export interface LockerUsagePeriodData {
  startDate?: string;
  endDate?: string;
}

export interface LockerUsagePeriodProps extends BaseLockerFormProps {
  formData: LockerUsagePeriodData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPeriodSelect: (months: number) => void;
}

// 결제 정보 컴포넌트
export interface LockerPaymentInfoProps {
  startDate?: string;
  endDate?: string;
  monthlyFee: number;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  isVisible: boolean;
}

// 비고 컴포넌트
export interface LockerNotesProps extends BaseLockerFormProps {
  notes?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

// 메인 모달 Props (기존)
export interface LockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (locker: Locker) => Promise<boolean>;
  locker?: Locker | null;
  isViewMode?: boolean;
} 