import { Model, Schema } from "mongoose";

export interface FileType {
  fileId: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  fileType?: string;
}
export interface UserModelType {
  firstName?: string;
  lastName?: string;
  userName?: string;
  dateOfBirth?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  placeOfBirth?: string;
  address?: {
    fullAddress: string;
    street?: string;
    city?: string;
    state?: string;
    lga?: string;
    country?: string;
  };
  password?: string;
  transactionPin?: string;
  hasSetTransactionPin?: boolean;
  loginPin?: string;
  hasSetLoginPin?: boolean;
  accountType?: string;
  verificationLevel?: number;
  hasVerifiedEmail?: boolean;
  customerID?: string;
  account?: {
    id?: string;
    bankName?: string;
    accountNumber?: string;
  };
  nextOfKin?: {
    name?: string;
    address?: string;
    phoneNumber?: string;
    relationship?: string;
  };
  director?: {
    name?: string;
    address?: string;
    phoneNumber?: string;
    role?: string;
  };
  hasOnboarded?: boolean;
  businessName?: string;
  businessType?: string;
  cacNo?: string;
  hasCompletedRegistration?: boolean;
  plan?: string;
  NIN?: string;
  bvn?: string;
  userRole?: string;
  profilePicture?: FileType;
  meansOfID?: string;
  cacDoc?: FileType;
  votersCard?: FileType;
  PVC?: FileType;
  internationalPassport?: FileType;
  driversLicense?: FileType;
  NINSlip?: FileType;
  nationalIDCard?: FileType;
}

export interface UserModel extends Model<UserModelType> {
  loginWithEmail(userData: {
    email: string;
    password: string;
  }): Promise<UserModelType>;
  loginWithPhone(userData: {
    phoneNumber: string;
    password: string;
  }): Promise<UserModelType>;
}

export interface DeletedUserModelType {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface PassResetModelType {
  user: Schema.Types.ObjectId;
  token: string;
}

export interface OTPVerificationModelType {
  user: Schema.Types.ObjectId;
  OTP: string;
  verificationType: string;
}

export interface TransactionModelType {
  org_record?: boolean;
  amount: string;
  customer_category?: string;
  e_receipt?: string;
  meta?: {
    audit_number?: string;
    confirmation_code?: string;
    operator?: string;
    operator_receipt?: string;
    operator_reference?: string;
  };
  payer?: {
    name?: string;
    payment_reference?: string;
  };
  status: string;

  id: string;
  reference: string;
  shared?: boolean;
  currency: string;
  environment: string;
  payment_method?: string;
  payment_type: string;
  source?: string;
  meta_data: {
    user_id: Schema.Types.ObjectId;
    transaction_type: string;
    receiver_user_id?: Schema.Types.ObjectId;
    narration?: string;
    nip_ref?: string;
    receiver_account_name?: string;
    receiver_account_number?: string;
    receiver_bank_code?: string;
    sender_account_name?: string;
    sender_account_number?: string;
    sender_bank_code?: string;
  };
  organization_id: string;
  customer_id: string;
  fee?: number;
  customer_detail?: {
    full_name?: string;
    phone_number?: string;
    email?: string;
    country?: string;
  };
  reversal?: boolean;
  narration?: string;
  previous_account_balance?: number;
  current_account_balance?: number;
  account_id: string;
  drcr?: string;
  transaction_id?: string;
  recipient_account_number?: string;
  recipient_account_name?: string;
  source_account_data?: {
    account_name?: string;
    account_id?: string;
    account_number?: string;
    account_balance?: number;
  };
  recipient_account_data?: {
    account_name?: string;
    account_id?: string;
    account_number?: string;
  };
}
