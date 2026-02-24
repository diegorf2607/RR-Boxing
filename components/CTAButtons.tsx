'use client';

import { useModal } from './ModalProvider';

interface CTAButtonProps {
  variant?: 'primary' | 'secondary' | 'highticket';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export function CourseButton({ variant = 'primary', size = 'md', className = '', children }: CTAButtonProps) {
  const { openModal } = useModal();

  const baseStyles = 'font-bold rounded-xl transition-all transform hover:scale-105';
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-accent via-yellow-500 to-amber-500 text-dark shadow-lg shadow-accent/30 hover:shadow-accent/50',
    secondary: 'bg-dark-300 text-white border border-accent/50 hover:bg-dark-200',
    highticket: 'bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50',
  };

  return (
    <button
      onClick={() => openModal()}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function HighTicketButton({ size = 'md', className = '', children }: Omit<CTAButtonProps, 'variant'>) {
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const handleClick = () => {
    window.location.href = '/consulta';
  };

  return (
    <button
      onClick={handleClick}
      className={`font-bold rounded-xl transition-all transform hover:scale-105 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
}
