import clsx from 'clsx';

export default function Button({
  children,
  variant = 'primary',
  size = 'lg',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 cursor-pointer';

  const variants = {
    primary: 'bg-ink text-cream hover:bg-accent',
    outline: 'border-2 border-ink text-ink hover:bg-ink hover:text-cream',
    'outline-light': 'border-2 border-cream text-cream hover:bg-cream hover:text-ink',
    accent: 'bg-accent text-cream hover:bg-accent-soft',
  };

  const sizes = {
    sm: 'px-6 py-3 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-12 py-5 text-base',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
