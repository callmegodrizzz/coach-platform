import clsx from 'clsx';

export default function Container({ children, className = '' }) {
  return (
    <div className={clsx('max-w-[1600px] mx-auto px-8 md:px-16', className)}>
      {children}
    </div>
  );
}
