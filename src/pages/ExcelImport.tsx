import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { importMembersFromExcel } from '../database/ipcService';
import * as XLSX from 'xlsx';

const ExcelImport: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const { showToast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processExcelFile = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          const result = await importMembersFromExcel(jsonData);
          if (result.success) {
            setImportResults({
              success: result.data.successCount,
              failed: result.data.failedCount,
              errors: result.data.errors
            });
            showToast('success', '회원 정보가 성공적으로 가져와졌습니다.');
          } else {
            throw new Error(result.error || '가져오기 실패');
          }
        } catch (error) {
          console.error('Excel 처리 오류:', error);
          showToast('error', 'Excel 파일 처리 중 오류가 발생했습니다.');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('파일 읽기 오류:', error);
      showToast('error', '파일을 읽는 중 오류가 발생했습니다.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel') {
        processExcelFile(file);
      } else {
        showToast('error', 'Excel 파일만 업로드 가능합니다.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel') {
        processExcelFile(file);
      } else {
        showToast('error', 'Excel 파일만 업로드 가능합니다.');
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">회원 정보 가져오기</h1>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer"
        >
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">📄</div>
            <div className="text-lg">
              Excel 파일을 여기에 끌어다 놓거나 클릭하여 선택하세요
            </div>
            <div className="text-sm text-gray-500">
              지원 형식: .xlsx, .xls
            </div>
          </div>
        </label>
      </div>

      {importResults && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">가져오기 결과</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>성공:</span>
              <span className="text-green-600">{importResults.success}건</span>
            </div>
            <div className="flex justify-between">
              <span>실패:</span>
              <span className="text-red-600">{importResults.failed}건</span>
            </div>
            {importResults.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">오류 목록:</h3>
                <ul className="list-disc list-inside text-sm text-red-600">
                  {importResults.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelImport; 