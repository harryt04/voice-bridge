import GenericItemsPage, {
  GenericPageInfo,
} from '@/components/custom/generic-items-page'
import React from 'react'

function Foods() {
  const pageInfo: GenericPageInfo = {
    listModelName: 'foods',
    editModelName: 'food',
  }
  console.log('pageInfo: ', pageInfo)
  return (
    <>
      <GenericItemsPage pageInfo={pageInfo} />
    </>
  )
}

export default Foods
