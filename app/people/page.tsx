import GenericItemsPage, {
  GenericPageInfo,
} from '@/components/custom/generic-items-page'
import React from 'react'

function PeoplePage() {
  const pageInfo: GenericPageInfo = {
    listModelName: 'villagers',
    editModelName: 'villager',
    singularLabel: 'person',
    pluralLabel: 'people',
  }
  return (
    <>
      <GenericItemsPage pageInfo={pageInfo} />
    </>
  )
}

export default PeoplePage
