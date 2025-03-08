import GenericItemsPage, {
  GenericPageInfo,
} from '@/components/custom/generic-items-page'
import { NoResultsComponent } from '@/components/custom/no-results-component'
import { UsersIcon } from 'lucide-react'
import React from 'react'

function PeoplePage() {
  const pageInfo: GenericPageInfo = {
    listModelName: 'villagers',
    editModelName: 'villager',
    singularLabel: 'person',
    pluralLabel: 'people',
    noResultsComponent: (
      <NoResultsComponent
        icon={<UsersIcon />}
        title={`No people added yet`}
        body={
          'Add a person that your speaker likes to interact with or talk to!'
        }
      />
    ),
  }
  return (
    <>
      <GenericItemsPage pageInfo={pageInfo} />
    </>
  )
}

export default PeoplePage
