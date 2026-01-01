export class AuthResponseDto {
  success: boolean;
  message: string;
  data?: {
    accessToken?: string;
    user?: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
}

