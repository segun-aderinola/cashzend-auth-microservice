import { Schema, model } from "mongoose";
import { TransactionModelType } from "../types/models";

const transactionModelSchema = new Schema<TransactionModelType>(
  {
    org_record: {
      type: Boolean,
    },
    amount: { type: String, required: true },
    customer_category: String,
    e_receipt: String,
    meta: {
      audit_number: String,
      confirmation_code: String,
      operator: String,
      operator_receipt: String,
      operator_reference: String,
    },
    payer: {
      name: String,
      payment_reference: String,
    },
    status: String,
    id: String,
    reference: String,
    shared: Boolean,
    currency: String,
    environment: String,
    payment_method: String,
    payment_type: String,
    source: String,
    meta_data: {
      user_id: Schema.Types.ObjectId,
      transaction_type: String,
      receiver_user_id: Schema.Types.ObjectId,
      narration: String,
      nip_ref: String,
      receiver_account_name: String,
      receiver_account_number: String,
      receiver_bank_code: String,
      sender_account_name: String,
      sender_account_number: String,
      sender_bank_code: String,
    },
    organization_id: String,
    customer_id: String,
    fee: Number,
    customer_detail: {
      full_name: String,
      phone_number: String,
      email: String,
      country: String,
    },
    reversal: Boolean,
    narration: String,
    previous_account_balance: Number,
    current_account_balance: Number,
    account_id: String,
    drcr: String,

    transaction_id: String,
    recipient_account_number: String,
    recipient_account_name: String,
    source_account_data: {
      account_name: String,
      account_id: String,
      account_number: String,
      account_balance: Number,
    },
    recipient_account_data: {
      account_name: String,
      account_id: String,
      account_number: String,
    },
  },
  { timestamps: true }
);

const Transaction = model<TransactionModelType>(
  "Transaction",
  transactionModelSchema
);
export default Transaction;
