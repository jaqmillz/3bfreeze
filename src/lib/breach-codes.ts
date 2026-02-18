export interface BreachInfo {
  code: string;
  name: string;
  description: string;
  date: string;
  recordsAffected?: string;
  dataExposed: string[];
}

export const BREACH_CODES: Record<string, BreachInfo> = {
  ACME2024: {
    code: "ACME2024",
    name: "Acme Corp Data Breach",
    description:
      "In September 2024, Acme Corp disclosed that an unauthorized party accessed customer databases containing personal information. The breach affected customers who created accounts between 2019 and 2024.",
    date: "September 2024",
    recordsAffected: "2.4 million",
    dataExposed: [
      "Social Security Numbers",
      "Names",
      "Addresses",
      "Phone Numbers",
    ],
  },
  HEALTH2024: {
    code: "HEALTH2024",
    name: "National Health Network Breach",
    description:
      "In November 2024, National Health Network reported a cybersecurity incident involving unauthorized access to patient and member records. The breach was discovered during a routine security audit.",
    date: "November 2024",
    recordsAffected: "5.1 million",
    dataExposed: [
      "Social Security Numbers",
      "Names",
      "Dates of Birth",
      "Addresses",
      "Insurance Information",
    ],
  },
  BANK2024: {
    code: "BANK2024",
    name: "First Federal Bank Incident",
    description:
      "In January 2025, First Federal Bank notified customers of a data breach that exposed financial and personal records. The breach occurred through a compromised third-party vendor.",
    date: "January 2025",
    recordsAffected: "890,000",
    dataExposed: [
      "Social Security Numbers",
      "Names",
      "Account Numbers",
      "Addresses",
      "Phone Numbers",
    ],
  },
};

export function getBreachByCode(code: string): BreachInfo | null {
  return BREACH_CODES[code.toUpperCase()] ?? null;
}
