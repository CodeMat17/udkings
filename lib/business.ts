export const BUSINESS = {
  name: "UDKING'S Collections",
  shortName: "UDKING'S",
  tagline: "Ladies' fashion, retail and wholesale — Lagos Island.",
  whatsapp: "2348066568595",
  phoneDisplay: "0806 656 8595",
  telHref: "tel:+2348066568595",
  address: {
    street: "Shop BF04, Andora Plaza, Breadfruit Street",
    landmark: "By St. Paul Anglican Church",
    locality: "Lagos Island",
    region: "Lagos",
    country: "NG",
    geo: { lat: 6.4541, lng: 3.3947 },
  },
  hours: [
    { days: "Monday – Friday", open: "08:00", close: "18:00" },
    { days: "Saturday", open: "08:00", close: "17:00" },
    { days: "Sunday", open: "Closed", close: "" },
  ],
} as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://udkings.com";

export function waLink(message: string): string {
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
}
