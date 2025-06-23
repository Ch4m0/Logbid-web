'use client'
import React from 'react'
import { ImporterDashboardView } from './ImporterDashboardView'
import { AgentDashboardView } from './AgentDashboardView'
import useAuthStore from '@/src/store/authStore'
import { useTranslation } from '@/src/hooks/useTranslation'

export function GraphicsDashboard() {
  const { t } = useTranslation()
  const profile = useAuthStore((state) => state.profile)

  // Si no hay perfil cargado, mostrar loading
  if (!profile?.id) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">{t('dashboard.importer.loading')}</span>
        </div>
      </div>
    )
  }

  // Determinar el rol del usuario
  const userRole = profile?.role || 'importer'

  // Renderizar la vista específica para el rol
  if (userRole === 'agent') {
    return <AgentDashboardView profile={profile} />
  }

  // Por defecto, mostrar vista de importador
  return <ImporterDashboardView profile={profile} />
} 