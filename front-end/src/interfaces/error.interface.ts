export type IApiError<T = unknown> = {
  error: {
    message: string;
    status: number;
    data?: T;
  };
};
