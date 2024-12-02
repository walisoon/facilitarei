'use client';

import { useState } from 'react';
import { PlusCircle, Search, Pencil, Trash2 } from 'lucide-react';
import { NovoConsultorModal } from '@/components/consultores/novo-consultor-modal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const consultores = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao.silva@facilitacred.com',
    cargo: 'Gerente de Vendas',
    status: 'Ativo',
    dataAdmissao: new Date(2023, 0, 1), // 01/01/2023
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria.santos@facilitacred.com',
    cargo: 'Analista de Crédito',
    status: 'Ativo',
    dataAdmissao: new Date(2023, 1, 15), // 15/02/2023
  },
  {
    id: 3,
    nome: 'Pedro Oliveira',
    email: 'pedro.oliveira@facilitacred.com',
    cargo: 'Consultor Financeiro',
    status: 'Inativo',
    dataAdmissao: new Date(2023, 2, 10), // 10/03/2023
  },
];

export default function Consultores() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Consultores</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Lista de todos os consultores da empresa, incluindo nome, cargo e status.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-x-2 rounded-md bg-indigo-600 dark:bg-orange-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-orange-500"
          >
            <PlusCircle className="h-5 w-5" />
            Novo Consultor
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-6 max-w-md">
        <label htmlFor="search" className="sr-only">
          Buscar consultores
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
            placeholder="Buscar por nome, email ou cargo..."
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
                      Cargo
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Data de Admissão
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                  {consultores
                    .filter(
                      (consultor) =>
                        consultor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        consultor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        consultor.cargo.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((consultor) => (
                      <tr key={consultor.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                          {consultor.nome}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                          {consultor.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                          {consultor.cargo}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              consultor.status === 'Ativo'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {consultor.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                          {format(consultor.dataAdmissao, 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            type="button"
                            className="text-indigo-600 hover:text-indigo-900 dark:text-orange-500 dark:hover:text-orange-400 mr-4"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar {consultor.nome}</span>
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir {consultor.nome}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <NovoConsultorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
