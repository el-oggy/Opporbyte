"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`ui-button ui-button-${variant} ${className}`}
      {...props}
    />
  );
}
export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
  ...props
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <Link
      href={href}
      className={`ui-button ui-button-${variant} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ui-card ${className}`} {...props} />;
}
export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "cyan" | "orange" | "success";
  className?: string;
}) {
  return (
    <span className={`ui-badge ui-badge-${tone} ${className}`}>{children}</span>
  );
}
export function Field({
  label,
  children,
  hint,
  error,
  className = "",
  htmlFor,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={`ui-field ${className}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <small>{hint}</small>}
      {error && (
        <small role="alert" className="ui-error">
          {error}
        </small>
      )}
    </div>
  );
}
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="ui-empty">
      <span aria-hidden="true">↗</span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="ui-page-heading">
      <div>
        {eyebrow && <p className="ui-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {children && <p className="ui-description">{children}</p>}
      </div>
      {action}
    </header>
  );
}
export function Tabs({
  items,
  value,
  onChange,
  label = "Choose view",
}: {
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <div className="ui-tabs" role="group" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={value === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
export function Brand({
  href = "/",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`ui-brand ${className}`}
      aria-label="Opporbyte home"
    >
      <span className="ui-brand-icon" aria-hidden="true">
        o
      </span>
      <span>
        opporbyte<span className="ui-brand-period">.</span>
      </span>
    </Link>
  );
}
export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className="ui-drawer"
      aria-labelledby={id}
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const r = event.currentTarget.getBoundingClientRect();
          if (event.clientX < r.left || event.clientX > r.right) onClose();
        }
      }}
    >
      <div className="ui-drawer-heading">
        <h2 id={id}>{title}</h2>
        <Button variant="ghost" aria-label="Close panel" onClick={onClose}>
          ✕
        </Button>
      </div>
      {children}
    </dialog>
  );
}
