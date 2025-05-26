// components/AdvancedFilters.jsx
import { useState, useMemo } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { ArrowUpDown, Filter } from "lucide-react";
import { FiltersOffer } from "@/src/models/FiltersOffer";
import { useTranslation } from "@/src/hooks/useTranslation";

interface AdvancedFiltersProps { 
    filters: FiltersOffer;
    handleFilterChange: (field: string, value: string) => void;
    handleSort: (field: string) => void;
    resetFilters: () => void;
    bidDataForAgent?: any; // Define el tipo correcto según tu estructura de datos
}

const AdvancedFilters = ({ 
  filters, 
  handleFilterChange, 
  handleSort, 
  resetFilters, 
  bidDataForAgent 
}: AdvancedFiltersProps) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  // Determinar qué tipos de envío hay en las ofertas
  const hasAereoOffers = useMemo(() => {
    return bidDataForAgent?.offers?.some((o:any ) => o.shipping_type === "Aéreo");

  }, [bidDataForAgent?.offers]);
  
  const hasMaritimoOffers = useMemo(() => {
    return bidDataForAgent?.offers?.some((o: any) => o.shipping_type === "Marítimo");
  }, [bidDataForAgent?.offers]);

  return (
    <>
      {/* Botón para mostrar/ocultar todos los filtros */}
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? t('common.hideFilters') : t('common.showFilters')}
        </Button>
        
        {showFilters && (
          <Button variant="outline" onClick={resetFilters}>
            {t('agentFilters.clearFilters')}
          </Button>
        )}
      </div>
      
      {/* Todos los filtros */}
      {showFilters && (
        <>
          {/* Filtros básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('agentFilters.creationDate')}</label>
              <div className="flex items-center">
                <Input
                  placeholder={t('agentFilters.filterDate')}
                  value={filters.inserted_at}
                  onChange={(e) => handleFilterChange("inserted_at", e.target.value)}
                />
                <Button variant="ghost" size="icon" onClick={() => handleSort("inserted_at")} className="ml-1">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('agentFilters.agentCode')}</label>
              <div className="flex items-center">
                <Input 
                  placeholder={t('agentFilters.filterAgent')} 
                  value={filters.agent_id}
                  onChange={(e) => handleFilterChange("agent_id", e.target.value)} 
                />
                <Button variant="ghost" size="icon" onClick={() => handleSort("agent_id")} className="ml-1">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('agentFilters.offer')}</label>
              <div className="flex items-center">
                <Input 
                  placeholder={t('agentFilters.filterOffer')} 
                  value={filters.price}
                  onChange={(e) => handleFilterChange("price", e.target.value)} 
                />
                <Button variant="ghost" size="icon" onClick={() => handleSort("price")} className="ml-1">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Filtros avanzados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-muted/10 rounded-md border">
            {/* Filtros para Marítimo */}
            {hasMaritimoOffers && (
              <>
                <div className="md:col-span-3">
                  <h3 className="font-medium text-sm mb-2">{t('agentFilters.maritimeFilters')}</h3>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('agentFilters.containerType')}</label>
                  <div className="flex items-center">
                    <Input 
                      placeholder={t('agentFilters.filterContainer')} 
                      value={filters["details.freight_fees.container"]}
                      onChange={(e) => handleFilterChange("details.freight_fees.container", e.target.value)} 
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleSort("details.freight_fees.container")} className="ml-1">
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('agentFilters.freightValue')}</label>
                  <div className="flex items-center">
                    <Input 
                      placeholder={t('agentFilters.filterValue')} 
                      value={filters["details.freight_fees.value"]}
                      onChange={(e) => handleFilterChange("details.freight_fees.value", e.target.value)} 
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleSort("details.freight_fees.value")} className="ml-1">
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('agentFilters.handlingDestination')}</label>
                  <div className="flex items-center">
                    <Input 
                      placeholder={t('agentFilters.filterHandling')} 
                      value={filters["details.destination_fees.handling"]}
                      onChange={(e) => handleFilterChange("details.destination_fees.handling", e.target.value)} 
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleSort("details.destination_fees.handling")} className="ml-1">
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            {/* Filtros para Aéreo */}
            {hasAereoOffers && (
              <>
                <div className="md:col-span-3">
                  <h3 className="font-medium text-sm mb-2 mt-4">{t('agentFilters.airFilters')}</h3>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('agentFilters.length')}</label>
                  <div className="flex items-center">
                    <Input 
                      placeholder={t('agentFilters.filterLength')} 
                      value={filters["details.freight_fees.dimensions.length"]}
                      onChange={(e) => handleFilterChange("details.freight_fees.dimensions.length", e.target.value)} 
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleSort("details.freight_fees.dimensions.length")} className="ml-1">
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('agentFilters.fuelCharge')}</label>
                  <div className="flex items-center">
                    <Input 
                      placeholder={t('agentFilters.filterFuelCharge')} 
                      value={filters["details.additional_fees.fuel"]}
                      onChange={(e) => handleFilterChange("details.additional_fees.fuel", e.target.value)} 
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleSort("details.additional_fees.fuel")} className="ml-1">
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default AdvancedFilters;