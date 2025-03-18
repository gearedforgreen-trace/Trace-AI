export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;
export function isValidPassword(password: string) {
  return passwordRegex.test(password);
}
