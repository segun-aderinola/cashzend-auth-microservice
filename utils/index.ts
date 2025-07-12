import { FileType } from "../types/models";

export const checkFileExtension = (value: string): string => {
  let extension = "";

  switch (value) {
    case "image/png":
      extension = ".png";
      break;
    case "image/jpeg":
      extension = ".jpeg";
      break;
    case "image/jpg":
      extension = ".jpg";
      break;
    case "application/pdf":
      extension = ".pdf";
      break;

    default:
      break;
  }

  return extension;
};

export const isFileType = (
  obj: FileType
): { isFile: boolean; message?: string } => {
  if (typeof obj !== "object") {
    return { isFile: false, message: "The data is not a valid object." };
  }
  const errors: string[] = [];
  if (!("fileId" in obj)) {
    errors.push("fileId property is missing.");
  } else if (typeof obj.fileId !== "string") {
    errors.push("fileId property is not a string.");
  }
  if (!("filename" in obj)) {
    errors.push("File name property is missing.");
  } else if (typeof obj.filename !== "string") {
    errors.push("name property is not a string.");
  }
  if (!("url" in obj)) {
    errors.push("url property is missing.");
  } else if (typeof obj.url !== "string") {
    errors.push("url property is not a string.");
  }
  return errors.length === 0
    ? { isFile: true, message: "Valid file sent" }
    : { isFile: false, message: errors.join(", ") };
};

export function checkFileFormat(url: string): string {
  const fileExtension = url.split(".").pop();
  switch (fileExtension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "pdf":
      return "application/pdf";
    default:
      return "unknown";
  }
}

export function formatPhoneNumber(phoneNumber: string) {
  const regex = /(^0|\+0)(\d{10,14}$)/g;
  const match = regex.exec(phoneNumber);

  if (match) {
    const countryCode = "234";
    const cleanedNumber = match[2].replace(/\D/g, ""); // added this line to remove non-digits
    return countryCode + cleanedNumber;
  } else {
    return phoneNumber;
  }
}

export function formatToNaira(amountInKobo: number): string {
  const amountInNaira = amountInKobo / 100;
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  });

  return formatter.format(amountInNaira);
}
type DefaultChars = {
  a: string;
  A: string;
  0: string;
  "!": string;
  "*": string;
};

type RandomizeOptions = {
  chars?: string;
};

export function randomize(
  pattern: string,
  length?: number,
  options?: RandomizeOptions
): string {
  const defaultChars: DefaultChars = {
    a: "abcdefghijklmnopqrstuvwxyz",
    A: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    0: "0123456789",
    "!": "~!@#$%^&()_+-={}[];',.",
    "*": "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~!@#$%^&()_+-={}[];',.",
  };

  let chars = "";
  let result = "";
  const patternLength = pattern.length;

  if (options && options.chars) {
    chars = options.chars;
  } else {
    for (let i = 0; i < patternLength; i++) {
      chars += defaultChars[pattern[i] as keyof DefaultChars] || pattern[i];
    }
  }

  if (!length) {
    length = patternLength;
  }

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

randomize.isCrypto = false;
