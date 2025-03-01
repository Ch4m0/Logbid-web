// icon:chart-infographic | Tabler Icons https://tablericons.com/ | Csaba Kissi
import * as React from 'react'

function MercadoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      height="1.5em"
      width="1.5em"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" />
      <path d="M11 7 A4 4 0 0 1 7 11 A4 4 0 0 1 3 7 A4 4 0 0 1 11 7 z" />
      <path d="M7 3v4h4M9 17v4M17 14v7M13 13v8M21 12v9" />
    </svg>
  )
}

export default MercadoIcon
