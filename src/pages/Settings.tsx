import React, { useState, useEffect } from 'react';
import {
  Save,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  Database,
  Archive,
  HelpCircle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useToast, ToastType } from '../contexts/ToastContext';
import { SettingsData } from '../types'; // SettingsData 임포트

// SaveStatus 타입 정의
type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

// SettingsData 인터페이스는 ../types에서 임포트하므로 여기서는 제거
// declare global 블록은 src/types/electron.d.ts에서 관리하므로 여기서는 제거

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData>(() => {
    return {
      theme: 'system',
      backupSchedule: 'daily',
      backupCount: 30,
      notificationsEnabled: true,
      notificationsBeforeMembershipEnd: 7,
      autoDeleteBackup: true,
      developerMode: false,
    };
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [activeSection, setActiveSection] = useState<string>('appearance');
  const { showToast } = useToast();

  // 설정 로드
  useEffect(() => {
    const loadAppSettings = async () => {
      setIsLoading(true);
      try {
        if (window.api && window.api.loadSettings) {
          const loadedSettings = await window.api.loadSettings();
          if (
            loadedSettings &&
            typeof loadedSettings === 'object' &&
            Object.keys(loadedSettings).length > 0
          ) {
            setSettings((prevSettings) => ({
              ...prevSettings,
              ...loadedSettings,
            }));
            showToast('success', '설정을 불러왔습니다.');
          } else {
            showToast(
              'info',
              '저장된 설정이 없거나 유효하지 않습니다. 기본 설정을 사용합니다.',
            );
          }
        } else {
          console.warn('Electron API (loadSettings) is not available.');
          showToast('warning', '설정 API를 사용할 수 없습니다.');
        }
      } catch (error) {
        console.error('설정 로드 오류:', error);
        showToast('error', '설정을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    loadAppSettings();
  }, [showToast]);

  // 설정 변경 핸들러
  const handleSettingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setSettings((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 설정 저장 핸들러
  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    setIsLoading(true);
    try {
      if (window.api && window.api.saveSettings) {
        const result = await window.api.saveSettings(settings);
        if (result.success) {
          setSaveStatus('success');
          showToast('success', '설정이 성공적으로 저장되었습니다.');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          const errorMessage =
            result.error || '알 수 없는 오류로 설정 저장에 실패했습니다.';
          console.error('API로부터 설정 저장 실패 응답:', errorMessage);
          throw new Error(errorMessage);
        }
      } else {
        console.warn('Electron API (saveSettings) is not available.');
        throw new Error('설정 저장 API를 사용할 수 없습니다.');
      }
    } catch (error) {
      console.error('설정 저장 오류:', error);
      setSaveStatus('error');
      showToast('error', `설정 저장 중 오류: ${(error as Error).message}`);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // 섹션 변경 핸들러
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // 각 섹션에 맞는 아이콘 반환
  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'appearance':
        return <Sun size={20} />;
      case 'backup':
        return <Archive size={20} />;
      case 'notifications':
        return <Bell size={20} />;
      case 'database':
        return <Database size={20} />;
      case 'advanced':
        return <SettingsIcon size={20} />;
      default:
        return <HelpCircle size={20} />;
    }
  };

  // 설정 섹션 렌더링
  const renderSettingsSection = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">화면 설정</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  테마
                </label>
                <select
                  name="theme"
                  className="input"
                  value={settings.theme}
                  onChange={handleSettingChange}
                >
                  <option value="light">밝은 테마</option>
                  <option value="dark">어두운 테마</option>
                  <option value="system">시스템 설정 사용</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'backup':
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">백업 설정</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  자동 백업 주기
                </label>
                <select
                  name="backupSchedule"
                  className="input"
                  value={settings.backupSchedule}
                  onChange={handleSettingChange}
                >
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  보관할 백업 수
                </label>
                <input
                  type="number"
                  name="backupCount"
                  className="input w-24"
                  min="1"
                  max="100"
                  value={settings.backupCount}
                  onChange={handleSettingChange}
                />
                <p className="text-sm text-gray-500 mt-1">
                  설정한 개수 이상의 백업이 있을 경우 오래된 백업부터 자동
                  삭제됩니다.
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="autoDeleteBackup"
                    className="rounded"
                    checked={settings.autoDeleteBackup}
                    onChange={handleSettingChange}
                  />
                  <span className="ml-2">오래된 백업 자동 삭제</span>
                </label>
                <p className="text-sm text-gray-500 mt-1 ml-6">
                  최대 백업 수에 도달했을 때 오래된 백업을 자동으로 삭제합니다.
                </p>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">알림 설정</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="notificationsEnabled"
                    className="rounded"
                    checked={settings.notificationsEnabled}
                    onChange={handleSettingChange}
                  />
                  <span className="ml-2">알림 사용</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  회원권 만료 알림 기간 (일)
                </label>
                <input
                  type="number"
                  name="notificationsBeforeMembershipEnd"
                  className="input w-24"
                  min="1"
                  max="30"
                  value={settings.notificationsBeforeMembershipEnd}
                  onChange={handleSettingChange}
                  disabled={!settings.notificationsEnabled}
                />
                <p className="text-sm text-gray-500 mt-1">
                  회원권 만료 전 알림을 표시할 일수입니다.
                </p>
              </div>
            </div>
          </div>
        );

      case 'database':
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">데이터베이스 설정</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <HelpCircle size={20} className="text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      데이터베이스 설정을 변경하면 애플리케이션이 재시작될 수
                      있습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    alert('데이터베이스가 압축되었습니다.');
                  }}
                >
                  데이터베이스 최적화
                </button>
                <p className="text-sm text-gray-500 mt-1">
                  데이터베이스를 압축하여 크기를 줄이고 성능을 향상시킵니다.
                </p>
              </div>

              <div className="pt-4 border-t">
                <button
                  type="button"
                  className="btn bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    if (
                      confirm(
                        '정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
                      )
                    ) {
                      alert('모든 데이터가 삭제되었습니다.');
                    }
                  }}
                >
                  모든 데이터 초기화
                </button>
                <p className="text-sm text-red-500 mt-1">
                  모든 회원, 출석, 결제 데이터를 삭제합니다. 이 작업은 되돌릴 수
                  없습니다.
                </p>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">고급 설정</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="developerMode"
                    className="rounded"
                    checked={settings.developerMode}
                    onChange={handleSettingChange}
                  />
                  <span className="ml-2">개발자 모드</span>
                </label>
                <p className="text-sm text-gray-500 mt-1 ml-6">
                  개발자 모드를 활성화하면 고급 기능과 로그를 볼 수 있습니다.
                </p>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-md font-medium mb-2">프로그램 정보</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">버전</span>
                      <span>1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">빌드 날짜</span>
                      <span>2023-03-20</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Electron</span>
                      <span>28.1.4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Node.js</span>
                      <span>20.11.5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>설정을 선택하세요</div>;
    }
  };

  // 로딩 중인 경우
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">설정</h1>
        <button
          className={`btn flex items-center ${
            saveStatus === 'error'
              ? 'bg-red-500 text-white'
              : saveStatus === 'success'
                ? 'bg-green-500 text-white'
                : 'btn-primary'
          }`}
          onClick={handleSaveSettings}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              저장 중...
            </>
          ) : saveStatus === 'success' ? (
            <>
              <CheckCircle size={20} className="mr-1" />
              저장됨
            </>
          ) : saveStatus === 'error' ? (
            <>
              <AlertCircle size={20} className="mr-1" />
              오류 발생
            </>
          ) : (
            <>
              <Save size={20} className="mr-1" />
              설정 저장
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* 설정 메뉴 사이드바 */}
        <div className="md:w-64 bg-white rounded-lg shadow p-4">
          <nav className="space-y-1">
            {[
              'appearance',
              'backup',
              'notifications',
              'database',
              'advanced',
            ].map((section) => (
              <button
                key={section}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeSection === section
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => handleSectionChange(section)}
              >
                <span className="mr-3">{getSectionIcon(section)}</span>
                <span className="capitalize">
                  {section === 'appearance'
                    ? '화면 설정'
                    : section === 'backup'
                      ? '백업 설정'
                      : section === 'notifications'
                        ? '알림 설정'
                        : section === 'database'
                          ? '데이터베이스'
                          : section === 'advanced'
                            ? '고급 설정'
                            : section}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* 설정 내용 */}
        <div className="flex-1 bg-white rounded-lg shadow p-6">
          {renderSettingsSection()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
