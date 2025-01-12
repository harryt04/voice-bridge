import GenericItemsPage, {
  GenericPageInfo,
} from '@/components/custom/generic-items-page'
import React from 'react'

function ActivitiesPage() {
  const pageInfo: GenericPageInfo = {
    listModelName: 'activities',
    editModelName: 'activity',
    singularLabel: 'activity',
    pluralLabel: 'activities',
  }
  return (
    <>
      <GenericItemsPage pageInfo={pageInfo} />
    </>
  )
}

export default ActivitiesPage
