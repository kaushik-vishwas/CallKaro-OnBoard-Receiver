export const LANGUAGE_OPTIONS = [
  'Hindi',
  'English',
  'Marathi',
  'Tamil',
  'Punjabi',
  'Telugu',
  'Gujarati',
  'Bengali',
  'Kannada',
] as const;

export const BIO_MAX_LENGTH = 200;

export const KYC_DOC_TYPES = [
  {id: 'aadhaar', title: 'Aadhar Card', subtitle: 'Front and back side'},
  {id: 'pan', title: 'Pan Card', subtitle: 'Front side'},
  {id: 'passbook', title: 'Bank Passbook', subtitle: 'First page'},
] as const;

export type KycDocId = (typeof KYC_DOC_TYPES)[number]['id'];
