export const ACCOUNT_INFO = {
  bank: process.env.NEXT_PUBLIC_PAYMENT_BANK ?? "",
  number: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT ?? "",
  holder: process.env.NEXT_PUBLIC_PAYMENT_HOLDER ?? "",
};
