export interface TierBasicRequest {
  image: {
    fileId: string;
    filename: string;
    thumbnailUrl: string;
    url: string;
    fileType: string;
  };
}

export interface Tier1Request extends TierBasicRequest {
  address: {
    fullAddress: string;
    street: string;
    city: string;
    lga: string;
    state: string;
    country: string;
    postalCode: string;
  };
  gender: string;
  dateOfBirth: string;
  placeOfBirth: string;
}
export interface Tier2Request extends TierBasicRequest {
  meansOfID: string;
}

export interface CentralAccountFundingRequest {
  amount: number;
  bankCode: string;
  accountNumber: string;
  narration: string;
}

export interface GetBankAccountRequest {
  accountNumber: string;
  bankCode: string;
}
