import { NoResultsComponent } from '@/components/custom/no-results-component'
import { AppleIcon } from 'lucide-react'
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs'
import { getMongoClient, mongoDBConfig } from '@/lib/mongo-client'
import { currentUser } from '@clerk/nextjs/server'
import ItemsList from '@/components/custom/items-list'
import { Food } from '@/models/food'

export default async function Foods() {
  const user = await currentUser()
  let initialFoods: Food[] = []
  let speakerId = ''

  if (user) {
    const client = await getMongoClient()
    const db = client.db(mongoDBConfig.dbName)

    // First get the selected speaker for this user
    const speakersCollection = db.collection(mongoDBConfig.collections.speakers)
    const speaker = await speakersCollection.findOne({
      userId: user.id,
      isSelected: true,
    })

    if (speaker) {
      speakerId = speaker._id.toString()
      // Then get the foods for this speaker
      const foodsCollection = db.collection(mongoDBConfig.collections.foods)
      const documents = await foodsCollection
        .find({ speakerId: speakerId })
        .toArray()

      initialFoods = documents.map((doc) => ({
        ...doc,
        _id: doc._id.toString(),
      })) as Food[]
    }
  }

  const pageInfo = {
    editModelName: 'food',
    singularLabel: 'food',
    pluralLabel: 'foods',
    noResultsComponent: (
      <NoResultsComponent
        icon={<AppleIcon />}
        title={`No foods added yet`}
        body={['Add a food or drink that your speaker likes!']}
      />
    ),
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <ItemsList
          initialItems={initialFoods}
          pageInfo={pageInfo}
          speakerId={speakerId}
        />
      </SignedIn>
    </>
  )
}
