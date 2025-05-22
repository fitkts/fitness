import {
  getAllLockers,
  getLockerById,
  addLocker,
  updateLocker,
  deleteLocker,
} from '../database/lockerRepository';
import { getDatabase } from '../database/setup';
import { Locker } from '../models/types';

// 데이터베이스 모의
jest.mock('../database/setup', () => ({
  getDatabase: jest.fn(),
}));

describe('lockerRepository', () => {
  const mockDb = {
    prepare: jest.fn(),
  };

  beforeEach(() => {
    (getDatabase as jest.Mock).mockReturnValue(mockDb);
    mockDb.prepare.mockReturnValue({
      all: jest.fn(),
      get: jest.fn(),
      run: jest.fn(),
    });
  });

  describe('getAllLockers', () => {
    test('모든 락커를 정상적으로 조회해야 함', async () => {
      const mockLockers = [
        {
          id: 1,
          number: '101',
          status: 'available',
          member_id: null,
          member_name: null,
          start_date: null,
          end_date: null,
          notes: null,
          created_at: 1710892800,
          updated_at: 1710892800,
        },
      ];

      mockDb.prepare().all.mockReturnValue(mockLockers);

      const result = await getAllLockers();
      expect(result).toHaveLength(1);
      expect(result[0].number).toBe('101');
    });
  });

  describe('getLockerById', () => {
    test('ID로 락커를 정상적으로 조회해야 함', async () => {
      const mockLocker = {
        id: 1,
        number: '101',
        status: 'available',
        member_id: null,
        member_name: null,
        start_date: null,
        end_date: null,
        notes: null,
        created_at: 1710892800,
        updated_at: 1710892800,
      };

      mockDb.prepare().get.mockReturnValue(mockLocker);

      const result = await getLockerById(1);
      expect(result).not.toBeNull();
      expect(result?.number).toBe('101');
    });
  });

  describe('addLocker', () => {
    test('새 락커를 정상적으로 추가해야 함', async () => {
      const newLocker: Omit<Locker, 'id' | 'createdAt' | 'updatedAt'> = {
        number: '101',
        status: 'available',
      };

      mockDb.prepare().run.mockReturnValue({ lastInsertRowid: 1 });

      const result = await addLocker(newLocker);
      expect(result).toBe(1);
    });
  });

  describe('updateLocker', () => {
    test('락커 정보를 정상적으로 수정해야 함', async () => {
      const updateData = {
        status: 'occupied',
        memberId: 1,
        startDate: '2024-03-20',
        endDate: '2024-04-20',
      };

      mockDb.prepare().run.mockReturnValue({ changes: 1 });

      const result = await updateLocker(1, updateData);
      expect(result).toBe(true);
    });
  });

  describe('deleteLocker', () => {
    test('락커를 정상적으로 삭제해야 함', async () => {
      mockDb.prepare().run.mockReturnValue({ changes: 1 });

      const result = await deleteLocker(1);
      expect(result).toBe(true);
    });
  });
}); 