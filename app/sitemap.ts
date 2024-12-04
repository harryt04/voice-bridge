import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://voicebridge.app',
      lastModified: new Date(),
    },
    {
      url: 'https://voicebridge.app/login',
      lastModified: new Date(),
    },
  ]
}
