VoiceBridge is a free and open source web app that helps children with autism communicate by offering visual tools for daily activities, including navigating places, choosing food, and accessing calming music playlists.

Built with:

- [shadcn/ui](https://ui.shadcn.com)
- Next.js
- Tailwind CSS
- Clerk
- Posthog
- MongoDB
- Hosted on my own server with [Coolify](https://coolify.io/docs)

# Self-hosting your own instance

1. Supply values for the environment variables. A sample file can be found in `.env.sample`.
1. That's it. Depnding on your hosting provider, the next steps vary wildly. I choose to host this on [Coolify](https://coolify.io/docs), which is a self-hosted version of Vercel, basically. But if you're new to next.js, I'd recommend trying out [Vercel](https://vercel.com/new).

# Creating indexes for your own mongodb instance

1. Supply your `defaultConnectionString` in `lib/mongoClient.ts`
1. Run `gulp create-indexes` at the repo root to create indexes for the collections in your mongodb instance.
   - If you get an error about gulp not being found, run `npm install -g gulp` to install gulp globally, then try again.
