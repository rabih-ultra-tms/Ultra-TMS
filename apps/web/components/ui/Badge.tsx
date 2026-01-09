import { ReactNode } from 'react';

type BadgeVariant = 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'default' | 'success' | 'warning' | 'error';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  gray: 'bg-slate-100 text-slate-800',
  default: 'bg-slate-100 text-slate-800',
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  success: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  warning: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  error: 'bg-red-100 text-red-800',
  purple: 'bg-purple-100 text-purple-800',
  indigo: 'bg-indigo-100 text-indigo-800',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1 py-0.5 text-[10px]',
  md: 'px-1.5 py-0.5 text-xs',
  lg: 'px-2 py-0.5 text-sm',
};

export default function Badge({ variant = 'gray', size = 'md', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
