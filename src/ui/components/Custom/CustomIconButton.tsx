import { h } from "preact";

type CustomIconButtonProps = {
  onClick: (e: MouseEvent | KeyboardEvent) => void;
  title: string;
  icon: string;
  className?: string;
  spin?: boolean; // Добавляем prop для управления вращением
};

export const CustomIconButton = ({ onClick, title, icon, className = '', spin = false }: CustomIconButtonProps) => (
  <div
    role="button"
    tabIndex={0}
    onClick={(e: MouseEvent) => onClick(e)}
    onKeyPress={(e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    }}
    title={title}
    className={`flex items-center justify-center cursor-pointer ${className}`}
  >
    <span className={`icon hover:bg-primary-dark text-primary text-sm ${spin ? 'animate-spin' : ''}`}>{icon}</span>
  </div>
);