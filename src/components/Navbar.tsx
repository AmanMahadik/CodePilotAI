'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bot, 
  Terminal, 
  ShieldCheck, 
  FileText, 
  Bell, 
  Github, 
  LogOut, 
  User as UserIcon, 
  CheckCircle2, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { getStoredNotifications, markNotificationAsRead } from '@/lib/store';
import { NotificationItem } from '@/lib/types';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setNotifications(getStoredNotifications());
    const interval = setInterval(() => {
      setNotifications(getStoredNotifications());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleReadNotif = (id: string) => {
    markNotificationAsRead(id);
    setNotifications(getStoredNotifications());
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Layers },
    { name: 'New Review', href: '/review/new', icon: Sparkles },
    { name: 'Repo Chat', href: '/chat/latest', icon: Terminal },
    { name: 'Interview Prep', href: '/interview/latest', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-dark-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">CodePilot</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider -mt-0.5">Engineering Workspace</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800/90 text-brand-300 border border-slate-700/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Institutional Roll Badge */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{user?.user_metadata?.full_name || 'Engineering Workspace'}</span>
          </div>

          {/* Notifications Panel Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowUserMenu(false);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-dark-900" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-dark-850 border border-slate-700/80 shadow-2xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <Bell className="w-3.5 h-3.5 text-brand-400" />
                    <span>Notifications (FR-024)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{unreadCount} unread</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleReadNotif(item.id)}
                      className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        item.read ? 'bg-slate-900/40 text-slate-400' : 'bg-slate-800/70 text-slate-200 border-l-2 border-brand-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-white">{item.title}</span>
                        <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300">{item.message}</p>
                      {item.link && (
                        <Link
                          href={item.link}
                          className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300"
                        >
                          View Review <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifs(false);
                }}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg bg-slate-800/70 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                  {user.user_metadata?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.email?.[0]?.toUpperCase() || 'A'
                  )}
                </div>
                <span className="text-xs font-medium text-slate-200 max-w-[100px] truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* User dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-dark-850 border border-slate-700 shadow-2xl z-50 p-2">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-medium text-white truncate">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    My Repositories
                  </Link>
                  <Link
                    href="/review/new"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                    Start Review (ZIP / Git)
                  </Link>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    onClick={() => {
                      signOut();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
