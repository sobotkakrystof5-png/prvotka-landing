import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

/**
 * Sitemap. Právní stránky jsou zatím jen placeholder s `noindex`, proto tu nejsou.
 * `/styleguide` je interní a do sitemapy nepatří nikdy.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl()}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
