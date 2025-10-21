import logoSvg from '../assets/logo.svg';
import logoPng from '../assets/Logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  iconOnly?: boolean;
  className?: string;
  usePng?: boolean;  // Option to use PNG instead of SVG
}

export default function Logo({ size = 'md', className = '', usePng = false }: LogoProps) {
  const heightClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-28',  // Increased for better visibility
  };

  const logoSrc = usePng ? logoPng : logoSvg;

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logoSrc}
        alt="Galpha"
        className={`${heightClasses[size]} w-auto object-contain`}
        style={{ minWidth: size === 'xl' ? '280px' : 'auto' }}
        onError={(e) => {
          console.error('Failed to load logo:', logoSrc);
          console.error('Image element:', e.currentTarget);
          console.error('Image src:', e.currentTarget.src);
          // Try fallback to PNG if SVG fails
          if (!usePng && e.currentTarget.src !== logoPng) {
            e.currentTarget.src = logoPng;
          } else {
            // Add visual indicator of error
            e.currentTarget.style.border = '2px solid red';
          }
        }}
      />
    </div>
  );
}
