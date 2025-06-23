# Dashboard por Roles - LogBid

## Descripción General

Se ha implementado una arquitectura de dashboard separada por roles para brindar una experiencia personalizada y específica para cada tipo de usuario en LogBid.

## Estructura de Componentes

### 1. Dashboard Principal (`GraphicsDashboard.tsx`)
- **Función**: Componente orquestador principal que detecta el rol del usuario y renderiza la vista apropiada
- **Lógica de Decisión**: 
  - Detecta el rol desde `profile?.role`
  - Si `role === 'agent'` → Renderiza `AgentDashboardView`
  - Por defecto → Renderiza `ImporterDashboardView`

### 2. Vista de Importador (`ImporterDashboardView.tsx`)
- **Target**: Usuarios importadores/exportadores
- **Métricas Incluidas**:
  - 💰 Costo Total y Ahorro (`CostMetricsCard`)
  - 📦 Estado de Envíos (`ShipmentStatusMetrics`)
  - ⚡ Tiempo de Respuesta (`ResponseTimeMetrics`)
  - 🗺️ Rutas Principales (`TopRoutesMetrics`)
  - 🎯 Tasa de Éxito y Actividad (`SuccessRateMetrics`)

### 3. Vista de Agente (`AgentDashboardView.tsx`)
- **Target**: Usuarios agentes logísticos
- **Estado**: Actualmente con placeholders, preparado para futuras métricas específicas
- **Secciones Planificadas**:
  - 🎯 Performance y Conversión
  - 💰 Métricas Financieras
  - 🗺️ Rutas y Especialización
  - 📊 Oportunidades de Mercado
  - ⚡ Eficiencia Operacional

## Características Implementadas

### ✅ Separación Total por Roles
- No hay mezcla de componentes entre roles
- Cada vista es independiente y especializada
- Filtros y configuraciones específicas por rol

### ✅ Internacionalización Completa
- Soporte para español e inglés
- Traducciones específicas por rol:
  - `dashboard.importer.*` - Para importadores
  - `dashboard.agent.*` - Para agentes

### ✅ Filtros Personalizados
- Cada vista tiene sus propios filtros adaptados
- Mercado, período, tipo de transporte
- Actualización independiente de datos

### ✅ UI/UX Diferenciada
- **Importador**: Icono de Package (📦), colores azules
- **Agente**: Icono de Target (🎯), colores verdes
- Títulos y subtítulos específicos por rol

## Métricas por Rol

### Importador (Completas)
1. **Métricas de Costo**: Gasto total, ahorro, tendencias
2. **Estado de Envíos**: Activos, cerrados, alertas críticas
3. **Tiempo de Respuesta**: Eficiencia del mercado
4. **Rutas Principales**: Análisis geográfico y de costos
5. **Tasa de Éxito**: Performance operacional y de agentes

### Agente (En Desarrollo)
1. **Performance y Conversión**: Tasa de éxito, valor de contratos
2. **Métricas Financieras**: Ingresos, márgenes, comparativas
3. **Rutas y Especialización**: Análisis de especialización geográfica
4. **Oportunidades**: Envíos disponibles, alertas inteligentes
5. **Eficiencia Operacional**: Tiempos de entrega, cumplimiento

## Archivos Modificados

```
src/app/(modules)/graphics/components/
├── GraphicsDashboard.tsx          # Orquestador principal
├── ImporterDashboardView.tsx      # Vista específica para importadores
└── AgentDashboardView.tsx         # Vista específica para agentes

src/i18n/locales/
├── es.json                        # Traducciones en español
└── en.json                        # Traducciones en inglés
```

## Próximos Pasos

### Para Agentes
1. Implementar métricas de conversión y performance
2. Crear componentes de análisis financiero
3. Desarrollar sistema de oportunidades en tiempo real
4. Añadir métricas de eficiencia operacional

### Mejoras Generales
1. Implementar cache inteligente por rol
2. Añadir notificaciones específicas por rol
3. Personalización avanzada de dashboard
4. Analytics y tracking por tipo de usuario

## Ventajas de esta Arquitectura

1. **Escalabilidad**: Fácil añadir nuevos roles sin afectar existentes
2. **Mantenibilidad**: Código separado y organizado por responsabilidades
3. **Performance**: Solo carga métricas relevantes para cada rol
4. **UX**: Experiencia personalizada y relevante
5. **Seguridad**: Aislamiento natural de datos por rol 