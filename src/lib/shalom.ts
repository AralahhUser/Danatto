import { shalomAgencies, type ShalomAgency } from "@/lib/shalom-agencies";

const collator = new Intl.Collator("es-PE", { sensitivity: "base" });
const lowAgencyProvinceLimit = 5;

export type ShalomMatchLevel = "district" | "province" | "department" | "none";

export type ShalomAgencyOption = ShalomAgency & {
  matchLevel: ShalomMatchLevel;
  distanceKm?: number | null;
};

export function normalizeLocation(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function uniqueSorted(values: Iterable<string>) {
  return Array.from(new Set(Array.from(values).filter(Boolean))).sort((a, b) => collator.compare(a, b));
}

export const shalomDepartments = uniqueSorted(shalomAgencies.map((agency) => agency.department));

export const shalomProvinces = uniqueSorted(shalomAgencies.map((agency) => agency.province));

export function getShalomProvinces(department: string) {
  const normalizedDepartment = normalizeLocation(department);

  return uniqueSorted(
    shalomAgencies
      .filter((agency) => normalizeLocation(agency.department) === normalizedDepartment)
      .map((agency) => agency.province)
  );
}

export function getShalomDistricts(department: string, province: string) {
  const normalizedDepartment = normalizeLocation(department);
  const normalizedProvince = normalizeLocation(province);

  return uniqueSorted(
    shalomAgencies
      .filter(
        (agency) =>
          normalizeLocation(agency.department) === normalizedDepartment &&
          normalizeLocation(agency.province) === normalizedProvince
      )
      .map((agency) => agency.district)
  );
}

export function getShalomProvinceAgencyCount(department: string, province: string) {
  const normalizedDepartment = normalizeLocation(department);
  const normalizedProvince = normalizeLocation(province);

  if (!normalizedDepartment || !normalizedProvince) return 0;

  return shalomAgencies.filter(
    (agency) =>
      normalizeLocation(agency.department) === normalizedDepartment &&
      normalizeLocation(agency.province) === normalizedProvince
  ).length;
}

export function isShalomDistrictRequired(department: string, province: string) {
  const count = getShalomProvinceAgencyCount(department, province);
  return count >= lowAgencyProvinceLimit;
}

export function getShalomAgencyById(id: string) {
  return shalomAgencies.find((agency) => agency.id === id) ?? null;
}

export function getShalomAgencyOptions(department: string, province: string, district: string): ShalomAgencyOption[] {
  const normalizedDepartment = normalizeLocation(department);
  const normalizedProvince = normalizeLocation(province);
  const normalizedDistrict = normalizeLocation(district);

  if (!normalizedDepartment || !normalizedProvince) return [];

  const sameDepartment = shalomAgencies.filter((agency) => normalizeLocation(agency.department) === normalizedDepartment);
  const sameProvince = sameDepartment.filter((agency) => normalizeLocation(agency.province) === normalizedProvince);
  if (!normalizedDistrict) {
    if (!sameProvince.length || isShalomDistrictRequired(department, province)) return [];

    return sameProvince
      .map((agency) => ({ ...agency, matchLevel: "province" as const }))
      .sort((a, b) => collator.compare(a.district, b.district) || collator.compare(a.name, b.name));
  }

  const sameDistrict = sameProvince.filter((agency) => normalizeLocation(agency.district) === normalizedDistrict);
  const base = sameDistrict.length ? sameDistrict : sameProvince.length ? sameProvince : sameDepartment;
  const matchLevel: ShalomMatchLevel = sameDistrict.length
    ? "district"
    : sameProvince.length
      ? "province"
      : sameDepartment.length
        ? "department"
        : "none";

  return base
    .map((agency) => ({ ...agency, matchLevel }))
    .sort(
      (a, b) =>
        collator.compare(a.province, b.province) ||
        collator.compare(a.district, b.district) ||
        collator.compare(a.name, b.name)
    );
}

export function distanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const radiusKm = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function sortShalomOptionsByDistance(options: ShalomAgencyOption[], location: { lat: number; lng: number }) {
  return options
    .map((agency) => ({
      ...agency,
      distanceKm: agency.lat && agency.lng ? distanceKm(location, { lat: agency.lat, lng: agency.lng }) : null
    }))
    .sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) return collator.compare(a.district, b.district) || collator.compare(a.name, b.name);
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });
}
