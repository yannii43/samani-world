import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'default' | 'text-only' | 'icon-only' | 'white';
  className?: string;
  linkTo?: string;
}

export default function Logo({ variant = 'default', className = '', linkTo = '/' }: LogoProps) {
  const isWhite = variant === 'white';
  
  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      {(variant === 'default' || variant === 'icon-only' || variant === 'white') && (
        <img 
          src="/brand/logo.png" 
          alt="Samani World" 
          className="h-10 w-10 object-contain"
        />
      )}
      {(variant === 'default' || variant === 'text-only' || variant === 'white') && (
        <span 
          className={`text-2xl font-bold tracking-tight ${isWhite ? 'text-white' : ''}`} 
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          SAMANI WORLD
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