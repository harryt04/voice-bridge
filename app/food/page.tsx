import GenericItemsPage, {
  GenericPageInfo,
} from '@/components/custom/generic-items-page'
import { NoResultsComponent } from '@/components/custom/no-results-component'
import { AppleIcon } from 'lucide-react'
import React from 'react'

function Foods() {
  const pageInfo: GenericPageInfo = {
    listModelName: 'foods',
    editModelName: 'food',
    singularLabel: 'food',
    pluralLabel: 'foods',
    noResultsComponent: (
      <NoResultsComponent
        icon={<AppleIcon />}
        title={`No foods added yet`}
        body={'Add a food or drink that your speaker likes!'}
      />
    ),
  }
  return (
    <>
      <GenericItemsPage pageInfo={pageInfo} />
    </>
  )
}

export default Foods
