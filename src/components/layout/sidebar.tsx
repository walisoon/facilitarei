'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CreditCard,
  Users,
  LayoutDashboard,
  Settings,
  ChevronRight,
  CircleDollarSign,
  ChevronDown, 
  Home, 
  UserPlus, 
  Shield 
} from 'lucide-react';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { 
    name: 'Créditos', 
    href: '/creditos', 
    icon: CreditCard
  },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Consultores', href: '/consultores', icon: UserPlus },
  { name: 'Usuários', href: '/usuarios', icon: Shield },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen } = useSidebar();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleItemClick = (itemName: string) => {
    if (itemName === expandedItem) {
      setExpandedItem(null);
    } else if (navigation.find(item => item.name === itemName)?.subItems) {
      setExpandedItem(itemName);
    } else {
      setExpandedItem(null);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300",
        "bg-white border-r border-gray-200 dark:bg-black dark:border-gray-800",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex flex-1 flex-col gap-y-5 overflow-y-auto px-2">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/" className={cn(
            "flex items-center gap-2 px-2",
            !isOpen && "justify-center"
          )}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700">
              <CircleDollarSign className="h-6 w-6 text-white" />
            </div>
            {isOpen && (
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  Facilita Cred
                </h1>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Correspondente Bancário
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.subItems?.some(subItem => pathname === subItem.href));
              const isExpanded = expandedItem === item.name;
              
              return (
                <li key={item.name}>
                  <div>
                    {item.subItems ? (
                      <div>
                        <Link
                          href={item.href}
                          className={cn(
                            "w-full group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6",
                            isOpen ? "justify-start" : "justify-center",
                            pathname === item.href
                              ? "bg-gray-100 dark:bg-gray-900 text-orange-600 dark:text-orange-500"
                              : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-900"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-6 w-6 shrink-0",
                              pathname === item.href
                                ? "text-orange-600 dark:text-orange-500"
                                : "text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-500"
                            )}
                            aria-hidden="true"
                          />
                          {isOpen && (
                            <>
                              <span className="flex-1 text-left">{item.name}</span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleItemClick(item.name);
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                              >
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 transition-transform",
                                    expandedItem === item.name ? "rotate-180" : ""
                                  )}
                                />
                              </button>
                            </>
                          )}
                        </Link>
                        {isOpen && expandedItem === item.name && (
                          <ul className="mt-1 space-y-1 pl-10">
                            {item.subItems.map((subItem) => (
                              <li key={subItem.name}>
                                <Link
                                  href={subItem.href}
                                  className={cn(
                                    "block rounded-md p-2 text-sm leading-6",
                                    pathname === subItem.href
                                      ? "bg-gray-100 dark:bg-gray-900 text-orange-600 dark:text-orange-500"
                                      : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-900"
                                  )}
                                >
                                  {subItem.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "w-full group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6",
                          isOpen ? "justify-start" : "justify-center",
                          pathname === item.href
                            ? "bg-gray-100 dark:bg-gray-900 text-orange-600 dark:text-orange-500"
                            : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-6 w-6 shrink-0",
                            pathname === item.href
                              ? "text-orange-600 dark:text-orange-500"
                              : "text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-500"
                          )}
                          aria-hidden="true"
                        />
                        {isOpen && (
                          <span className="flex-1 text-left">{item.name}</span>
                        )}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
