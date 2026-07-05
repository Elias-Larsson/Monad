export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: {
    id: string;
    email: string;
  };
};

export type RegisterResponse = {
  id: string;
  email: string;
};
