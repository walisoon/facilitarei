'use client';

import { useState } from 'react';
import { PlusCircle, Search, Pencil, Trash2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { NovoUsuarioModal } from '@/components/usuarios/novo-usuario-modal';

// Tipos de perfil de usuário
type UserRole = 'admin' | 'manager' | 'user';

interface User {
  id: number;
  nome: string;
  email: string;
  perfil: UserRole;
  status: 'Ativo' | 'Inativo';
  ultimoAcesso: string;
}

const usuarios: User[] = [
  {
    id: 1,
    nome: 'Admin Sistema',
    email: 'admin@facilitacred.com',
    perfil: 'admin',
    status: 'Ativo',
    ultimoAcesso: '15/03/2024 14:30',
  },
  {
    id: 2,
    nome: 'Gerente Comercial',
    email: 'gerente@facilitacred.com',
    perfil: 'manager',
    status: 'Ativo',
    ultimoAcesso: '15/03/2024 12:45',
  },
  {
    id: 3,
    nome: 'Analista Financeiro',
    email: 'analista@facilitacred.com',
    perfil: 'user',
    status: 'Inativo',
    ultimoAcesso: '10/03/2024 09:15',
  },
];

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return <ShieldAlert className="h-4 w-4 text-red-500" />;
    case 'manager':
      return <ShieldCheck className="h-4 w-4 text-yellow-500" />;
    case 'user':
      return <Shield className="h-4 w-4 text-blue-500" />;
  }
};

const getRoleName = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'manager':
      return 'Gerente';
    case 'user':
      return 'Usuário';
  }
};

export default function Usuarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Usuários do Sistema</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Gerencie os usuários do sistema e suas permissões de acesso.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-x-2 rounded-md bg-indigo-600 dark:bg-orange-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-orange-500"
          >
            <PlusCircle className="h-5 w-5" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-6 max-w-md">
        <label htmlFor="search" className="sr-only">
          Buscar usuários
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            name="search"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-orange-500 bg-white dark:bg-gray-900 sm:text-sm sm:leading-6"
            placeholder="Buscar por nome, email ou perfil..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-opacity-10 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                      Nome
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Perfil
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Último Acesso
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {usuarios
                    .filter(
                      (usuario) =>
                        usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        getRoleName(usuario.perfil).toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((usuario) => (
                      <tr key={usuario.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                          {usuario.nome}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                          {usuario.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                          <div className="flex items-center gap-x-2">
                            {getRoleIcon(usuario.perfil)}
                            <span>{getRoleName(usuario.perfil)}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              usuario.status === 'Ativo'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}
                          >
                            {usuario.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                          {usuario.ultimoAcesso}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex items-center justify-end gap-x-2">
                            <button
                              type="button"
                              className="text-indigo-600 dark:text-orange-500 hover:text-indigo-900 dark:hover:text-orange-400"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar {usuario.nome}</span>
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir {usuario.nome}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <NovoUsuarioModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
