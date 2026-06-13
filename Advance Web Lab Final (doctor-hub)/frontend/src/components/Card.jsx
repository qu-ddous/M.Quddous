import { cn } from '../lib/utils';

const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl backdrop-blur-glass border border-white/10 shadow-glass',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className }) => {
  return (
    <div className={cn('p-6 border-b border-white/10', className)}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className }) => {
  return <div className={cn('p-6', className)}>{children}</div>;
};

const CardFooter = ({ children, className }) => {
  return (
    <div className={cn('p-6 border-t border-white/10', className)}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardContent, CardFooter };
