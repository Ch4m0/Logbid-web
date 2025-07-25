import { useGetAirportList } from '@/src/app/hooks/useGetAirportList'
import React, { useState, useEffect, useRef } from 'react'

interface Option {
  airport_name: string
  country: string
  country_code?: string
  iata?: string
  icao?: string
  id: number
}

interface Props {
  label: string
  value?: string // El valor seleccionado actual (puede venir desde el componente padre)
  onSelect: (option: Option) => void // Función para manejar la selección
}

export default function FilterableSelectAirport({
  label,
  value,
  onSelect,
}: Props) {
  const [search, setSearch] = useState('')
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(
    undefined
  )
  const [isSearching, setIsSearching] = useState(false) // Controla el estado de búsqueda
  const [isDropdownOpen, setIsDropdownOpen] = useState(false) // Controla si el dropdown está abierto
  const inputRef = useRef<HTMLInputElement | null>(null) // Referencia para mantener el foco

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetAirportList(search) // Simula el hook para obtener datos

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus() // Mantener el foco en el campo de búsqueda al cambiar la búsqueda
    }
  }, [search])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsSearching(false) // Deshabilitar el estado de búsqueda una vez termine de escribir
    }, 800)

    return () => clearTimeout(timeout) // Limpiar el timeout si el usuario sigue escribiendo
  }, [search])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom =
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
      e.currentTarget.clientHeight
    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const allOptions = data?.pages.flatMap((page) => page.data) || []

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchValue = e.target.value
    setSearch(newSearchValue)
    setIsSearching(true) // Activar el estado de búsqueda mientras el usuario escribe
    setIsDropdownOpen(true) // Asegurar que el menú se mantenga abierto al buscar
  }

  const handleOptionClick = (option: Option) => {
    setSelectedOption(option)
    onSelect(option) // Notificar al componente padre la selección
    setIsDropdownOpen(false) // Cerrar el menú después de seleccionar
  }

  // Sincronizar el valor seleccionado con la opción actual
  useEffect(() => {
    // Solo intentar sincronizar si hay un valor y hay opciones disponibles
    if (value && allOptions.length > 0) {
      const selected = allOptions.find(
        (option) => option.id.toString() === value
      )
      if (selected && (!selectedOption || selectedOption.id.toString() !== value)) {
        setSelectedOption(selected)
      }
    } else if (!value && selectedOption) {
      // Si no hay valor pero hay una opción seleccionada, limpiarla
      setSelectedOption(undefined)
    }
  }, [value, allOptions, selectedOption])

  // Limpiar la selección cuando se cambia el prop value a undefined o empty
  useEffect(() => {
    if (!value) {
      setSelectedOption(undefined)
    }
  }, [value])

  return (
    <div className="grid gap-2">
      <label htmlFor="tipo-envio" className="text-sm font-medium">
        {label}
      </label>

      {/* Trigger para abrir/cerrar el dropdown */}
      <div className="relative">
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
        >
          <span className="truncate">
            {selectedOption 
              ? `${selectedOption.country} ${selectedOption.country_code ? `(${selectedOption.country_code})` : ''}`
              : 'Seleccionar'
            }
          </span>
          <span className="h-4 w-4 opacity-50 flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </button>

        {/* Dropdown content */}
        {isDropdownOpen && (
          <div
            className="absolute z-50 mt-2 max-h-96 min-w-[8rem] overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md"
            style={{ width: '100%' }}
          >
            <div className="p-2 sticky top-0 bg-white z-10">
              <input
                ref={inputRef}
                placeholder="Buscar..."
                value={search}
                onChange={handleInputChange}
                className="w-full mb-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div
              onScroll={handleScroll}
              style={{ maxHeight: '200px', overflowY: 'auto' }}
            >
              {allOptions.map((option: Option) => (
                <div
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                    isSearching ? 'opacity-50 pointer-events-none' : ''
                  } ${selectedOption?.id === option.id ? 'bg-accent text-accent-foreground' : ''}`}
                >
                  <div className="truncate">
                    <div className="font-medium">
                      {option.country} {option.country_code ? `(${option.country_code})` : ''}
                    </div>
                  </div>
                </div>
              ))}
              {isFetchingNextPage && (
                <div className="p-2 text-center">Cargando más...</div>
              )}
              {allOptions.length === 0 && !isFetchingNextPage && search && (
                <div className="p-2 text-center text-muted-foreground">
                  No se encontraron aeropuertos
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
