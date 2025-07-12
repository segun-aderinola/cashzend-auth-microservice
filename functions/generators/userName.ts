export interface UsernameGeneratorConfig {
  words: string[];
  separator: string;
  useNumbers: boolean;
  numberRange: [number, number];
}

// Default configuration values
const DEFAULT_CONFIG: UsernameGeneratorConfig = {
  words: [
    "User",
    "Finance",
    "Escrow",
    "Investor",
    "Pay",
    "Alpha",
    "Corevestor",
    "BanksMore",
    "Prime Fin",
    "Big Bucks",
    "Wallet Ninja",
    "Zella",
  ],
  separator: "_",
  useNumbers: false,
  numberRange: [100, 999],
};

// Function to generate a random username based on the given configuration
export function generateRandomUsername(
  config: Partial<UsernameGeneratorConfig> = {}
): string {
  // Merge the configuration with the default configuration
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Shuffle the words array
  const shuffledWords = mergedConfig.words.sort(() => 0.5 - Math.random());

  // Pick a random number of words between 1 and 3 to include in the username
  const numWords = Math.floor(Math.random() * 3) + 1;

  // Join the first numWords words in the shuffled array with the separator
  let username = shuffledWords.slice(0, numWords).join(mergedConfig.separator);

  // Optionally append a random number to the username
  if (mergedConfig.useNumbers) {
    const [minNum, maxNum] = mergedConfig.numberRange;
    const randomNum =
      Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    username += mergedConfig.separator + randomNum;
  }

  return username;
}

export function generateFromEmail(email: string, numDigits = 3): string {
  // Extract the part of the email address before the @ symbol
  const username = email.split("@")[0];

  // Generate a random number with the specified number of digits
  const maxNum = 10 ** numDigits;
  const randomNum = Math.floor(Math.random() * maxNum);

  // Append the random number to the username and return
  return username + randomNum;
}
