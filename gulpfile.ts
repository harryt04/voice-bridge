import { task } from 'gulp'
import { createMongoDbIndexes } from './lib/mongo-utils'

task('create-indexes', async () => {
  await createMongoDbIndexes(`voicebridge-development`)
  await createMongoDbIndexes(`voicebridge-production`)
})
