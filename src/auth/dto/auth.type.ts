export interface AuthResponse {
  statusCode: number;
  message: string;
  data: {
    user: {
      email: string;
      firstName: string;
      lastName: string;
      picture: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}
