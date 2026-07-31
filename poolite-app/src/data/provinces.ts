// Sigle provinciali italiane, per la validazione dell'indirizzo di spedizione.
export const PROVINCE_CODES = [
  'AG','AL','AN','AO','AP','AQ','AR','AT','AV','BA','BG','BI','BL','BN','BO','BR','BS','BT','BZ',
  'CA','CB','CE','CH','CL','CN','CO','CR','CS','CT','CZ','EN','FC','FE','FG','FI','FM','FR','GE',
  'GO','GR','IM','IS','KR','LC','LE','LI','LO','LT','LU','MB','MC','ME','MI','MN','MO','MS','MT',
  'NA','NO','NU','OR','PA','PC','PD','PE','PG','PI','PN','PO','PR','PT','PU','PV','PZ','RA','RC',
  'RE','RG','RI','RM','RN','RO','SA','SI','SO','SP','SR','SS','SU','SV','TA','TE','TN','TO','TP',
  'TR','TS','TV','UD','VA','VB','VC','VE','VI','VR','VT','VV',
] as const;

export type ProvinceCode = (typeof PROVINCE_CODES)[number];

export function isValidProvince(code: string): boolean {
  return (PROVINCE_CODES as readonly string[]).includes(code.toUpperCase());
}

/** CAP italiano: esattamente 5 cifre. */
export function isValidCap(cap: string): boolean {
  return /^\d{5}$/.test(cap.trim());
}

/** Numero italiano: accetta prefisso +39, spazi e trattini. */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^\d]/g, '');
  return digits.length >= 9 && digits.length <= 13;
}

/** Isole minori e zone remote: consegna express non garantita. */
const REMOTE_PROVINCES = ['SU', 'OT', 'OG', 'CI', 'VS'];
export function isRemoteArea(province: string): boolean {
  return REMOTE_PROVINCES.includes(province.toUpperCase());
}
