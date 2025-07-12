export interface WalletAccountWithdrawal {
  account_bank: string;
  account_number: string;
  amount: number | string;
  narration: string;
  currency?: string;
  reference?: string;
  callback_url?: string;
  debit_currency?: string;
}

export interface WalletAccountDeposit {
  Authorization: string;
  account_bank: string;
  account_number: string;
  amount: number | string;
  narration: string;
  email?: string;
  tx_ref?: string;
}
