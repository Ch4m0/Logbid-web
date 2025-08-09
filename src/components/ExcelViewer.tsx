'use client'
import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { X, Download, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/src/hooks/useTranslation'
import { supabase } from '@/src/utils/supabase/client'

interface ExcelViewerProps {
  fileUrl: string
  onClose: () => void
  isOpen: boolean
}

interface SheetData {
  [key: string]: any[][]
}

export default function ExcelViewer({ fileUrl, onClose, isOpen }: ExcelViewerProps) {
  const { t } = useTranslation()
  const [sheetData, setSheetData] = useState<SheetData>({})
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [activeSheet, setActiveSheet] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && fileUrl) {
      loadExcelFile()
    }
  }, [isOpen, fileUrl])

  const loadExcelFile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Extraer el path del archivo de la URL
      const url = new URL(fileUrl)
      const pathParts = url.pathname.split('/object/packaging-lists/')
      if (pathParts.length < 2) {
        throw new Error('URL de archivo inválida')
      }
      
      const pathWithoutBucket = pathParts[1]
      
      console.log('Original URL:', fileUrl)
      console.log('Path without bucket:', pathWithoutBucket)
      
      // Obtener URL firmada de Supabase
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('packaging-lists')
        .createSignedUrl(pathWithoutBucket, 3600) // URL válida por 1 hora
      
      if (signedUrlError || !signedUrlData) {
        throw new Error('Error al obtener acceso al archivo')
      }
      
      // Fetch the file using the signed URL
      const response = await fetch(signedUrlData.signedUrl)
      if (!response.ok) {
        throw new Error('Error al cargar el archivo')
      }
      
      const arrayBuffer = await response.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      
      const sheets: SheetData = {}
      const names = workbook.SheetNames
      
      names.forEach(name => {
        const worksheet = workbook.Sheets[name]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          blankrows: false 
        }) as any[][]
        sheets[name] = jsonData
      })
      
      setSheetData(sheets)
      setSheetNames(names)
      setActiveSheet(names[0] || '')
      
    } catch (err) {
      console.error('Error loading Excel file:', err)
      setError('Error al cargar el archivo Excel')
    } finally {
      setLoading(false)
    }
  }

  const downloadFile = async () => {
    try {
      // Extraer el path del archivo de la URL
      const url = new URL(fileUrl)
      const pathParts = url.pathname.split('/object/packaging-lists/')
      if (pathParts.length < 2) {
        throw new Error('URL de archivo inválida')
      }
      
      const pathWithoutBucket = pathParts[1]
      
      // Obtener URL firmada de Supabase
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('packaging-lists')
        .createSignedUrl(pathWithoutBucket, 300) // URL válida por 5 minutos
      
      if (signedUrlError || !signedUrlData) {
        throw new Error('Error al obtener acceso al archivo')
      }
      
      // Descargar usando la URL firmada
      const link = document.createElement('a')
      link.href = signedUrlData.signedUrl
      link.download = 'lista-empaque.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error downloading file:', err)
      alert('Error al descargar el archivo')
    }
  }

  const renderTable = (data: any[][]) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No hay datos en esta hoja
        </div>
      )
    }

    return (
      <div className="overflow-auto max-h-96 border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {data[0]?.map((header: any, index: number) => (
                <th 
                  key={index} 
                  className="px-3 py-2 text-left border-b border-gray-200 font-medium text-gray-700 min-w-[100px]"
                >
                  {header || `Columna ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row: any[], rowIndex: number) => (
              <tr 
                key={rowIndex} 
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {row.map((cell: any, cellIndex: number) => (
                  <td 
                    key={cellIndex} 
                    className="px-3 py-2 border-b border-gray-100 text-gray-800"
                  >
                    {cell || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">
            📄 Visor de Lista de Empaque
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadFile}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cerrar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Cargando archivo Excel...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={loadExcelFile}
                  className="mt-4"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && sheetNames.length > 0 && (
            <div className="h-full flex flex-col">
              {/* Pestañas de hojas */}
              {sheetNames.length > 1 && (
                <div className="border-b mb-4">
                  <div className="flex space-x-1 overflow-x-auto">
                    {sheetNames.map((name) => (
                      <button
                        key={name}
                        onClick={() => setActiveSheet(name)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap ${
                          activeSheet === name
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Contenido de la hoja activa */}
              <div className="flex-1 overflow-hidden">
                {activeSheet && sheetData[activeSheet] && (
                  <div>
                    <div className="mb-2 text-sm text-gray-600">
                      Mostrando {sheetData[activeSheet].length - 1} filas de datos
                    </div>
                    {renderTable(sheetData[activeSheet])}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
