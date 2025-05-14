export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
};

export const validateName = (name: string): boolean => {
  // 이름은 2글자 이상이어야 하며, 숫자나 특수문자를 포함하지 않아야 함
  const nameRegex = /^[가-힣a-zA-Z\s]{2,}$/;
  return nameRegex.test(name);
};

export const validateMembershipType = (type: string): boolean => {
  const validTypes = ['1개월', '3개월', '6개월', '12개월'];
  return validTypes.includes(type);
}; 