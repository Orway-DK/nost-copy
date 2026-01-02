"use client";

import React from "react";
import TextareaAutosize from "react-textarea-autosize";

interface TextareaAutoResizeProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
}

export default function TextareaAutoResize({
  value,
  onChange,
  placeholder,
  minRows = 3,
  maxRows = 20,
  className = "",
  disabled = false,
  required = false,
  name,
  id,
}: TextareaAutoResizeProps) {
  return (
    <TextareaAutosize
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      minRows={minRows}
      maxRows={maxRows}
      disabled={disabled}
      required={required}
      name={name}
      id={id}
      className={`admin-textarea min-h-[80px] w-full resize-none ${className}`}
      style={{
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    />
  );
}
