// 55-country reference list ported from bayanihan-frontend/src/helpers/constants/countries.js
// Server-safe (no "use client") so both server and client components can import.

export interface CountryCode {
  name: string;
  code: string;
}

export const countryCodes: CountryCode[] = [
  { name: "Philippines", code: "PH" },
  { name: "United States of America", code: "US" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "Canada", code: "CA" },
  { name: "Japan", code: "JP" },
  { name: "Singapore", code: "SG" },
  { name: "Australia", code: "AU" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Qatar", code: "QA" },
  { name: "United Kingdom", code: "GB" },
  { name: "South Korea", code: "KR" },
  { name: "Taiwan", code: "TW" },
  { name: "Germany", code: "DE" },
  { name: "Brazil", code: "BR" },
  { name: "Italy", code: "IT" },
  { name: "Macau", code: "MO" },
  { name: "Oman", code: "OM" },
  { name: "Kuwait", code: "KW" },
  { name: "HongKong", code: "HK" },
  { name: "China", code: "CN" },
  { name: "Switzerland", code: "CH" },
  { name: "Nigeria", code: "NG" },
  { name: "Malaysia", code: "MY" },
  { name: "Spain", code: "ES" },
  { name: "Iceland", code: "IS" },
  { name: "Vietnam", code: "VN" },
  { name: "Denmark", code: "DK" },
  { name: "New Zealand", code: "NZ" },
  { name: "Lebanon", code: "LB" },
  { name: "Thailand", code: "TH" },
  { name: "France", code: "FR" },
  { name: "Bahrain", code: "BH" },
  { name: "Ireland", code: "IE" },
  { name: "Norway", code: "NO" },
  { name: "Indonesia", code: "ID" },
  { name: "India", code: "IN" },
  { name: "Belgium", code: "BE" },
  { name: "Sweden", code: "SE" },
  { name: "Poland", code: "PL" },
  { name: "Netherlands", code: "NL" },
  { name: "Morocco", code: "MA" },
  { name: "Peru", code: "PE" },
  { name: "Czech Republic", code: "CZ" },
  { name: "Romania", code: "RO" },
  { name: "Israel", code: "IL" },
  { name: "Greece", code: "GR" },
  { name: "Portugal", code: "PT" },
  { name: "Chile", code: "CL" },
  { name: "Colombia", code: "CO" },
  { name: "Bangladesh", code: "BD" },
  { name: "Pakistan", code: "PK" },
  { name: "Argentina", code: "AR" },
  { name: "Finland", code: "FI" },
  { name: "Hungary", code: "HU" },
  { name: "Mexico", code: "MX" },
  { name: "Cambodia", code: "KH" },
];

const COUNTRY_ALIAS: Record<string, string> = {
  UK: "GB",
  GB: "GB",
  UAE: "AE",
  USA: "US",
};

const NAME_TO_CODE = new Map(
  countryCodes.map((c) => [c.name.toUpperCase(), c.code])
);

export function normalizeToAlpha2(value: unknown): string {
  const v = String(value ?? "").trim();
  if (!v) return "";
  const upper = v.toUpperCase();
  if (COUNTRY_ALIAS[upper]) return COUNTRY_ALIAS[upper];
  if (/^[A-Z]{2}$/.test(upper)) return upper;
  return NAME_TO_CODE.get(upper) ?? "";
}

const CODE_TO_NAME = new Map(countryCodes.map((c) => [c.code, c.name]));

export function getCountryName(code: string): string {
  return CODE_TO_NAME.get(code) ?? code ?? "Unknown";
}
