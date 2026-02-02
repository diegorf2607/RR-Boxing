'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import ContactModal from './ContactModal';

type ModalType = 'highticket' | 'course' | null;

interface ModalContextType {
  openModal: (type: 'highticket' | 'course') => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalType, setModalType] = useState<ModalType>(null);

  const openModal = (type: 'highticket' | 'course') => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <ContactModal
        isOpen={modalType !== null}
        onClose={closeModal}
        type={modalType || 'course'}
      />
    </ModalContext.Provider>
  );
}
