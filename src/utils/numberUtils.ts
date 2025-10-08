// Convert numbers to Farsi numerals
export const toFarsiNumber = (num: number): string => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().split('').map(digit => farsiDigits[parseInt(digit)]).join('');
};