// components/AdvancedFilters.jsx
import { useState, useMemo } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { ArrowUpDown, Filter } from "lucide-react";
import { FiltersOffer } from "@/src/models/FiltersOffer";

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
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
        
        {showFilters && (
          <Button variant="outline" onClick={resetFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>
      
      {/* Todos los filtros */}
      {showFilters && (
        <>
          {/* Filtros básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Fecha de creación</label>
              <div className="flex items-center">
                <Input
                  placeholder="Filtrar fecha"
                  value={filters.inserted_at}
                  onChange={(e) => handleFilterChange("inserted_at", e.target.value)}
                />
                <Button variant="ghost" size="icon" onClick={() => handleSort("inserted_at")} className="ml-1">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Código agente</label>
              <div className="flex items-center">
                <Input 
                  placeholder="Filtrar agente" 
                  value={filters.agent_id}
                  onChange={(e) => handleFilterChange("agent_id", e.target.value)} 
                />
                <Button variant="ghost" size="icon" onClick={() => handleSort("agent_id")} className="ml-1">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Oferta</label>
              <div className="flex items-center">
                <Input 
                  placeholder="Filtrar oferta" 
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
                  <h3 className="font-medium text-sm mb-2">Filtros para envíos Marítimos</h3>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tipo de Contenedor</label>
                  <div className="flex items-center">
                    <Input 
                      placeholder="Filtrar contenedor" 
                      value={filters["details.freight_fees.container"]}
                      onChange={(e) => handleFilterChange("details.freight_fees.container", e.target.value)} 
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleSort("details.freight_fees.container")} className="ml-1">
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Valor del Flete</label>
                  <div className="flex items-center">
                    <Input 
                      placeholder="Filtrar valor" 
                      value={filters["details.freight_fees.value"]}
                      onChange={(e) => handleFilterChange("details.freight_fees.value", e.target.value)} 
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleSort("details.freight_fees.value")} className="ml-1">
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Handling (Destino)</label>
                  <div className="flex items-center">
                    <Input 
                      placeholder="Filtrar handling" 
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
                  <h3 className="font-medium text-sm mb-2 mt-4">Filtros para envíos Aéreos</h3>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Longitud</label>
                  <div className="flex items-center">
                    <Input 
                      placeholder="Filtrar longitud" 
                      value={filters["details.freight_fees.dimensions.length"]}
                      onChange={(e) => handleFilterChange("details.freight_fees.dimensions.length", e.target.value)} 
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleSort("details.freight_fees.dimensions.length")} className="ml-1">
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Cargo de Combustible</label>
                  <div className="flex items-center">
                    <Input 
                      placeholder="Filtrar cargo de combustible" 
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