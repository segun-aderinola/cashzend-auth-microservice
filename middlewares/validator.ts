import { ValidationChain, body, query } from "express-validator";

export const validateUserSignUp1 = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password")
    .exists()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password should be at least 8 characters"),
];


export const validateUserSignUp = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("phoneNumber")
    .exists()
    .withMessage("Phone number is required")
    .isLength({ min: 10, max: 11 })
    .withMessage("Phone number should be 11 digits"),
  body("firstName")
    .exists()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name should be at least 2 characters"),
  body("lastName")
    .exists()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name should be at least 2 characters"),
  body("bvn")
    .exists()
    .withMessage("BVN is required")
    .isLength({ min: 11, max: 11 })
    .withMessage("BVN should be 11 digits"),
  body("password")
    .exists()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password should be at least 8 characters"),
];

export const validateUserLogin = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password").exists().withMessage("Password is required"),
];

export const validateGoogleLogin = [
  body("aud").exists().withMessage("Aud not sent"),
  body("email")
    .exists()
    .withMessage("Email not sent")
    .isEmail()
    .withMessage("Invalid email sent"),
  body("name").exists().withMessage("Name not sent"),
  body("picture").exists().withMessage("Picture not sent"),
  body("given_name").exists().withMessage("Given name not sent"),
  body("family_name").exists().withMessage("Family not sent"),
];

export const validateFacebookLogin = [
  body("email")
    .exists()
    .withMessage("Email not sent")
    .isEmail()
    .withMessage("Invalid email sent"),
  body("name").exists().withMessage("Name not sent"),
];

export const validateKyc = [
  body("nin").exists().withMessage("NIN not sent"),
  body("bvn").exists().withMessage("BVN not sent"),
];

export const validateTier1Auth = [
  body("address.street").exists().withMessage("Street address is required"),
  body("address.city").exists().withMessage("City is required"),
  body("address.lga").exists().withMessage("Local Govt. Area is required"),
  body("address.state").exists().withMessage("State is required"),
  body("address.country").exists().withMessage("Country is required"),
  body("address.postalCode").exists().withMessage("Postal code is required"),
  body("image.url")
    .exists()
    .withMessage("Image URL is required")
    .custom((value) => {
      if (
        typeof value === "string" &&
        (value.startsWith("http://") || value.startsWith("https://"))
      ) {
        // If the value is a URL, return true to pass validation
        return true;
      } else {
        // Otherwise, return false to fail validation
        return false;
      }
    })
    .withMessage("Image must be a URL"),
  body("country").exists().withMessage("Country is required"),
  body("gender").exists().withMessage("Gender is required"),
  body("dateOfBirth")
    .exists()
    .withMessage("Date of birth is required")
    .isISO8601()
    .withMessage("Invalid date format"),
  body("placeOfBirth").exists().withMessage("Place of birth is required"),
];

