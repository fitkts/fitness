// 임시 preload.js 파일 (실제 로직은 preload.ts 참고) 

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  relaunchApp: () => ipcRenderer.send('relaunch-app'),
  // 출석 관련
  addAttendanceRecord: (record) => ipcRenderer.invoke('add-attendance-record', record),
  deleteAttendanceRecord: (recordId) => ipcRenderer.invoke('delete-attendance-record', recordId),
  // 회원 검색
  searchMembers: (searchTerm) => ipcRenderer.invoke('search-members', searchTerm),
  // 추가된 함수들
  getAllMembers: () => ipcRenderer.invoke('get-all-members'),
  addMember: (member) => ipcRenderer.invoke('add-member', member),
  updateMember: (member) => ipcRenderer.invoke('update-member', member),
  deleteMember: (id) => ipcRenderer.invoke('delete-member', id),
  deleteAllMembers: () => ipcRenderer.invoke('delete-all-members'),
  selectExcelFile: () => ipcRenderer.invoke('select-excel-file'),
  manualBackup: () => ipcRenderer.invoke('manual-backup'),
  generateDummyMembers: (count) => ipcRenderer.invoke('generate-dummy-members', count),
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
  getAllPayments: () => ipcRenderer.invoke('get-all-payments'),
  addPayment: (paymentData) => ipcRenderer.invoke('add-payment', paymentData),
  updatePayment: (id, paymentData) => ipcRenderer.invoke('update-payment', id, paymentData),
  deletePayment: (id) => ipcRenderer.invoke('delete-payment', id),
  getAllMembershipTypes: () => ipcRenderer.invoke('get-all-membership-types'),
  addMembershipType: (typeData) => ipcRenderer.invoke('add-membership-type', typeData),
  updateMembershipType: (typeData) => ipcRenderer.invoke('update-membership-type', typeData),
  deleteMembershipType: (id) => ipcRenderer.invoke('delete-membership-type', id),
  getAllStaff: () => ipcRenderer.invoke('get-all-staff'),
  getStaffById: (id) => ipcRenderer.invoke('get-staff-by-id', id),
  addStaff: (staff) => ipcRenderer.invoke('add-staff', staff),
  updateStaff: (id, staff) => ipcRenderer.invoke('update-staff', id, staff),
  deleteStaff: (id) => ipcRenderer.invoke('delete-staff', id),
  getAllLockers: (page, pageSize, searchTerm, status) => ipcRenderer.invoke('get-all-lockers', page, pageSize, searchTerm, status),
  getLockerById: (id) => ipcRenderer.invoke('get-locker-by-id', id),
  addLocker: (locker) => ipcRenderer.invoke('add-locker', locker),
  updateLocker: (id, locker) => ipcRenderer.invoke('update-locker', id, locker),
  deleteLocker: (id) => ipcRenderer.invoke('delete-locker', id),
  // 락커 히스토리 및 통계 관련
  getLockerHistory: (filter) => ipcRenderer.invoke('get-locker-history', filter),
  getLockerHistoryById: (lockerId) => ipcRenderer.invoke('get-locker-history-by-id', lockerId),
  getLockerStatistics: () => ipcRenderer.invoke('get-locker-statistics'),
  getLockerDashboardData: () => ipcRenderer.invoke('get-locker-dashboard-data'),
  importMembersFromExcel: (data) => ipcRenderer.invoke('import-members-excel', data),
  getAttendanceByDate: (date) => ipcRenderer.invoke('get-attendance-by-date', date),
  getMembersWithPagination: (page, pageSize, options) => ipcRenderer.invoke('get-members-pagination', page, pageSize, options),
  // 상담 기록 관련
  addConsultationRecord: (recordData) => ipcRenderer.invoke('add-consultation-record', recordData),
  getConsultationRecordsByMember: (memberId) => ipcRenderer.invoke('get-consultation-records-by-member', memberId),
  getAllConsultationRecords: () => ipcRenderer.invoke('get-all-consultation-records'),
  // 상담 회원 관련
  getAllConsultationMembers: () => ipcRenderer.invoke('get-all-consultation-members'),
  addConsultationMember: (memberData) => ipcRenderer.invoke('add-consultation-member', memberData),
  updateConsultationMember: (id, updates) => ipcRenderer.invoke('update-consultation-member', id, updates),
  deleteConsultationMember: (id) => ipcRenderer.invoke('delete-consultation-member', id),
  getConsultationMemberById: (id) => ipcRenderer.invoke('get-consultation-member-by-id', id),
  // 회원 승격 관련 API
  promoteConsultationMember: (promotionData) => ipcRenderer.invoke('promote-consultation-member', promotionData),
  // 다른 IPC 통신 함수들도 필요에 따라 여기에 추가할 수 있습니다.
}); 
