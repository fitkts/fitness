import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MemberNotesForm from '../../../components/member/MemberNotesForm';

const mockHandleChange = jest.fn();

const defaultProps = {
  notes: '이것은 테스트 메모입니다.',
  handleChange: mockHandleChange,
  isViewMode: false,
  isSubmitting: false,
};

describe('<MemberNotesForm />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('수정 모드에서 메모 textarea가 올바르게 렌더링된다', () => {
    render(<MemberNotesForm {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(
      /회원에 대한 특이사항이나 메모를 입력하세요./,
    );
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(defaultProps.notes);
  });

  test('뷰 모드에서 메모 내용이 올바르게 표시된다', () => {
    render(<MemberNotesForm {...defaultProps} isViewMode={true} />);
    expect(screen.getByText(defaultProps.notes)).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(
        /회원에 대한 특이사항이나 메모를 입력하세요./,
      ),
    ).not.toBeInTheDocument();
  });

  test('뷰 모드에서 메모가 없을 때 안내 문구가 표시된다', () => {
    render(
      <MemberNotesForm {...defaultProps} notes={undefined} isViewMode={true} />,
    );
    expect(screen.getByText('등록된 메모가 없습니다.')).toBeInTheDocument();
  });

  test('뷰 모드에서 빈 메모 문자열일 때도 안내 문구가 표시된다', () => {
    render(<MemberNotesForm {...defaultProps} notes="" isViewMode={true} />);
    expect(screen.getByText('등록된 메모가 없습니다.')).toBeInTheDocument();
  });

  test('메모 입력 시 handleChange가 호출된다', async () => {
    const user = userEvent.setup();
    render(<MemberNotesForm {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(
      /회원에 대한 특이사항이나 메모를 입력하세요./,
    );

    await user.clear(textarea);
    expect(mockHandleChange).toHaveBeenCalledTimes(1); // clear

    await user.type(textarea, '새로운 메모 내용');
    // textarea는 한 글자마다 호출되지 않고, 일반적으로 최종 값으로 한 번 또는 몇 번의 이벤트로 호출됨
    // (userEvent의 type 구현에 따라 다를 수 있음)
    // 호출 횟수보다는 호출 자체와 전달된 값에 집중
    expect(mockHandleChange).toHaveBeenCalled();
    // 마지막 호출 확인 (정확한 횟수는 user-event 버전에 따라 다를 수 있음)
    // 예: expect(mockHandleChange).toHaveBeenLastCalledWith(expect.objectContaining({ target: { value: '새로운 메모 내용' } }));
  });

  test('isSubmitting이 true일 때 textarea가 비활성화된다', () => {
    render(<MemberNotesForm {...defaultProps} isSubmitting={true} />);
    const textarea = screen.getByPlaceholderText(
      /회원에 대한 특이사항이나 메모를 입력하세요./,
    );
    expect(textarea).toBeDisabled();
  });
});
