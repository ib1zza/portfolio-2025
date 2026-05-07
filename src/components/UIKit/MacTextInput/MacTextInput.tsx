import clsx from "clsx";
import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import s from "./MacTextInput.module.scss";

type MacTextInputProps = InputHTMLAttributes<HTMLInputElement>;

export const MacTextInput = forwardRef<HTMLInputElement, MacTextInputProps>(
  function MacTextInput({ className, ...props }, ref) {
    return <input ref={ref} className={clsx(s.input, className)} {...props} />;
  },
);
