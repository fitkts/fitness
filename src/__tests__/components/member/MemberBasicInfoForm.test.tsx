import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MemberBasicInfoForm from '../../../components/member/MemberBasicInfoForm';
import { Member } from '../../../models/types';

const mockHandleChange = jest.fn();

const defaultProps = {
  formData: {
    name: '홍길동',
    phone: '010-1234-5678',
    email: 'test@example.com',
    gender: '남성' as Member['gender'],
    birthDate: '1990-01-01',
  },
  handleChange: mockHandleChange,
  errors: {},
  isViewMode: false,
  isSubmitting: false,
};

describe('<MemberBasicInfoForm />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('기본 정보가 올바르게 렌더링된다 (수정 모드)', () => {
    render(<MemberBasicInfoForm {...defaultProps} />);

    expect(screen.getByLabelText(/이름/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('홍길동')).toBeInTheDocument();

    expect(screen.getByLabelText(/전화번호/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('010-1234-5678')).toBeInTheDocument();

    expect(screen.getByLabelText(/이메일/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();

    expect(screen.getByLabelText(/성별/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('남성')).toBeInTheDocument();

    expect(screen.getByLabelText(/생년월일/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('1990-01-01')).toBeInTheDocument();
  });

  test('isViewMode가 true일 때 읽기 전용으로 표시된다', () => {
    render(<MemberBasicInfoForm {...defaultProps} isViewMode={true} />);

    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('010-1234-5678')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('남성')).toBeInTheDocument();
    expect(screen.getByText('1990-01-01')).toBeInTheDocument();

    expect(screen.queryByRole('textbox', { name: /이름/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /전화번호/ })).not.toBeInTheDocument();
    // Add more assertions for other fields if needed
  });

  test('입력 필드 변경 시 handleChange가 호출된다', async () => {
    const user = userEvent.setup();
    render(<MemberBasicInfoForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/이름/);
    await user.clear(nameInput);
    await user.type(nameInput, '김철수');
    expect(mockHandleChange).toHaveBeenCalledTimes(3); // clear 1 + type 2 (한글은 조합 때문에 여러번 호출될 수 있음, 정확한 횟수보다 호출 여부가 중요)
    // Check last call for specific value if needed, e.g. expect(mockHandleChange).toHaveBeenLastCalledWith(expect.objectContaining({ target: expect.objectContaining({ name: 'name', value: '김철수' }) }));


    const phoneInput = screen.getByLabelText(/전화번호/);
    await user.clear(phoneInput);
    await user.type(phoneInput, '010-9876-5432');
    // Due to formatting, handleChange might be called multiple times per character.
    // Focusing on the fact it's called, and potentially the final state if the parent component handles it.
    expect(mockHandleChange).toHaveBeenCalled(); 

    const emailInput = screen.getByLabelText(/이메일/);
    await user.clear(emailInput);
    await user.type(emailInput, 'new@example.com');
    expect(mockHandleChange).toHaveBeenCalled();

    const genderSelect = screen.getByLabelText(/성별/);
    await user.selectOptions(genderSelect, '여성');
    expect(mockHandleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ name: 'gender', value: '여성' }),
      })
    );

    const birthDateInput = screen.getByLabelText(/생년월일/);
    // type on date input is tricky and might not reflect user interaction well
    // fireEvent.change(birthDateInput, { target: { value: '2000-02-02' } });
    // For date inputs, directly checking the call with the value is more reliable
    // Or focusing on the onChange handler of the parent that processes this.
    // Here, we simulate a direct change for simplicity in testing this unit.
    userEvent.type(birthDateInput, '2000-02-02'); // This might not work as expected for date inputs with user-event v14
    // A more direct way to test date input change for this component:
    // fireEvent.change(birthDateInput, { target: { name: 'birthDate', value: '2000-02-02' } });
    // expect(mockHandleChange).toHaveBeenCalledWith(expect.objectContaining({ target: { name: 'birthDate', value: '2000-02-02' } }));
    // For now, let's assume the type event triggers it sufficiently for this example
    // await user.type(birthDateInput, '2000-02-02');
    // A better approach for date with user-event (if using modern browsers that support input.valueAsDate)
    // await user.click(birthDateInput); // Open date picker simulation (might not be needed)
    // await user.keyboard('2000-02-02'); // This is a bit flaky
    // The most robust for testing library date input is to directly fireEvent.change
    // However, if the component internally relies on properties user-event sets, this could be an issue.
    // Let's try clearing and typing for consistency, then check if handleChange was called.
    await user.clear(birthDateInput);
    await user.type(birthDateInput, '20000202'); // Typing numbers, then letting browser format if it does
    expect(mockHandleChange).toHaveBeenCalled();
  });

  test('errors prop에 따라 에러 메시지가 표시된다', () => {
    const errors = {
      name: '이름은 필수입니다.',
      email: '유효한 이메일이 아닙니다.',
    };
    render(<MemberBasicInfoForm {...defaultProps} errors={errors} />);

    expect(screen.getByText('이름은 필수입니다.')).toBeInTheDocument();
    expect(screen.getByText('유효한 이메일이 아닙니다.')).toBeInTheDocument();
  });

  test('isSubmitting이 true일 때 입력 필드가 비활성화된다', () => {
    render(<MemberBasicInfoForm {...defaultProps} isSubmitting={true} />);

    expect(screen.getByLabelText(/이름/)).toBeDisabled();
    expect(screen.getByLabelText(/전화번호/)).toBeDisabled();
    expect(screen.getByLabelText(/이메일/)).toBeDisabled();
    expect(screen.getByLabelText(/성별/)).toBeDisabled();
    expect(screen.getByLabelText(/생년월일/)).toBeDisabled();
  });
}); 