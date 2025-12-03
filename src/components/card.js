import React from 'react';

const Card = ({ children, className, ...props }) => (
  <div className={`border rounded shadow-sm p-4 bg-white ${className}`} {...props}>
    {children}
  </div>
);

export default Card;