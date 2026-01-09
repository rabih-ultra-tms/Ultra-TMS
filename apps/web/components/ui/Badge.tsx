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
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-sm',
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
