"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Home,
  Film,
  Calendar,
  Building2,
  Users,
  Settings,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

// ============================================
// NAVIGATION CONFIG
// ============================================

const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/rooms", label: "Salles", icon: Building2 },
  { href: "/bookings", label: "Mes réservations", icon: Calendar },
];

const adminNavItems = [
  { href: "/admin", label: "Admin Dashboard", icon: Settings },
  { href: "/admin/rooms", label: "Gestion salles", icon: Building2 },
  { href: "/admin/bookings", label: "Réservations", icon: Calendar },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
];

// ============================================
// HEADER
// ============================================

interface HeaderProps {
  onMenuToggle: () => void;
}

function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 z-40">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="text-red-600">◆</span>
            <span>CineRoom</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/rooms"
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
          >
            <Film className="w-4 h-4" />
            Réserver
          </Link>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}

// ============================================
// SIDEBAR
// ============================================

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 z-50
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Close button mobile */}
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors group
                    ${
                      isActive
                        ? "bg-red-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Switch section */}
          <div className="p-4 border-t border-slate-800">
            {isAdmin ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Retour utilisateur</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Administration</span>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

// ============================================
// DASHBOARD LAYOUT
// ============================================

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({
  children,
  title,
  description,
  actions,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header onMenuToggle={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:pl-64 pt-16">
        <div className="p-6 lg:p-8">
          {/* Page Header */}
          {(title || actions) && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                {title && (
                  <h1 className="text-2xl lg:text-3xl font-bold">{title}</h1>
                )}
                {description && (
                  <p className="text-slate-400 mt-1">{description}</p>
                )}
              </div>
              {actions && <div className="flex gap-3">{actions}</div>}
            </div>
          )}

          {/* Page Content */}
          {children}
        </div>
      </main>
    </div>
  );
}
