import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://scaffolding.app',
      lastModified: new Date(),
    },
    {
      url: 'https://scaffolding.app/login',
      lastModified: new Date(),
    },
  ]
}
