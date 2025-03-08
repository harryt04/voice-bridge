import GenericItemsPage, {
  GenericPageInfo,
} from '@/components/custom/generic-items-page'
import { NoResultsComponent } from '@/components/custom/no-results-component'
import { ListChecks } from 'lucide-react'
import React from 'react'

function VocabPage() {
  const pageInfo: GenericPageInfo = {
    listModelName: 'vocabWords',
    editModelName: 'vocabWord',
    singularLabel: 'vocab word',
    pluralLabel: 'vocab words',
    noResultsComponent: (
      <NoResultsComponent
        icon={<ListChecks />}
        title={`No vocab words added yet`}
        body={
          'Add a vocab word that your speaker likes to use or wants tolearn!'
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

export default VocabPage
