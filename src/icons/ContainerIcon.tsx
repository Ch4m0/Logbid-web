// icon:train-car-container | Material Design Icons https://materialdesignicons.com/ | Austin Andrews
import * as React from 'react'

function ContainerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height="1em"
      width="1em"
      {...props}
    >
      <path d="M1 6v11h1a2 2 0 104 0h12a2 2 0 104 0h1V6H1m20 9h-2V9h-2v6h-2V9h-2v6h-2V9H9v6H7V9H5v6H3V8h18v7z" />
    </svg>
  )
}

export default ContainerIcon
