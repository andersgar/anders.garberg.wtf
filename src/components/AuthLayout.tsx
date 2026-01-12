import { ReactNode } from "react";
import { Link } from "react-router-dom";

type BackLink =
  | {
      to: string;
      label: string;
      icon?: string;
      external?: false;
    }
  | {
      to: string;
      label: string;
      icon?: string;
      external: true;
    };

export interface AppBranding {
  name: string;
  logo?: string;
  colors: {
    primary: string;
    primaryForeground: string;
    accent: string;
    background: string;
  };
}

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerBadge?: ReactNode;
  backLink?: BackLink;
  appBranding?: AppBranding;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  headerBadge,
  backLink,
  appBranding,
}: AuthLayoutProps) {
  const defaultBadge = (
    <div className="brand-badge" aria-hidden="true">
      AG
    </div>
  );

  const brandingBadge = appBranding?.logo ? (
    <div className="brand-badge brand-logo" aria-hidden="true">
      <img src={appBranding.logo} alt={appBranding.name} />
    </div>
  ) : null;

  const renderBackLink = () => {
    if (!backLink) return null;
    const content = (
      <>
        {backLink.icon && <i className={backLink.icon}></i>} {backLink.label}
      </>
    );

    return (
      <div className="back-link">
        {backLink.external ? (
          <a href={backLink.to}>{content}</a>
        ) : (
          <Link to={backLink.to}>{content}</Link>
        )}
      </div>
    );
  };

  return (
    <div
      className="login-page"
      style={
        appBranding
          ? ({
              "--auth-primary": appBranding.colors.primary,
              "--auth-primary-foreground": appBranding.colors.primaryForeground,
              "--auth-accent": appBranding.colors.accent,
              "--auth-background": appBranding.colors.background,
            } as React.CSSProperties)
          : undefined
      }
    >
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            {headerBadge ?? brandingBadge ?? defaultBadge}
            <h2 className="login-title">{title}</h2>
            {subtitle && <p className="login-subtitle">{subtitle}</p>}
          </div>
          {children}
          {renderBackLink()}
        </div>
      </div>
    </div>
  );
}

export function AuthLoading({ message }: { message?: string }) {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="loading-spinner">
            <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
          </div>
          {message && <p className="login-subtitle">{message}</p>}
        </div>
      </div>
    </div>
  );
}
