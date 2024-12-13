'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import { usePage } from '@/contexts/page-context';
import { SimulacaoPDF } from '@/components/creditos/simulacao-pdf';
import { Dialog } from '@headlessui/react';
import { Simulacao } from '@/types/simulacao';
import { SimulacoesAPI } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { NovoCredito } from '@/components/creditos/NovoCredito';

export default function CreditosPage() {
  const { setTitle } = usePage();
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isNovoCreditoModalOpen, setIsNovoCreditoModalOpen] = useState(false);
  const [selectedSimulacao, setSelectedSimulacao] = useState<Simulacao | null>(null);
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarSimulacoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await SimulacoesAPI.listar();
      if (error) {
        throw error;
      }
      setSimulacoes(data as Simulacao[] || []);
    } catch (error) {
      console.error('Erro ao carregar simulações:', error);
      toast.error('Erro ao carregar simulações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarSimulacoes();
  }, []);

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
          <div className="flex gap-2">
            <button
              onClick={() => setIsNovoCreditoModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Novo Crédito
            </button>
          </div>
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
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-300 sm:pl-6"
              >
                Cliente
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
              >
                Valor
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
              >
                Número de Parcelas
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
              >
                Taxa de Entrada
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
              >
                Status
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Carregando...
                </td>
              </tr>
            ) : simulacoes.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Nenhuma simulação encontrada
                </td>
              </tr>
            ) : (
              simulacoes.map((credit) => (
                <tr key={credit.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-300 sm:pl-6">
                    {credit.nome_cliente}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {credit.valor_emprestimo && `R$ ${credit.valor_emprestimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {credit.numero_parcelas}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {credit.taxa_entrada && `${credit.taxa_entrada.toFixed(2)}%`}
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
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      type="button"
                      onClick={() => handleVisualizarPDF(credit)}
                      className="text-orange-600 dark:text-orange-500 hover:text-orange-900 dark:hover:text-orange-400"
                    >
                      <FileText className="h-5 w-5" />
                      <span className="sr-only">Visualizar PDF</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PDF Modal */}
      <Dialog
        as="div"
        className="relative z-10"
        open={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
      >
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
              {selectedSimulacao && <SimulacaoPDF simulacao={selectedSimulacao} />}
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>

      <NovoCredito
        isOpen={isNovoCreditoModalOpen}
        onClose={() => setIsNovoCreditoModalOpen(false)}
      />
    </div>
  );
}
