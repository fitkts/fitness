import React from 'react';
import { render, screen } from '@testing-library/react';
import MemberViewDetails from '../../../components/member/MemberViewDetails';
import { Member } from '../../../models/types';

// Mock formatDate 함수
const mockFormatDate = jest.fn((dateString: string | undefined) => {
  if (!dateString) return '-';
  // 간단한 포맷팅 흉내 또는 실제 포맷팅 로직의 단순화된 버전
  // 예: YYYY.MM.DD
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
});

const defaultFormData: Partial<Member> = {
  name: '김테스트',
  gender: '여성',
  birthDate: '1995-05-15',
  phone: '010-5555-6666',
  email: 'view@example.com',
  joinDate: '2023-10-01',
  staffName: '이코치',
  membershipType: '6개월권',
  membershipStart: '2023-11-01',
  membershipEnd: '2024-05-01',
  notes: '뷰 모드 테스트 메모',
};

describe('<MemberViewDetails />', () => {
  beforeEach(() => {
    mockFormatDate.mockClear();
  });

  test('기본 회원 정보가 올바르게 표시된다', () => {
    render(
      <MemberViewDetails
        formData={defaultFormData}
        membershipStatus="active"
        daysLeft={90}
        formatDate={mockFormatDate}
      />,
    );

    expect(screen.getByText('김테스트')).toBeInTheDocument();
    expect(screen.getByText('여성')).toBeInTheDocument();
    expect(
      screen.getByText(mockFormatDate(defaultFormData.birthDate)),
    ).toBeInTheDocument();
    expect(screen.getByText('010-5555-6666')).toBeInTheDocument();
    expect(screen.getByText('view@example.com')).toBeInTheDocument();
    expect(
      screen.getByText(mockFormatDate(defaultFormData.joinDate)),
    ).toBeInTheDocument();
    expect(screen.getByText('이코치')).toBeInTheDocument();
  });

  test('활성 상태의 회원권 정보가 올바르게 표시된다', () => {
    render(
      <MemberViewDetails
        formData={defaultFormData}
        membershipStatus="active"
        daysLeft={30}
        formatDate={mockFormatDate}
      />,
    );
    expect(screen.getByText('현재 이용권')).toBeInTheDocument();
    expect(screen.getByText('사용중')).toBeInTheDocument();
    expect(
      screen.getByText(defaultFormData.membershipType!),
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockFormatDate(defaultFormData.membershipStart)),
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockFormatDate(defaultFormData.membershipEnd)),
    ).toBeInTheDocument();
    expect(screen.getByText(/30일 남음/)).toBeInTheDocument(); // 남은 일수 표시 확인
    // Progress bar width check is harder and often considered an implementation detail for unit tests.
  });

  test('만료된 상태의 회원권 정보가 올바르게 표시된다', () => {
    const expiredFormData = { ...defaultFormData, membershipEnd: '2023-12-31' };
    render(
      <MemberViewDetails
        formData={expiredFormData}
        membershipStatus="expired"
        daysLeft={0}
        formatDate={mockFormatDate}
      />,
    );
    expect(screen.getByText('현재 이용권')).toBeInTheDocument();
    expect(screen.getByText('만료')).toBeInTheDocument();
    expect(
      screen.getByText(mockFormatDate(expiredFormData.membershipEnd)),
    ).toBeInTheDocument();
    expect(screen.queryByText(/일 남음/)).not.toBeInTheDocument(); // 만료 시 남은 일수 표시 없음 확인
  });

  test(`날짜 정보가 없을 때 formatDate가 '-'를 반환하고 표시되는지 확인`, () => {
    const dataWithMissingDates = {
      ...defaultFormData,
      birthDate: undefined,
      joinDate: undefined,
      membershipStart: undefined,
      membershipEnd: undefined,
    };
    const extremelySimpleFormatDate = jest.fn(
      (dateString: string | undefined): string => {
        if (dateString) {
          return 'VALID_DATE_MOCK';
        }
        return '-';
      },
    );

    render(
      <MemberViewDetails
        formData={dataWithMissingDates}
        membershipStatus="expired"
        daysLeft={0}
        formatDate={extremelySimpleFormatDate}
      />,
    );

    expect(extremelySimpleFormatDate).toHaveBeenCalledWith(
      dataWithMissingDates.birthDate,
    );
    expect(extremelySimpleFormatDate).toHaveBeenCalledWith(
      dataWithMissingDates.joinDate,
    );
    expect(extremelySimpleFormatDate).toHaveBeenCalledWith(
      dataWithMissingDates.membershipStart,
    );
    expect(extremelySimpleFormatDate).toHaveBeenCalledWith(
      dataWithMissingDates.membershipEnd,
    );

    const placeholders = screen.getAllByText('-');
    expect(placeholders.length).toBe(4);
  });

  test('이름 첫 글자로 아바타가 표시된다', () => {
    render(
      <MemberViewDetails
        formData={defaultFormData}
        membershipStatus="active"
        daysLeft={90}
        formatDate={mockFormatDate}
      />,
    );
    expect(
      screen.getByText(defaultFormData.name!.charAt(0)),
    ).toBeInTheDocument();
  });

  test('이름이 없을 때 아바타가 물음표로 표시된다', () => {
    render(
      <MemberViewDetails
        formData={{ ...defaultFormData, name: undefined }}
        membershipStatus="active"
        daysLeft={90}
        formatDate={mockFormatDate}
      />,
    );
    expect(screen.getByText('?')).toBeInTheDocument();
  });
});
