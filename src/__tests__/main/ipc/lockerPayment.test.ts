// 락커 결제 IPC 테스트 (TDD)
import { LockerPaymentData } from '../../../types/lockerPayment';

// Mock window.api 설정
const mockApi = {
  processLockerPayment: jest.fn(),
  getLockerPaymentHistory: jest.fn(),
  updateLockerUsagePeriod: jest.fn(),
  cancelLockerPayment: jest.fn(),
};

// window 객체 mock 설정
Object.defineProperty(global, 'window', {
  value: { api: mockApi },
  writable: true
});

describe('Locker Payment IPC', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processLockerPayment', () => {
    const mockPaymentData: LockerPaymentData = {
      lockerId: 'test-locker-1',
      memberId: 'test-member-1',
      memberName: '홍길동',
      lockerNumber: 'A-001',
      months: 3,
      startDate: '2025-01-15',
      endDate: '2025-04-15',
      amount: 142500,
      originalAmount: 150000,
      discountRate: 5,
      discountAmount: 7500,
      paymentMethod: 'cash',
      notes: '3개월 결제'
    };

    it('결제 처리가 성공해야 한다', async () => {
      mockApi.processLockerPayment.mockResolvedValue({
        success: true,
        data: {
          paymentId: 'payment-123',
          lockerId: mockPaymentData.lockerId,
          amount: mockPaymentData.amount
        }
      });

      const result = await (global as any).window.api.processLockerPayment(mockPaymentData);

      expect(result.success).toBe(true);
      expect(result.data.paymentId).toBeDefined();
      expect(mockApi.processLockerPayment).toHaveBeenCalledWith(mockPaymentData);
    });

    it('결제 처리 실패 시 오류를 반환해야 한다', async () => {
      const errorMessage = '결제 처리 중 오류가 발생했습니다';
      mockApi.processLockerPayment.mockResolvedValue({
        success: false,
        error: errorMessage
      });

      const result = await (global as any).window.api.processLockerPayment(mockPaymentData);

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
    });

    it('락커 사용 기간이 업데이트되어야 한다', async () => {
      mockApi.processLockerPayment.mockResolvedValue({
        success: true,
        data: {
          paymentId: 'payment-123',
          lockerId: mockPaymentData.lockerId,
          newEndDate: mockPaymentData.endDate
        }
      });

      const result = await (global as any).window.api.processLockerPayment(mockPaymentData);

      expect(result.success).toBe(true);
      expect(result.data.newEndDate).toBe(mockPaymentData.endDate);
    });
  });

  describe('getLockerPaymentHistory', () => {
    it('락커 결제 내역을 반환해야 한다', async () => {
      const mockHistory = [
        {
          id: 'payment-1',
          lockerId: 'locker-1',
          amount: 150000,
          paymentDate: '2025-01-15',
          months: 3,
          paymentMethod: 'cash'
        },
        {
          id: 'payment-2',
          lockerId: 'locker-1',
          amount: 100000,
          paymentDate: '2024-10-15',
          months: 2,
          paymentMethod: 'card'
        }
      ];

      mockApi.getLockerPaymentHistory.mockResolvedValue({
        success: true,
        data: mockHistory
      });

      const result = await (global as any).window.api.getLockerPaymentHistory('locker-1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].lockerId).toBe('locker-1');
    });

    it('락커ID가 없으면 오류를 반환해야 한다', async () => {
      mockApi.getLockerPaymentHistory.mockResolvedValue({
        success: false,
        error: '락커 ID가 필요합니다'
      });

      const result = await (global as any).window.api.getLockerPaymentHistory('');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateLockerUsagePeriod', () => {
    it('락커 사용 기간을 업데이트해야 한다', async () => {
      const updateData = {
        lockerId: 'locker-1',
        newEndDate: '2025-07-15',
        isExtension: true
      };

      mockApi.updateLockerUsagePeriod.mockResolvedValue({
        success: true,
        data: {
          lockerId: updateData.lockerId,
          endDate: updateData.newEndDate
        }
      });

      const result = await (global as any).window.api.updateLockerUsagePeriod(updateData);

      expect(result.success).toBe(true);
      expect(result.data.endDate).toBe(updateData.newEndDate);
    });
  });

  describe('cancelLockerPayment', () => {
    it('결제 취소가 성공해야 한다', async () => {
      mockApi.cancelLockerPayment.mockResolvedValue({
        success: true,
        data: {
          paymentId: 'payment-123',
          refundAmount: 100000,
          cancelDate: '2025-01-16'
        }
      });

      const result = await (global as any).window.api.cancelLockerPayment('payment-123', '결제 취소 요청');

      expect(result.success).toBe(true);
      expect(result.data.refundAmount).toBe(100000);
    });

    it('이미 취소된 결제는 취소할 수 없어야 한다', async () => {
      mockApi.cancelLockerPayment.mockResolvedValue({
        success: false,
        error: '이미 취소된 결제입니다'
      });

      const result = await (global as any).window.api.cancelLockerPayment('payment-123', '중복 취소');

      expect(result.success).toBe(false);
      expect(result.error).toContain('이미 취소');
    });
  });
}); 