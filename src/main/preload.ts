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
  // 추가된 함수들
  getAllMembers: () => ipcRenderer.invoke('get-all-members'),
  addMember: (member: any) => ipcRenderer.invoke('add-member', member),
  updateMember: (member: any) => ipcRenderer.invoke('update-member', member),
  deleteMember: (id: number) => ipcRenderer.invoke('delete-member', id),
  deleteAllMembers: () => ipcRenderer.invoke('delete-all-members'),
  selectExcelFile: () => ipcRenderer.invoke('select-excel-file'),
  manualBackup: () => ipcRenderer.invoke('manual-backup'),
  generateDummyMembers: (count: number) => ipcRenderer.invoke('generate-dummy-members', count),
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
  getAllPayments: () => ipcRenderer.invoke('get-all-payments'),
  addPayment: (paymentData: any) => ipcRenderer.invoke('add-payment', paymentData),
  updatePayment: (id: number, paymentData: any) => ipcRenderer.invoke('update-payment', id, paymentData),
  deletePayment: (id: number) => ipcRenderer.invoke('delete-payment', id),
  getAllMembershipTypes: () => ipcRenderer.invoke('get-all-membership-types'),
  addMembershipType: (typeData: any) => ipcRenderer.invoke('add-membership-type', typeData),
  updateMembershipType: (typeData: any) => ipcRenderer.invoke('update-membership-type', typeData),
  deleteMembershipType: (id: number) => ipcRenderer.invoke('delete-membership-type', id),
  getAllStaff: () => ipcRenderer.invoke('get-all-staff'),
  getStaffById: (id: number) => ipcRenderer.invoke('get-staff-by-id', id),
  addStaff: (staff: any) => ipcRenderer.invoke('add-staff', staff),
  updateStaff: (id: number, staff: any) => ipcRenderer.invoke('update-staff', id, staff),
  deleteStaff: (id: number) => ipcRenderer.invoke('delete-staff', id),
  getAllLockers: () => ipcRenderer.invoke('get-all-lockers'),
  getLockerById: (id: number) => ipcRenderer.invoke('get-locker-by-id', id),
  addLocker: (locker: any) => ipcRenderer.invoke('add-locker', locker),
  updateLocker: (id: number, locker: any) => ipcRenderer.invoke('update-locker', id, locker),
  deleteLocker: (id: number) => ipcRenderer.invoke('delete-locker', id),
  importMembersFromExcel: (data: any[]) => ipcRenderer.invoke('import-members-excel', data),
  getAttendanceByDate: (date: string) => ipcRenderer.invoke('get-attendance-by-date', date),
  getMembersWithPagination: (page: number, pageSize: number, options: any) =>
    ipcRenderer.invoke('get-members-pagination', page, pageSize, options),
  // 다른 IPC 통신 함수들도 필요에 따라 여기에 추가할 수 있습니다.
});
