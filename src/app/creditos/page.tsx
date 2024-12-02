'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import { usePage } from '@/contexts/page-context';
import { SimulacaoPDF } from '@/components/creditos/simulacao-pdf';
import { Dialog } from '@headlessui/react';
import { Simulacao } from '@/types/simulacao';

const credits: Simulacao[] = [
  {
    id: 1,
    client: 'João Silva',
    value: 'R$ 5.000',
    status: 'Aprovada',
    date: '10/01/2024',
    paymentDay: '05',
  },
  {
    id: 2,
    client: 'Maria Santos',
    value: 'R$ 3.000',
    status: 'Em Análise',
    date: '09/01/2024',
    paymentDay: '10',
  },
  {
    id: 3,
    client: 'Pedro Oliveira',
    value: 'R$ 2.000',
    status: 'Reprovada',
    date: '08/01/2024',
    paymentDay: '15',
  },
];

export default function CreditosPage() {
  const { setTitle } = usePage();
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [selectedSimulacao, setSelectedSimulacao] = useState<Simulacao | null>(null);

  const handleVisualizarPDF = (simulacao: Simulacao) => {
    setSelectedSimulacao(simulacao);
    setIsPDFModalOpen(true);
  };

  useEffect(() => {
    setTitle('Créditos');
  }, [setTitle]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Créditos
          </h3>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
            Gerencie todas as solicitações de crédito do sistema.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0">
          <button
            type="button"
            className="flex items-center gap-1 rounded-md bg-orange-600 dark:bg-orange-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-orange-500 dark:hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 dark:focus-visible:outline-orange-500"
          >
            <Plus className="h-4 w-4" />
            Novo Crédito
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-1 items-center justify-end gap-x-6">
        <div className="w-full max-w-lg">
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
              className="block w-full rounded-md border-0 bg-white dark:bg-gray-900 py-1.5 pl-10 pr-3 text-gray-900 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 dark:focus:ring-orange-500 sm:text-sm sm:leading-6"
              placeholder="Buscar créditos..."
              type="search"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-300 dark:ring-gray-700 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
              >
                Cliente
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Valor
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Data
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
              >
                Dia de Pagamento
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {credits.map((credit) => (
              <tr key={credit.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                  {credit.client}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {credit.value}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      credit.status === 'Aprovada'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : credit.status === 'Em Análise'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {credit.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {credit.date}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  Dia {credit.paymentDay}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button
                    onClick={() => handleVisualizarPDF(credit)}
                    className="text-orange-600 dark:text-orange-500 hover:text-orange-900 dark:hover:text-orange-400 inline-flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    Visualizar PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal do PDF */}
      <Dialog
        open={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => setIsPDFModalOpen(false)}
              >
                <span className="sr-only">Fechar</span>
              </button>
            </div>
            {selectedSimulacao && <SimulacaoPDF simulacao={selectedSimulacao} />}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
