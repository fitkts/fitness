import React, { useState, useEffect } from 'react';
import { Archive, Clock, Download, Trash2, HardDrive, RotateCw, AlertCircle, CheckCircle, X } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast, ToastType } from '../contexts/ToastContext';

// 이 파일은 Electron 환경에서 실행되므로 IPC 통신을 통해 백업 관련 기능을 사용
// 실제 구현에서는 preload.js 등을 통해 window.api로 접근
declare global {
  interface Window {
    api?: {
      manualBackup: () => Promise<{ success: boolean; path?: string; error?: string }>;
      getBackupList: () => Promise<string[]>;
      restoreBackup: (path: string) => Promise<boolean>;
      deleteBackup: (path: string) => Promise<boolean>;
    };
  }
}

interface BackupFile {
  filename: string;
  path: string;
  date: Date;
  size: string;
}

const Backup: React.FC = () => {
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupFile | null>(null);
  const { showToast } = useToast();

  const api = window.api;

  // 초기 백업 목록 로드
  useEffect(() => {
    loadBackupFiles();
  }, []);

  // 백업 파일 목록 로드
  const loadBackupFiles = async () => {
    if (!api) {
      showToast('error', '백업 API를 사용할 수 없습니다. (preload 설정 확인 필요)');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const filenames = await api.getBackupList();
      
      // 파일명에서 정보 추출 및 백업 객체 생성
      const backups: BackupFile[] = filenames.map(filename => {
        // 파일명에서 날짜 파싱 (예: backup_20230320_143022.zip)
        const dateParts = filename.replace('backup_', '').replace('.zip', '').split('_');
        const year = dateParts[0].substring(0, 4);
        const month = dateParts[0].substring(4, 6);
        const day = dateParts[0].substring(6, 8);
        const hour = dateParts[1].substring(0, 2);
        const minute = dateParts[1].substring(2, 4);
        const second = dateParts[1].substring(4, 6);
        
        const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
        
        // 가상의 파일 크기 생성 (실제로는 파일 시스템에서 가져와야 함)
        const sizeMB = (Math.random() * 5 + 1).toFixed(2);
        
        return {
          filename,
          path: `/backups/${filename}`, // 실제 경로는 다를 수 있음
          date,
          size: `${sizeMB} MB`
        };
      });
      
      // 날짜순 정렬 (최신 백업이 위에 오도록)
      backups.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      setBackupFiles(backups);
    } catch (error) {
      console.error('백업 목록 로드 오류:', error);
      showToast('error', '백업 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 수동 백업 실행
  const handleManualBackup = async () => {
    if (!api) {
      showToast('error', '백업 API를 사용할 수 없습니다.');
      return;
    }
    try {
      setIsBackingUp(true);
      const result = await api.manualBackup();
      
      if (result.success) {
        showToast('success', '백업이 성공적으로 생성되었습니다.');
        loadBackupFiles();
      } else {
        showToast('error', `백업 생성 실패: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('백업 생성 오류:', error);
      showToast('error', '백업 생성 중 오류가 발생했습니다.');
    } finally {
      setIsBackingUp(false);
    }
  };

  // 백업 복원 확인 모달 표시
  const handleRestoreClick = (backup: BackupFile) => {
    setSelectedBackup(backup);
  };

  // 백업 복원 실행
  const handleRestoreConfirm = async () => {
    if (!selectedBackup) return;
    if (!api) {
      showToast('error', '백업 API를 사용할 수 없습니다.');
      return;
    }
    
    try {
      setIsRestoring(true);
      const success = await api.restoreBackup(selectedBackup.path);
      
      if (success) {
        showToast('success', '백업이 성공적으로 복원되었습니다. 프로그램을 재시작합니다.');
        // TODO: 실제 구현에서는 여기서 애플리케이션 재시작 로직
      } else {
        showToast('error', '백업 복원에 실패했습니다.');
      }
    } catch (error) {
      console.error('백업 복원 오류:', error);
      showToast('error', '백업 복원 중 오류가 발생했습니다.');
    } finally {
      setIsRestoring(false);
      setSelectedBackup(null);
    }
  };

  // 백업 삭제
  const handleDeleteBackup = async (backup: BackupFile) => {
    if (!confirm(`'${format(backup.date, 'yyyy-MM-dd HH:mm')}' 백업을 삭제하시겠습니까?`)) {
      return;
    }
    if (!api) {
      showToast('error', '백업 API를 사용할 수 없습니다.');
      return;
    }
    
    try {
      const success = await api.deleteBackup(backup.path);
      
      if (success) {
        setBackupFiles(backupFiles.filter(file => file.path !== backup.path));
        showToast('success', '백업이 삭제되었습니다.');
      } else {
        showToast('error', '백업 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('백업 삭제 오류:', error);
      showToast('error', '백업 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">백업 관리</h1>
        <button 
          className="btn btn-primary flex items-center"
          onClick={handleManualBackup}
          disabled={isBackingUp}
        >
          {isBackingUp ? (
            <RotateCw size={20} className="mr-1 animate-spin" />
          ) : (
            <Archive size={20} className="mr-1" />
          )}
          {isBackingUp ? '백업 생성 중...' : '수동 백업 생성'}
        </button>
      </div>

      {/* 백업 정보 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center text-primary-600 mb-4">
            <Clock size={24} className="mr-2" />
            <h2 className="text-lg font-semibold">자동 백업</h2>
          </div>
          <p className="text-gray-600 mb-4">
            매일 자정에 시스템이 자동으로 백업을 생성합니다.
          </p>
          <div className="text-sm text-gray-500">
            마지막 자동 백업: {backupFiles[0] ? format(backupFiles[0].date, 'yyyy-MM-dd HH:mm', { locale: ko }) : '없음'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center text-green-600 mb-4">
            <HardDrive size={24} className="mr-2" />
            <h2 className="text-lg font-semibold">백업 저장 위치</h2>
          </div>
          <p className="text-gray-600 mb-4">
            백업 파일은 다음 위치에 안전하게 저장됩니다:
          </p>
          <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all">
            C:\Users\AppData\Local\fitness-manager\backups
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center text-blue-600 mb-4">
            <Archive size={24} className="mr-2" />
            <h2 className="text-lg font-semibold">백업 정보</h2>
          </div>
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>총 백업 수:</span>
              <span className="font-semibold">{backupFiles.length}개</span>
            </div>
            <div className="flex justify-between">
              <span>최근 백업:</span>
              <span className="font-semibold">
                {backupFiles[0] ? formatDistanceToNow(backupFiles[0].date, { addSuffix: true, locale: ko }) : '없음'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>백업 주기:</span>
              <span className="font-semibold">매일 자정</span>
            </div>
          </div>
        </div>
      </div>

      {/* 백업 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">백업 목록</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <RotateCw size={24} className="animate-spin mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">백업 목록을 불러오는 중...</p>
          </div>
        ) : backupFiles.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Archive size={48} className="mx-auto mb-4 text-gray-300" />
            <p>백업 파일이 없습니다.</p>
            <p className="text-sm mt-1">
              '수동 백업 생성' 버튼을 클릭하여 첫 번째 백업을 생성하세요.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    백업 일시
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    파일명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    크기
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    경과
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backupFiles.map((backup) => (
                  <tr key={backup.path} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(backup.date, 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                      {backup.filename}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {backup.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDistanceToNow(backup.date, { addSuffix: true, locale: ko })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        onClick={() => handleRestoreClick(backup)}
                      >
                        <Download size={18} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteBackup(backup)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 복원 확인 모달 */}
      {selectedBackup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">백업 복원 확인</h3>
            <div className="mb-6">
              <p className="text-red-600 font-medium mb-2">주의: 이 작업은 현재 데이터를 백업 데이터로 대체합니다.</p>
              <p className="text-gray-600">
                {format(selectedBackup.date, 'yyyy-MM-dd HH:mm', { locale: ko })} 시점의 백업으로 복원하시겠습니까?
                저장되지 않은 모든 변경사항은 손실됩니다.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedBackup(null)}
              >
                취소
              </button>
              <button
                className="btn btn-primary flex items-center"
                onClick={handleRestoreConfirm}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <>
                    <RotateCw size={18} className="mr-1 animate-spin" />
                    복원 중...
                  </>
                ) : (
                  <>
                    <Download size={18} className="mr-1" />
                    복원하기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backup; 