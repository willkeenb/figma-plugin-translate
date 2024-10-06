/** @jsx h */
import { icon } from '@/ui/styles/output.css'
import { h } from 'preact'

type CustomIconButtonProps = {
  onClick: () => void
  title: string
  icon: string
  className?: string
}

export const CustomIconButton = ({ onClick, title, icon, className = '' }: CustomIconButtonProps) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyPress={(e) => e.key === 'Enter' && onClick()}
    title={title}
    className={`flex items-center justify-center cursor-pointer
       ${className}
    `}
  >
    <span className={"icon hover:bg-primary-dark text-primary text-sm"}>{icon}</span>
  </div>
)