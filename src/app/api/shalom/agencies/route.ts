import { NextResponse } from "next/server";
import { getShalomAgencyOptions, sortShalomOptionsByDistance } from "@/lib/shalom";

type GeocodeResult = {
  lat: string;
  lon: string;
};

async function geocodeDistrict(province: string, district: string) {
  const params = new URLSearchParams({
    format: "jsonv2",
    limit: "1",
    countrycodes: "pe",
    q: `${district}, ${province}, Peru`
  });

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        "User-Agent": "Danatto checkout location selector"
      },
      next: { revalidate: 60 * 60 * 24 * 30 }
    });

    if (!response.ok) return null;

    const data = (await response.json()) as GeocodeResult[];
    const first = data[0];
    if (!first) return null;

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const province = searchParams.get("province") || "";
  const district = searchParams.get("district") || "";
  const options = getShalomAgencyOptions(province, district);

  if (!province || !district || !options.length) {
    return NextResponse.json({ agencies: [], geocoded: false });
  }

  if (options[0]?.matchLevel === "district") {
    return NextResponse.json({ agencies: options, geocoded: false });
  }

  const location = await geocodeDistrict(province, district);

  return NextResponse.json({
    agencies: location ? sortShalomOptionsByDistance(options, location) : options,
    geocoded: Boolean(location)
  });
}
