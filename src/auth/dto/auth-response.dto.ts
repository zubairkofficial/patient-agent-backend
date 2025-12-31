export class AuthResponseDto {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      email: string;
      firstName?: string;
      lastName?: string;
    };
    token?: string;
  };
}

