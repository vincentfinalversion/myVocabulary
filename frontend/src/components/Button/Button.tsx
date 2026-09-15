import type { ComponentProps } from 'react';
import './Button.css';

type Variant = "primary" | "secondary" | "destructive";

type ButtonProps = {
  variant?: Variant
} & ComponentProps <"button">;


function Button ({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`button button-${variant} ${className ?? ""}`}
    />
  );
}

export default Button;