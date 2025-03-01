import React, { Suspense } from 'react'
import { CargaProposalsList } from './components/CargaProposalsList'

const page = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CargaProposalsList />
    </Suspense>
  )
}

export default page
