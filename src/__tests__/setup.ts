import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// 테스트 타임아웃 설정
configure({ asyncUtilTimeout: 5000 });

// Mock window.api
window.api = {
  getAllLockers: jest.fn(),
  addLocker: jest.fn(),
  updateLocker: jest.fn(),
  deleteLocker: jest.fn(),
  searchMembers: jest.fn(),
};

// Mock ToastContext
jest.mock('../contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
})); 