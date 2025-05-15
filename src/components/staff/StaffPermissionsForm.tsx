import React from 'react';
import { StaffPermissions } from '../../models/types'; // StaffPermissions 타입을 models/types.ts 에서 가져옵니다.

interface StaffPermissionsFormProps {
  permissions: StaffPermissions;
  isViewMode: boolean;
  isSubmitting: boolean;
  handlePermissionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setPermissionPreset: (preset: string) => void;
}

const StaffPermissionsForm: React.FC<StaffPermissionsFormProps> = ({
  permissions,
  isViewMode,
  isSubmitting,
  handlePermissionChange,
  setPermissionPreset,
}) => {
  // 권한 항목 정의 (향후 확장성 및 유지보수를 위해 배열로 관리)
  const permissionItems = [
    { id: 'dashboard', label: '대시보드' },
    { id: 'members', label: '회원 관리' },
    { id: 'attendance', label: '출석 관리' },
    { id: 'payment', label: '결제 관리' },
    { id: 'lockers', label: '락커 관리' },
    { id: 'staff', label: '직원 관리' },
    { id: 'excel', label: '엑셀 관리' },
    { id: 'backup', label: '백업 관리' },
    { id: 'settings', label: '환경 설정' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="text-lg font-medium text-gray-700">권한 설정</h3>
        {!isViewMode && (
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setPermissionPreset('admin')}
              className="text-xs py-1 px-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              disabled={isSubmitting}
            >
              관리자
            </button>
            <button
              type="button"
              onClick={() => setPermissionPreset('frontDesk')}
              className="text-xs py-1 px-2 bg-green-100 text-green-800 rounded hover:bg-green-200"
              disabled={isSubmitting}
            >
              프론트데스크
            </button>
            <button
              type="button"
              onClick={() => setPermissionPreset('trainer')}
              className="text-xs py-1 px-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
              disabled={isSubmitting}
            >
              트레이너
            </button>
            <button
              type="button"
              onClick={() => setPermissionPreset('partTime')}
              className="text-xs py-1 px-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
              disabled={isSubmitting}
            >
              아르바이트
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 border rounded">
        {permissionItems.map((item) => (
          <div className="flex items-center" key={item.id}>
            <input
              type="checkbox"
              id={item.id}
              name={item.id}
              checked={
                permissions?.[item.id as keyof StaffPermissions] || false
              } // permissions가 undefined일 경우 대비
              onChange={handlePermissionChange}
              className="w-4 h-4 text-blue-600 mr-2"
              disabled={isViewMode || isSubmitting}
            />
            <label htmlFor={item.id} className="text-sm">
              {item.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffPermissionsForm;
