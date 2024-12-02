'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, Bell, Mail, Globe, Lock, Database, CreditCard } from 'lucide-react';
import { usePage } from '@/contexts/page-context';
import { useTheme } from '@/contexts/theme-context';

export default function ConfiguracoesPage() {
  const { setTitle } = usePage();
  const { theme, toggleTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    setTitle('Configurações');
  }, [setTitle]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Aparência */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Aparência</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Personalize a aparência do sistema.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    Tema do Sistema
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                    <p>Escolha entre o tema claro ou escuro para a interface do sistema.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="relative rounded-lg bg-gray-100 dark:bg-gray-900 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
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
              </div>
            </div>
          </div>
        </section>

        {/* Notificações */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gerencie como você recebe notificações do sistema.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Notificações por Email
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                    <p>Receba atualizações importantes por email.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500 focus:ring-offset-2 ${
                    emailNotifications ? 'bg-orange-600 dark:bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Ativar notificações por email</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      emailNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificações Push
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                    <p>Receba notificações em tempo real no navegador.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-500 focus:ring-offset-2 ${
                    pushNotifications ? 'bg-orange-600 dark:bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Ativar notificações push</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      pushNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Configurações do Sistema */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Sistema
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Configurações gerais e informações do sistema.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
            {/* Informações do Sistema */}
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                <Database className="h-5 w-5" />
                Informações do Sistema
              </h3>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome do Sistema</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">Facilita Cred</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Versão</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">1.0.0</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Desenvolvido por</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">Grupo Moraes Company</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ano</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">2024</dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Configurações de Segurança */}
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Segurança
              </h3>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 dark:bg-orange-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-orange-500"
                >
                  Alterar Senha
                </button>
              </div>
            </div>

            {/* Configurações de Crédito */}
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Configurações de Crédito
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="taxa-juros" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Taxa de Juros Padrão (% a.m.)
                  </label>
                  <input
                    type="number"
                    name="taxa-juros"
                    id="taxa-juros"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                    placeholder="2.5"
                  />
                </div>
                <div>
                  <label htmlFor="prazo-maximo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Prazo Máximo de Financiamento (meses)
                  </label>
                  <input
                    type="number"
                    name="prazo-maximo"
                    id="prazo-maximo"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                    placeholder="48"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
