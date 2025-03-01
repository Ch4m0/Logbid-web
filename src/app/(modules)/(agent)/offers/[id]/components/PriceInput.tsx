'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'

export default function PriceInput({ sendOffer }: { sendOffer: Function }) {
  const [price, setPrice] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value

    // Eliminar cualquier carácter no numérico, excepto el punto decimal
    const numericValue = input.replace(/[^0-9.]/g, '')

    // Permitir solo un punto decimal
    if (numericValue.split('.').length > 2) return

    setPrice(numericValue)
  }

  const handleBlur = () => {
    // Formatear el precio cuando el campo pierde el foco
    const numericPrice = parseFloat(price)
    if (!isNaN(numericPrice)) {
      setPrice(formatPrice(numericPrice))
    } else {
      setPrice('')
    }
  }

  const handleSubmit = () => {
    // Eliminar cualquier formato para enviar solo el número
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''))
    if (!isNaN(numericPrice) && numericPrice >= 0) {
      console.log('Precio enviado:', numericPrice)
      sendOffer(numericPrice)
    } else {
      console.error('Ingrese un precio válido')
    }
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="flex items-center gap-4">
      <input
        type="text"
        value={price}
        onChange={handleChange}
        onBlur={handleBlur} // Formatea al salir del campo
        className="border rounded px-2 py-1 w-32 text-right"
        placeholder="$0.00"
      />
      <Button onClick={handleSubmit}>Enviar Oferta</Button>
    </div>
  )
}
