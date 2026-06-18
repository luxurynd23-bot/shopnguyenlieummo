import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://shopnguyenlieummo.uk",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://shopnguyenlieummo.uk/login",
      lastModified: new Date(),
    },
    {
      url: "https://shopnguyenlieummo.uk/register",
      lastModified: new Date(),
    },
  ];
}