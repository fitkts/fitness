import React, { useState } from 'react';
import { Download, Upload, Info, X as CloseIcon } from 'lucide-react';
import { Member } from '../../models/types';
import { EXCEL_CONFIG } from '../../config/memberConfig';
import * as XLSX from 'xlsx';

interface MemberExcelActionsProps {
  members: Member[];
  onImportSuccess: () => void;
  showToast: (type: 'success' | 'error', message: string) => void;
}

const MemberExcelActions: React.FC<MemberExcelActionsProps> = ({
  members,
  onImportSuccess,
  showToast,
}) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleExport = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(members);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, EXCEL_CONFIG.SHEET_NAME);
      XLSX.writeFile(wb, EXCEL_CONFIG.FILE_NAME);
      showToast('success', '엑셀 파일이 성공적으로 내보내졌습니다.');
    } catch (error) {
      console.error('엑셀 내보내기 오류:', error);
      showToast('error', '엑셀 내보내기 중 오류가 발생했습니다.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        showToast('success', '엑셀 데이터를 성공적으로 가져왔습니다.');
        onImportSuccess();
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('엑셀 불러오기 오류:', error);
      showToast('error', '엑셀 파일 처리 중 오류가 발생했습니다.');
    }

    // 파일 input 초기화
    e.target.value = '';
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsInfoModalOpen(false);
    }
  };

  return (
    <>
      {/* 엑셀 버튼 그룹 */}
      <div className="flex gap-1 items-center">
        <button
          title="엑셀 불러오기"
          className="bg-gray-100 border-none rounded p-2 cursor-pointer hover:bg-gray-200"
          onClick={() => document.getElementById('excel-import-input')?.click()}
        >
          <Upload size={16} />
        </button>
        <input
          id="excel-import-input"
          type="file"
          accept={EXCEL_CONFIG.SUPPORTED_FORMATS}
          style={{ display: 'none' }}
          onChange={handleImport}
        />
        <button
          title="엑셀 내보내기"
          className="bg-gray-100 border-none rounded p-2 cursor-pointer hover:bg-gray-200"
          onClick={handleExport}
        >
          <Download size={16} />
        </button>
        <button
          title="엑셀 형식 안내"
          className="bg-transparent border-none p-1 cursor-pointer"
          onClick={() => setIsInfoModalOpen(true)}
        >
          <Info size={15} color="#888" />
        </button>
      </div>

      {/* 엑셀 형식 안내 모달 */}
      {isInfoModalOpen && (
        <div
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.2)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: 24,
              minWidth: 340,
              boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
              position: 'relative',
              maxWidth: 420,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsInfoModalOpen(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="닫기"
            >
              <CloseIcon size={18} color="#888" />
            </button>
            <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>
              엑셀 데이터 형식 안내
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  borderCollapse: 'collapse',
                  width: '100%',
                  fontSize: 14,
                  background: '#fafbfc',
                }}
              >
                <thead>
                  <tr>
                    {EXCEL_CONFIG.SAMPLE_HEADERS.map((header, index) => (
                      <th
                        key={index}
                        style={{
                          border: '1px solid #d1d5db',
                          padding: 8,
                          background: '#f3f4f6',
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {Object.values(EXCEL_CONFIG.SAMPLE_DATA).map((value, index) => (
                      <td
                        key={index}
                        style={{ border: '1px solid #d1d5db', padding: 8 }}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 12, color: '#666', fontSize: 13 }}>
              ※ 엑셀 파일의 첫 행은 반드시 <b>컬럼명</b>이어야 하며, 위 예시와
              같은 형식으로 데이터를 입력해주세요.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MemberExcelActions; 