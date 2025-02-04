'use client';

import { Bell, Search, ChevronLeft, Moon, Sun, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useSidebar } from '@/contexts/sidebar-context';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { isOpen, toggle } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white dark:bg-black dark:border-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Toggle Sidebar Button */}
      <button
        type="button"
        onClick={toggle}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 dark:focus:ring-orange-500"
      >
        <span className="sr-only">Toggle sidebar</span>
        <ChevronLeft 
          className={cn(
            "h-6 w-6 text-gray-600 dark:text-gray-300 transition-transform duration-200",
            !isOpen && "rotate-180"
          )} 
          aria-hidden="true" 
        />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search */}
        <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
          <div className="flex-1 max-w-md">
            <label htmlFor="search" className="sr-only">
              Buscar
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="search"
                name="search"
                className="block w-full rounded-md border-0 bg-white dark:bg-gray-900 py-1.5 pl-10 pr-3 text-gray-900 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 dark:focus:ring-orange-500 sm:text-sm sm:leading-6"
                placeholder="Buscar..."
                type="search"
              />
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="relative rounded-lg bg-gray-100 dark:bg-gray-900 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
          >
            <span className="sr-only">
              {theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            </span>
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative rounded-lg bg-gray-100 dark:bg-gray-900 p-1.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
          >
            <span className="sr-only">Ver notificações</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 dark:bg-orange-500 ring-2 ring-white dark:ring-black" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Separator */}
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:bg-gray-800" aria-hidden="true" />

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-x-2 rounded-full bg-gray-100 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
              >
                <span className="sr-only">Abrir menu do usuário</span>
                <div className="h-8 w-8 rounded-full bg-orange-600 dark:bg-orange-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">WM</span>
                </div>
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-gray-900 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {user.email}
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700"></div>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => router.push('/login')}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Entrar
                      </button>
                      <button
                        onClick={() => router.push('/signup')}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Criar Conta
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
