import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast, ToastType } from '../contexts/ToastContext';
import {
  getMembersForAttendance,
  getAttendanceByDate,
} from '../database/ipcService';
import { AttendanceRecord } from '../types';

interface Member {
  id: number;
  name: string;
}

const Attendance: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [members, setMembers] = useState<Member[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const { showToast } = useToast();

  // 실제 데이터 로드 함수
  useEffect(() => {
    const loadAttendanceData = async () => {
      try {
        const memberRes = await getMembersForAttendance();
        const attendanceRes = await getAttendanceByDate(
          format(selectedDate, 'yyyy-MM-dd'),
        );

        if (memberRes.success && attendanceRes.success) {
          setMembers(memberRes.data);
          setAttendanceRecords(attendanceRes.data);
          setFilteredMembers(memberRes.data);
        } else {
          throw new Error('데이터 로드 실패');
        }
      } catch (error) {
        console.error('출석 데이터 로드 오류:', error);
        showToast('error', '출석 데이터를 불러오는데 실패했습니다.');
      }
    };
    loadAttendanceData();
  }, [selectedDate, showToast]);

  // 회원 검색 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMembers(members);
    } else {
      setFilteredMembers(
        members.filter((member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }
  }, [searchTerm, members]);

  // 달력 날짜 계산
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 월 이동 핸들러
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // 출석 체크 여부 확인
  const hasAttendance = (date: Date, memberId: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendanceRecords.some(
      (record) => record.visitDate === dateStr && record.memberId === memberId,
    );
  };

  // 출석 체크 핸들러
  const handleAttendanceCheck = async (
    memberId: number,
    memberName: string,
  ) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const existingRecord = attendanceRecords.find(
      (record) => record.visitDate === dateStr && record.memberId === memberId,
    );

    try {
      if (existingRecord) {
        if (window.api && window.api.deleteAttendanceRecord) {
          const response = await window.api.deleteAttendanceRecord(
            existingRecord.id,
          );
          if (response.success) {
            setAttendanceRecords((prevRecords) =>
              prevRecords.filter((record) => record.id !== existingRecord.id),
            );
            showToast('info', `${memberName}님 출석이 취소되었습니다.`);
          } else {
            showToast(
              'error',
              '출석 취소 실패: ' + (response.error || '알 수 없는 오류'),
            );
          }
        } else {
          showToast('error', '출석 취소 API를 사용할 수 없습니다.');
        }
      } else {
        if (window.api && window.api.addAttendanceRecord) {
          const newRecordData = { memberId, visitDate: dateStr, memberName }; // memberName도 함께 전달
          const response = await window.api.addAttendanceRecord(newRecordData);
          if (response.success && response.data) {
            setAttendanceRecords((prevRecords) => [
              ...prevRecords,
              response.data!,
            ]);
            showToast(
              'success',
              `${response.data.memberName || memberName}님 출석 처리되었습니다.`,
            );
          } else if (response.message) {
            // 이미 출석 처리된 경우 (main.ts에서 message 반환 시)
            showToast('info', response.message);
            // 이미 존재하는 기록을 상태에 추가할 필요가 있다면 여기서 추가 (response.data가 있을 경우)
            if (
              response.data &&
              !attendanceRecords.find((r) => r.id === response.data!.id)
            ) {
              setAttendanceRecords((prevRecords) => [
                ...prevRecords,
                response.data!,
              ]);
            }
          } else {
            showToast(
              'error',
              '출석 처리 실패: ' + (response.error || '알 수 없는 오류'),
            );
          }
        } else {
          showToast('error', '출석 처리 API를 사용할 수 없습니다.');
        }
      }
    } catch (error) {
      console.error('출석 처리 오류:', error);
      showToast('error', '출석 처리 중 오류가 발생했습니다.');
    }
  };

  // 해당 날짜의 출석 회원 수 확인
  const getAttendanceCount = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendanceRecords.filter((record) => record.visitDate === dateStr)
      .length;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">출석 관리</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 캘린더 */}
        <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {format(currentMonth, 'yyyy년 MM월', { locale: ko })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={previousMonth}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 text-center border-b mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div key={day} className="py-2 font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {/* 시작 요일에 맞게 빈 셀 추가 */}
            {Array.from({ length: getDay(monthStart) }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="h-24 p-2 border rounded-md"
              ></div>
            ))}

            {/* 달력 날짜 */}
            {monthDays.map((day) => {
              const formattedDate = format(day, 'yyyy-MM-dd');
              const isToday =
                format(new Date(), 'yyyy-MM-dd') === formattedDate;
              const isSelected =
                format(selectedDate, 'yyyy-MM-dd') === formattedDate;
              const attendanceCount = getAttendanceCount(day);

              return (
                <div
                  key={formattedDate}
                  onClick={() => setSelectedDate(day)}
                  className={`h-24 p-2 border rounded-md overflow-hidden hover:bg-gray-50 cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-primary-500 border-primary-300'
                      : ''
                  } ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div
                      className={`font-semibold ${getDay(day) === 0 ? 'text-red-500' : ''}`}
                    >
                      {format(day, 'd')}
                    </div>
                    {attendanceCount > 0 && (
                      <div className="bg-primary-100 text-primary-800 text-xs rounded-full px-2 py-0.5">
                        {attendanceCount}명
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 출석 체크 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">
              출석 체크 -{' '}
              {format(selectedDate, 'yyyy년 MM월 dd일 (eee)', { locale: ko })}
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="회원 검색..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredMembers.length === 0 ? (
              <div className="text-center text-gray-500 p-4">
                회원을 찾을 수 없습니다
              </div>
            ) : (
              filteredMembers.map((member) => {
                const isChecked = hasAttendance(selectedDate, member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() =>
                      handleAttendanceCheck(member.id, member.name)
                    }
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-gray-50 ${
                      isChecked
                        ? 'bg-green-50 border border-green-200'
                        : 'border'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        {member.name.charAt(0)}
                      </div>
                      <span>{member.name}</span>
                    </div>
                    <div>
                      {isChecked ? (
                        <CheckCircle size={22} className="text-green-500" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 출석 기록 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          {format(selectedDate, 'yyyy년 MM월 dd일', { locale: ko })} 출석 기록
        </h2>
        {attendanceRecords.filter(
          (record) => record.visitDate === format(selectedDate, 'yyyy-MM-dd'),
        ).length === 0 ? (
          <div className="text-center text-gray-500 p-4">
            출석 기록이 없습니다
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {attendanceRecords
              .filter(
                (record) =>
                  record.visitDate === format(selectedDate, 'yyyy-MM-dd'),
              )
              .map((record) => (
                <div
                  key={record.id}
                  className="flex items-center p-3 bg-gray-50 rounded-md"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    {record.memberName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{record.memberName}</div>
                    <div className="text-xs text-gray-500">
                      <CalendarIcon size={12} className="inline mr-1" />
                      {format(new Date(record.visitDate), 'HH:mm', {
                        locale: ko,
                      })}{' '}
                      출석
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
