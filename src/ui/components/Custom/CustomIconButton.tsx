/** @jsx h */
import { icon } from '@/ui/styles/output.css'
import { h } from 'preact'

type CustomIconButtonProps = {
  onClick: (e: MouseEvent | KeyboardEvent) => void
  title: string
  icon: string
  className?: string
}

export const CustomIconButton = ({ onClick, title, icon, className = '' }: CustomIconButtonProps) => (
  <div
    role="button"
    tabIndex={0}
    onClick={(e: MouseEvent) => onClick(e)}
    onKeyPress={(e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick(e)
      }
    }}
    title={title}
    className={`flex items-center justify-center cursor-pointer ${className}`}
  >
    <span className={"icon hover:bg-primary-dark text-primary text-sm"}>{icon}</span>
  </div>
)