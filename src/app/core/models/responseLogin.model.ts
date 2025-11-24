export interface ResponseLogin {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      email: string;
      created_at: string;
    };
    token: string;
  };
}
