'use client'
import { Button } from '@/src/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '@/src/components/ui/drawer'
import CloseIcon from '@/src/icons/CloseIcon'
import IconPrinter from '@/src/icons/PrintIcon'
import { drawerService } from '@/src/service/drawerService'
import React, { useEffect, useState } from 'react'

interface DrawerContent {
  component: React.ComponentType<any>
  props: Record<string, any>
}

const CustomDrawer = () => {
  const [drawerContent, setDrawerContent] = useState<DrawerContent | null>(null)
  useState

  useEffect(() => {
    const subscription = drawerService.drawer$.subscribe((content) => {
      setDrawerContent(content)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const closeModal = () => {
    drawerService.closeDrawer()
  }

  if (!drawerContent) return null

  const { component: Component, props } = drawerContent

  const copylink = () => {
    navigator.clipboard.writeText('INFO COPIADA')
  }

  return (
    <Drawer open>
      <DrawerContent>
        <DrawerHeader>
          <CloseIcon
            className="absolute top-3 right-3 cursor-pointer"
            onClick={closeModal}
          />
        </DrawerHeader>
        <Component {...props} />

        <DrawerFooter>
          <DrawerClose>
            <Button onClick={() => window.print()} className="mr-4">
              <IconPrinter className="mr-4" />
              IMPRIMIR
            </Button>

            <Button onClick={copylink}>
              <IconPrinter className="mr-4" />
              Copy
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default CustomDrawer
