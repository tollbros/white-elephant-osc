import React from 'react';

export const Alert = ({ children, className, ...props }) => (
  <div
  className={`p-4 border rounded bg-blue-100 ${className} max-w-3xl mx-auto text-center flex flex-col items-center`}
  {...props}
>
  {children}
</div>
);

export const AlertDescription = ({ children }) => (
    <p className="text-m text-center">{children}</p>
);