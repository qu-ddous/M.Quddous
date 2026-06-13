import PropTypes from 'prop-types';

// Full-page spinner (used for route transitions and initial auth load)
const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
        </div>
        <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

// Inline spinner — use inside buttons or small areas
export const Spinner = ({ size = 'sm', className = '' }) => {
  const sizes = { xs: 'h-3 w-3', sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };
  return (
    <svg
      className={`animate-spin ${sizes[size]} text-current ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  className: PropTypes.string,
};

// Card skeleton — use in list/grid while data loads
export const SkeletonCard = ({ count = 3 }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
          <div className="h-3 bg-white/10 rounded w-1/2 mb-2" />
          <div className="h-3 bg-white/10 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
};

SkeletonCard.propTypes = {
  count: PropTypes.number,
};

// Table skeleton
export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-white/10 rounded mb-4 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 mb-3">
          <div className="h-3 bg-white/10 rounded flex-1" />
          <div className="h-3 bg-white/10 rounded flex-1" />
          <div className="h-3 bg-white/10 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
};

SkeletonTable.propTypes = {
  rows: PropTypes.number,
};

export default Loading;
