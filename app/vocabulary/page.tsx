import GenericItemsPage, {
  GenericPageInfo,
} from '@/components/custom/generic-items-page'
import React from 'react'

function VocabPage() {
  const pageInfo: GenericPageInfo = {
    listModelName: 'vocabWords',
    editModelName: 'vocabWord',
    singularLabel: 'vocab word',
    pluralLabel: 'vocab words',
  }
  return (
    <>
      <GenericItemsPage pageInfo={pageInfo} />
    </>
  )
}

export default VocabPage
