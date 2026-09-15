import type { ComponentProps } from "react";
import './TextBox.css';

type TextBoxProps = {
  label?: string;
  error?: string;
} & ComponentProps <"input">;

function TextBox ({
  label, 
  error, 
  ...props 
}: TextBoxProps) {
  return(
    <div className="text-box-container">
      {label && <label className="text-field-label">{label}</label>}
      
      <input
        className="text-box-input"
        {...props}
      />

      <span className={`text-box-error ${!error ? "placeholder" : ""}`}>
        {error || "."}
      </span>     
    </div>
  );
}

export default TextBox;