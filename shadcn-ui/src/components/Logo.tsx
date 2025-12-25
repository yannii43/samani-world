import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'default' | 'text-only' | 'icon-only';
  className?: string;
  linkTo?: string;
}

export default function Logo({ variant = 'default', className = '', linkTo = '/' }: LogoProps) {
  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      {(variant === 'default' || variant === 'icon-only') && (
        <img 
          src="/brand/logo.png" 
          alt="Sanii World" 
          className="h-10 w-10 object-contain"
        />
      )}
      {(variant === 'default' || variant === 'text-only') && (
        <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
          SANII WORLD
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}