import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://vb.harryt.dev',
      lastModified: new Date(),
    },
    {
      url: 'https://vb.harryt.dev/login',
      lastModified: new Date(),
    },
  ]
}