export const validateTier2Auth = [
  body("image.url")
    .exists()
    .withMessage("Image URL is required")
    .custom((value) => {
      if (
        typeof value === "string" &&
        (value.startsWith("http://") || value.startsWith("https://"))
      ) {
        // If the value is a URL, return true to pass validation
        return true;
      } else {
        // Otherwise, return false to fail validation
        return false;
      }
    })
    .withMessage("Image must be a URL"),
  body("meansOfID")
    .exists()
    .withMessage("Means of ID is required")
    .custom((value) => {
      const allowedValues = [
        "Drivers License",
        "Voters Card",
        "International Passport",
        "National ID Card",
        "NIN Slip",
      ];
      if (allowedValues.includes(value)) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage(
      "Invalid value for Means of ID. Allowed values: driver license, voters card, international passport, national id card, nin slip"
    ),
];
export const validateTier3Auth = [
  body("image.url")
    .exists()
    .withMessage("Image URL is required")
    .custom((value) => {
      if (
        typeof value === "string" &&
        (value.startsWith("http://") || value.startsWith("https://"))
      ) {
        // If the value is a URL, return true to pass validation
        return true;
      } else {
        // Otherwise, return false to fail validation
        return false;
      }
    })
    .withMessage("Image must be a URL"),
];

export const validateCentralAmountFunding = [
  body("amount")
    .isInt()
    .withMessage("Amount must be an integer")
    .isInt({ max: 1000000 })
    .withMessage("Amount must not be greater than 1000000"),
  body("bankCode")
    .isLength({ min: 6, max: 6 })
    .withMessage("Bank code must be 3 characters long"),
  body("accountNumber")
    .isLength({ min: 10, max: 10 })
    .withMessage("Account number must be 10 digits long"),
  body("narration").isString().withMessage("Narration must be a string"),
];

export const validateGetAccountDetails = [
  query("accountNumber")
    .notEmpty()
    .withMessage("Account number is required")
    .isLength({ min: 10, max: 10 })
    .withMessage("Account number must be 10 digits long"),
  query("bankCode")
    .notEmpty()
    .withMessage("Bank code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Bank code must be 6 digits long"),
];

export const transactionValidator: ValidationChain[] = [
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isString()
    .withMessage("Status must be a string"),
  body("meta_data.user_id")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("User ID must be a valid Mongo ID"),
  body("meta_data.transaction_type")
    .notEmpty()
    .withMessage("Transaction type is required")
    .isString()
    .withMessage("Transaction type must be a string"),
  body("customer_category")
    .optional()
    .isString()
    .withMessage("Customer category must be a string"),
  body("e_receipt")
    .optional()
    .isString()
    .withMessage("E-receipt must be a string"),
  body("meta.audit_number")
    .optional()
    .custom((value) => {
      if (value !== null && isNaN(value) && typeof value !== "string") {
        throw new Error("Customer category must be a string or a number");
      }
      return true;
    }),
  body("meta.confirmation_code")
    .optional()
    .custom((value) => {
      if (value !== null && isNaN(value) && typeof value !== "string") {
        throw new Error("Customer category must be a string or a number");
      }
      return true;
    }),
  body("meta.operator")
    .optional()
    .isString()
    .withMessage("Operator must be a string"),
  body("meta.operator_receipt")
    .optional()
    .isString()
    .withMessage("Operator receipt must be a string"),
  body("meta.operator_reference")
    .optional()
    .isString()
    .withMessage("Operator reference must be a string"),
  body("payer.name")
    .optional()
    .isString()
    .withMessage("Payer name must be a string"),
  body("payer.payment_reference")
    .optional()
    .isString()
    .withMessage("Payer payment reference must be a string"),
  body("id").optional().isString().withMessage("ID must be a string"),
  body("reference")
    .optional()
    .isString()
    .withMessage("Reference must be a string"),
  body("shared").optional().isBoolean().withMessage("Shared must be a boolean"),
  body("currency")
    .optional()
    .isString()
    .withMessage("Currency must be a string"),
  body("environment")
    .optional()
    .isString()
    .withMessage("Environment must be a string"),
  body("payment_method")
    .optional()
    .isString()
    .withMessage("Payment method must be a string"),
  body("payment_type")
    .optional()
    .isString()
    .withMessage("Payment type must be a string"),
  body("source").optional().isString().withMessage("Source must be a string"),
  body("organization_id")
    .optional()
    .isString()
    .withMessage("Organization ID must be a string"),
  body("customer_id")
    .optional()
    .isString()
    .withMessage("Customer ID must be a string"),
  body("fee").optional().isNumeric().withMessage("Fee must be a number"),
  body("customer_detail.full_name")
    .optional()
    .isString()
    .withMessage("Customer full name must be a string"),
  body("customer_detail.phone_number")
    .optional()
    .isString()
    .withMessage("Customer phone number must be a string"),
  body("customer_detail.email")
    .optional()
    .isString()
    .withMessage("Customer email must be a string"),
  body("customer_detail.country")
    .optional()
    .isString()
    .withMessage("Customer country must be a string"),
  body("reversal")
    .optional()
    .isBoolean()
    .withMessage("Reversal must be a boolean"),
  body("narration")
    .optional()
    .isString()
    .withMessage("Narration must be a string"),
  body("previous_account_balance")
    .optional()
    .isNumeric()
    .withMessage("Previous account balance must be a number"),
  body("current_account_balance")
    .optional()
    .isNumeric()
    .withMessage("Current account balance must be a number."),
  body("account_id")
    .optional()
    .isString()
    .withMessage("Account ID must be a non-empty string."),
  body("drcr").optional().isString().withMessage("Dr/Cr must be a string."),
  body("transaction_id")
    .optional()
    .isString()
    .withMessage("Transaction ID must be a string."),
  body("recipient_account_number")
    .optional()
    .isString()
    .withMessage("Recipient account number must be a string."),
  body("recipient_account_name")
    .optional()
    .isString()
    .withMessage("Recipient account name must be a string."),
  body("source_account_data.account_name")
    .optional()
    .isString()
    .withMessage("Source account name must be a string."),
  body("source_account_data.account_id")
    .optional()
    .isString()
    .withMessage("Source account ID must be a string."),
  body("source_account_data.account_number")
    .optional()
    .isString()
    .withMessage("Source account number must be a string."),
  body("source_account_data.account_balance")
    .optional()
    .isNumeric()
    .withMessage("Source account balance must be a number."),
  body("recipient_account_data.account_name")
    .optional()
    .isString()
    .withMessage("Recipient account name must be a string."),
  body("recipient_account_data.account_id")
    .optional()
    .isString()
    .withMessage("Recipient account ID must be a string."),
  body("recipient_account_data.account_number")
    .optional()
    .isString()
    .withMessage("Recipient account number"),
];
