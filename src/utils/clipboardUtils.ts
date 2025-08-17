import { toast } from "@/src/components/ui/use-toast"

interface CopyToClipboardOptions {
  text: string
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const copyToClipboard = async ({
  text,
  successMessage = "Copiado al portapapeles",
  errorMessage = "Error al copiar",
  onSuccess,
  onError
}: CopyToClipboardOptions): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    
    // Mostrar toast de éxito
    toast({
      title: successMessage,
      description: "La información ha sido copiada correctamente",
    })
    
    // Llamar callback de éxito si existe
    if (onSuccess) {
      onSuccess()
    }
    
    return true
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    
    // Mostrar toast de error
    toast({
      title: errorMessage,
      description: "No se pudo copiar la información",
      variant: "destructive",
    })
    
    // Llamar callback de error si existe
    if (onError) {
      onError(error as Error)
    }
    
    return false
  }
}

// Función específica para copiar detalles de propuesta aceptada
export const copyProposalDetails = async (
  combinedData: any,
  t: (key: string) => string,
  onSuccess?: () => void
): Promise<boolean> => {
  const textToCopy = `
=== ${t('confirmationBid.proposalAccepted').toUpperCase()} ===

${t('confirmationBid.offerCode')}: ${combinedData.uuid}
${t('confirmationBid.auctionCode')}: ${combinedData.codeBid}
${t('confirmationBid.shipmentCode')}: ${combinedData.shipment_uuid}

=== ${t('confirmationBid.route').toUpperCase()} ===
${t('confirmationBid.origin')}: ${combinedData.originBid}
${t('confirmationBid.destination')}: ${combinedData.finishBid}
${t('confirmationBid.shippingType')}: ${combinedData.shipping_type === "2" ? t('confirmationBid.air') : t('confirmationBid.maritime')}

=== ${t('confirmationBid.commercialInformation').toUpperCase()} ===
${t('confirmationBid.shipmentValue')}: ${combinedData.currency} ${Number(combinedData.shipment_value).toLocaleString()}
${t('confirmationBid.commerceType')}: ${formatComexType(combinedData.comex_type, t)}
${t('confirmationBid.transportation')}: ${formatTransportation(combinedData.transportation, t)}
${combinedData.incoterm_name ? `${t('confirmationBid.incoterm')}: ${combinedData.incoterm_name}` : ''}
${combinedData.tariff_item ? `${t('confirmationBid.tariffItem')}: ${combinedData.tariff_item}` : ''}

=== ${t('confirmationBid.cargoInformation').toUpperCase()} ===
${combinedData.total_weight ? `${t('confirmationBid.totalWeight')}: ${Number(combinedData.total_weight).toLocaleString()} ${combinedData.measure_type}` : ''}
${combinedData.volume ? `${t('confirmationBid.volume')}: ${Number(combinedData.volume).toLocaleString()} m³` : ''}
${combinedData.units ? `${t('confirmationBid.units')}: ${Number(combinedData.units).toLocaleString()}` : ''}
${combinedData.merchandise_type ? `${t('confirmationBid.merchandiseType')}: ${combinedData.merchandise_type}` : ''}
${combinedData.container_name ? `${t('confirmationBid.containerType')}: ${combinedData.container_name}` : ''}
${combinedData.dangerous_merch ? `${t('confirmationBid.dangerousMerchandise')}: ${t('confirmationBid.yes')}` : ''}

=== ${t('confirmationBid.pricing').toUpperCase()} ===
${t('confirmationBid.totalPrice')}: ${combinedData.price || `USD ${combinedData.details?.freight_fees?.value || 0}`}
${t('confirmationBid.freightValue')}: USD ${combinedData.details?.freight_fees?.value || 0}

=== ${t('confirmationBid.winningAgent').toUpperCase()} ===
${t('confirmationBid.agent')}: ${combinedData.agent_name}
${combinedData.agent_company && combinedData.agent_company !== t('common.notSpecified') ? `${t('confirmationBid.company')}: ${combinedData.agent_company}` : ''}
${t('confirmationBid.agentCode')}: ${combinedData.agent_code || t('common.notSpecified')}

=== ${t('confirmationBid.datesAndDocuments').toUpperCase()} ===
${t('confirmationBid.proposalDate')}: ${formatDate(combinedData.inserted_at)}
${combinedData.expiration_date ? `${t('confirmationBid.originalExpiration')}: ${formatDate(combinedData.expiration_date)}` : ''}
${combinedData.shipping_date ? `${t('confirmationBid.plannedShippingDate')}: ${formatDate(combinedData.shipping_date)}` : ''}
${combinedData.documents_url ? `${t('confirmationBid.attachedDocuments')}: ${combinedData.documents_url}` : ''}

${combinedData.additional_info ? `${t('confirmationBid.additionalInformation')}: ${combinedData.additional_info}` : ''}
    `.trim().replace(/\n\n+/g, '\n\n')

  return copyToClipboard({
    text: textToCopy,
    successMessage: t('confirmationBid.copiedToClipboard'),
    errorMessage: t('confirmationBid.copyError'),
    onSuccess
  })
}

// Funciones helper para formatear datos
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatComexType = (type: string, t: (key: string) => string) => {
  switch(type) {
    case "1": return t('confirmationBid.import')
    case "2": return t('confirmationBid.export')
    default: return t('common.notSpecified')
  }
}

const formatTransportation = (transportation: string, t: (key: string) => string) => {
  switch(transportation) {
    case "FCL": return t('confirmationBid.fcl')
    case "LCL": return t('confirmationBid.lcl')
    case "Carga suelta": return t('confirmationBid.looseCargo')
    default: return transportation || t('common.notSpecified')
  }
}
