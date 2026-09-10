export const USER_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "small_business", label: "Small business" },
] as const;

export type UserType = (typeof USER_TYPES)[number]["value"];

export function isUserType(value: string): value is UserType {
  return value === "individual" || value === "small_business";
}

export function userTypeLabel(userType: UserType) {
  return userType === "individual" ? "Individual" : "Small business";
}

export function userTypeDescription(userType: UserType) {
  return userType === "individual"
    ? "Salary, freelance, or capital income"
    : "Proprietor, firm, or small company";
}
