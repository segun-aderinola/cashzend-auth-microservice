export type SignInErrorType = {
  email?: string | object;
  phoneNumber?: string | object;
  password?: string | object;
};

export interface sendGridEmailType {
  to: string;
  subject: string;
  text: string;
  html: string;
}
