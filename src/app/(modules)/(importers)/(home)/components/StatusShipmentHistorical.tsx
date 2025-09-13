import { useTranslation } from "@/src/hooks/useTranslation";
import { formatStatus } from "@/src/lib/utils";
import { CheckCircle, Clock, X } from "lucide-react";

const statusColors = {
    Expired: 'text-red-700',
    Cancelled: 'text-red-700',
    Closed: 'text-green-700',
}

const statusIcons = {
    Expired: <Clock className="h-4 w-4" />,
    Cancelled: <X className="h-4 w-4" />,
    Closed: <CheckCircle className="h-4 w-4" />,
}

export function StatusShipmentHistorical({ status }: { status: string }) { 
    const { t } = useTranslation()
    
    return (
        <div className={`flex items-center gap-2 ${statusColors[status as keyof typeof statusColors]}`}>
            {statusIcons[status as keyof typeof statusIcons]}
            <span className="text-xs font-medium">
                {formatStatus(status, t)}
            </span> 
        </div>
    )
}