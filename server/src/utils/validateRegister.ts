import { UserInput } from './UserInput';

export const validateRegister = (options: UserInput) => {
  if (options.username.length <= 5) {
    return [
      {
        field: 'username',
        message: 'length must be greater than 5',
      },
    ];
  }
  if (options.username.includes('@')) {
    return [
      {
        field: 'username',
        message: "username can't contain @ character",
      },
    ];
  }
  if (!options.email.includes('@')) {
    return [
      {
        field: 'email',
        message: 'invalid email',
      },
    ];
  }
  if (options.password.length <= 5) {
    return [
      {
        field: 'password',
        message: 'length must be greater than 5',
      },
    ];
  }

  return null;
};
