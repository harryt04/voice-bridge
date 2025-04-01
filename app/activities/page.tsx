import GenericItemsPage, {
  GenericPageInfo,
} from '@/components/custom/generic-items-page'
import { NoResultsComponent } from '@/components/custom/no-results-component'
import { ActivityIcon, DrumIcon } from 'lucide-react'
import React from 'react'

function ActivitiesPage() {
  const pageInfo: GenericPageInfo = {
    listModelName: 'activities',
    editModelName: 'activity',
    singularLabel: 'activity',
    pluralLabel: 'activities',
    noResultsComponent: (
      <NoResultsComponent
        icon={<DrumIcon />}
        title={`No activities added yet`}
        body={['Add an activity that your speaker likes!']}
      />
    ),
  }
  return (
    <>
      <GenericItemsPage pageInfo={pageInfo} />
    </>
  )
}

export default ActivitiesPage
