import React from 'react'

export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false
}) => {
  const baseClasses = 'btn'
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary', 
    danger: 'btn-danger'
  }
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export interface StatusBadgeProps {
  status: 'planned' | 'in-progress' | 'done' | 'blocked'
  size?: 'sm' | 'md'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const statusClasses = {
    planned: 'status-planned',
    'in-progress': 'status-in-progress',
    done: 'status-done',
    blocked: 'status-blocked'
  }

  return (
    <span className={`status-badge ${statusClasses[status]} status-${size}`}>
      {status.replace('-', ' ')}
    </span>
  )
}

export interface PlanTypeIconProps {
  type: 'project' | 'initiative' | 'issue' | 'subissue'
  size?: number
}

export const PlanTypeIcon: React.FC<PlanTypeIconProps> = ({ type, size = 16 }) => {
  const icons = {
    project: '📁',
    initiative: '🎯', 
    issue: '📋',
    subissue: '📝'
  }

  return (
    <span className="plan-type-icon" style={{ fontSize: size }}>
      {icons[type]}
    </span>
  )
}
