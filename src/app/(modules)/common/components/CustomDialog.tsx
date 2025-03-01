'use client'
import React, { useEffect, useState } from 'react'
import CloseIcon from '@/src/icons/CloseIcon'
import { modalService } from '@/src/service/modalService'

interface ModalContent {
  component: React.ComponentType<any>
  props: Record<string, any>
}

const Modal = () => {
  const [modalContent, setModalContent] = useState<ModalContent | null>(null)

  useEffect(() => {
    const subscription = modalService.modal$.subscribe((content) => {
      setModalContent(content)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const closeModal = () => {
    modalService.closeModal()
  }

  if (!modalContent) return null

  const { component: Component, props } = modalContent

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full bg-gray-500  bg-opacity-40">
      <div className="relative  w-full max-w-2xl mx-4  rounded-lg shadow-lg h-[calc(100vh-2rem)] bg-white">
        <CloseIcon
          className="absolute top-3 right-3 cursor-pointer"
          onClick={closeModal}
        />
        <Component {...props} />
      </div>
    </div>
  )
}

export default Modal
