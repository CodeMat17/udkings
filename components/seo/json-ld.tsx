import { BUSINESS, SITE_URL } from "@/lib/business";
import { bestPriceFor } from "@/lib/pricing";
import type { Product } from "@/lib/types";

function Script({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Server-rendered, from our own data. No user input reaches this.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: `${BUSINESS.address.street}, ${BUSINESS.address.landmark}`,
  addressLocality: BUSINESS.address.locality,
  addressRegion: BUSINESS.address.region,
  addressCountry: BUSINESS.address.country,
};

export function LocalBusinessJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "ClothingStore",
        name: BUSINESS.name,
        url: SITE_URL,
        telephone: `+${BUSINESS.whatsapp}`,
        address: ADDRESS,
        geo: {
          "@type": "GeoCoordinates",
          latitude: BUSINESS.address.geo.lat,
          longitude: BUSINESS.address.geo.lng,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "08:00",
            closes: "18:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Saturday"],
            opens: "08:00",
            closes: "17:00",
          },
        ],
        priceRange: "₦₦",
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: BUSINESS.name,
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/shop?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function ProductJsonLd({ product }: { product: Product }) {
  const best = bestPriceFor(product);
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.seoDescription,
        sku: product.sku,
        material: product.material,
        image: `${SITE_URL}${product.image.src}`,
        brand: { "@type": "Brand", name: BUSINESS.name },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "NGN",
          lowPrice: best.unitPrice,
          highPrice: product.retailPrice,
          offerCount: product.priceTiers.length,
          // Everything in the catalogue is a colour and size we actually hold.
          availability: "https://schema.org/InStock",
          url: `${SITE_URL}/product/${product.slug}`,
          seller: { "@type": "Organization", name: BUSINESS.name },
        },
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  trail,
}: {
  trail: { name: string; href: string }[];
}) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${SITE_URL}${item.href}`,
        })),
      }}
    />
  );
}
