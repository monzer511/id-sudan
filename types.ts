export interface UserData {
  firstName: string;
  secondName: string;
  thirdName: string;
  fourthName: string;
  nationalId: string;
  birthDate: string;
  birthPlace: string;
  bloodType: string;
  jobTitle: string;
  address: string;
}

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  reason: string;
}

export enum AppStep {
  LANDING_PAGE = 0,
  WELCOME = 1,
  DATA_ENTRY = 2,
  DOCUMENT_UPLOAD = 3,
  AI_VERIFICATION = 4,
  ID_GENERATION = 5,
  PRINT_MODE = 6,
  ADMIN_LOGIN = 100,
  ADMIN_DASHBOARD = 101,
}

export interface DocumentFiles {
  passport: File | null;
  selfie: File | null;
}

export interface DocumentPreviews {
  passport: string | null;
  selfie: string | null;
}

export interface VerificationLog {
  id: string;
  timestamp: Date;
  nationalId: string;
  fullName: string;
  status: 'APPROVED' | 'REJECTED';
  confidence: number;
  userData: UserData; // Added to store full details
  photoUrl: string | null; // Added to store the selfie for the card
}