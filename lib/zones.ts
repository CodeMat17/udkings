import type { DeliveryZone } from "./types";

export const DELIVERY_ZONES: DeliveryZone[] = [
  { state: "Lagos", city: "Lagos Island", fee: 2000, etaDays: "Same day" },
  { state: "Lagos", city: "Ikoyi / Victoria Island", fee: 3000, etaDays: "1 day" },
  { state: "Lagos", city: "Yaba / Surulere", fee: 3000, etaDays: "1 day" },
  { state: "Lagos", city: "Ikeja / Mainland", fee: 3500, etaDays: "1 day" },
  { state: "Lagos", city: "Lekki / Ajah", fee: 4500, etaDays: "1 – 2 days" },
  { state: "Ogun", fee: 5000, etaDays: "2 days" },
  { state: "Oyo", fee: 6000, etaDays: "2 days" },
  { state: "Rivers", fee: null, etaDays: "2 – 4 days" },
  { state: "Abuja (FCT)", fee: null, etaDays: "2 – 4 days" },
  { state: "Anambra", fee: null, etaDays: "2 – 4 days" },
  { state: "Enugu", fee: null, etaDays: "2 – 4 days" },
  { state: "Kano", fee: null, etaDays: "3 – 5 days" },
  { state: "Other state", fee: null, etaDays: "3 – 5 days" },
];

export function zoneLabel(zone: DeliveryZone): string {
  return zone.city ? `${zone.state} — ${zone.city}` : zone.state;
}

export const ZONE_LABELS = DELIVERY_ZONES.map(zoneLabel);

export function zoneFor(label: string): DeliveryZone | undefined {
  return DELIVERY_ZONES.find((z) => zoneLabel(z) === label);
}

