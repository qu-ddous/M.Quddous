import { cn } from '../lib/utils';

const Button = ({ children, variant = 'primary', size = 'md', className, isLoading, disabled, ...props }) => {
  const variants = {
    primary: 'bg-gradient-primary hover:opacity-90 text-white neon-glow',
    secondary: 'bg-gradient-secondary hover:opacity-90 text-white neon-glow',
    outline: 'border-2 border-primary-500 text-primary-400 hover:bg-glass-200 hover:text-white',
    ghost: 'hover:bg-glass-200 text-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white neon-glow',
    glass: 'bg-glass-200 hover:bg-glass-300 text-white border border-white/20',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  };

  return (
    <button
      className={cn(
        'font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;

