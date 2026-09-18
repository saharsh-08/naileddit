import { RegisterUserInput, UserResponse } from "../types";

export const validateRegisterRequest = (options: RegisterUserInput): UserResponse | null  => {
  const { username, email, password } = options;
  if (!email.includes('@')) {
    return {
      errors: [
        {
          field: "email",
          message: "@ must be included",
        },
      ],
    };
  }

  if (username.length <= 2) {
    return {
      errors: [
        {
          field: "username",
          message: "Length must be greater than 2",
        },
      ],
    };
  }

  if (username.includes('@')) {
    return {
      errors: [
        {
          field: "username",
          message: "Username cannot include @ character",
        },
      ],
    };
  }

  if (password.length <= 2) {
    return {
      errors: [
        {
          field: "password",
          message: "Length must be greater than 2",
        },
      ],
    };
  }

  return null;
};
