export const getTransportTypeName = (transportType: string, t: (key: string) => string) => {
    switch (transportType) {
      case '1':
        return t('transport.maritime')
      case '2':
        return t('transport.air')
      default:
        return transportType
    }
}

export const getTypeShipmentName = (typeShipment: string, t: (key: string) => string) => {
    switch (typeShipment) {
        case '1':
            return t('createCargo.comexTypes.importation')
        case '2':
            return t('createCargo.comexTypes.exportation')
        default:
            return typeShipment
    }
}