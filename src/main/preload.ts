import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings: any) =>
    ipcRenderer.invoke('save-settings', settings),
  relaunchApp: () => ipcRenderer.send('relaunch-app'),
  // 출석 관련
  addAttendanceRecord: (record: {
    memberId: number;
    visitDate: string;
    memberName?: string;
  }) => ipcRenderer.invoke('add-attendance-record', record),
  deleteAttendanceRecord: (recordId: number) =>
    ipcRenderer.invoke('delete-attendance-record', recordId),
  // 회원 검색
  searchMembers: (searchTerm: string) =>
    ipcRenderer.invoke('search-members', searchTerm),
  // 다른 IPC 통신 함수들도 필요에 따라 여기에 추가할 수 있습니다.
});
