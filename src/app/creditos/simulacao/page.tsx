'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, FileText, MoreVertical, Check, Trash2, X } from 'lucide-react';
import { usePage } from '@/contexts/page-context';
import { NovaSimulacaoModal } from '@/components/creditos/nova-simulacao-modal';
import { SimulacaoPDF } from '@/components/creditos/simulacao-pdf';
import { Dialog } from '@headlessui/react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { SimulacoesAPI } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Simulacao, SimulacaoStatus } from '@/types/simulacao';

interface StatusOption {
  id: SimulacaoStatus;
  name: string;
  color: string;
}

const statusOptions: StatusOption[] = [
  { id: 'Aprovada', name: 'Aprovada', color: 'green' },
  { id: 'Em Análise', name: 'Em Análise', color: 'yellow' },
  { id: 'Reprovada', name: 'Reprovada', color: 'red' },
];

const formatCurrency = (value?: number) => {
  if (value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatarData = (data?: string) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR');
};

export default function SimulacaoPage() {
  const { setTitle } = usePage();
  const [showModal, setShowModal] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [selectedSimulacao, setSelectedSimulacao] = useState<Simulacao | null>(null);
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [simulacaoToDelete, setSimulacaoToDelete] = useState<Simulacao | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarSimulacoes = async () => {
    try {
      setLoading(true);
      const data = await SimulacoesAPI.listar();
      setSimulacoes(data as Simulacao[]);
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

  const handleStatusChange = async (simulacaoId: number, newStatus: SimulacaoStatus) => {
    try {
      await SimulacoesAPI.atualizarStatus(simulacaoId, newStatus);
      await carregarSimulacoes(); // Recarrega a lista
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = (simulacao: Simulacao) => {
    setSimulacaoToDelete(simulacao);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (simulacaoToDelete) {
      try {
        await SimulacoesAPI.excluir(simulacaoToDelete.id);
        await carregarSimulacoes(); // Recarrega a lista
        setShowDeleteModal(false);
        setSimulacaoToDelete(null);
        toast.success('Simulação excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir simulação:', error);
        toast.error('Erro ao excluir simulação');
      }
    }
  };

  const handleVisualizarPDF = (simulacao: Simulacao) => {
    // Garantir que os valores numéricos estão formatados corretamente
    const simulacaoFormatada = {
      ...simulacao,
      valor_emprestimo: Number(simulacao.valor_emprestimo),
      taxa_entrada: Number(simulacao.taxa_entrada),
      numero_parcelas: Number(simulacao.numero_parcelas),
      valor_entrada: Number(simulacao.valor_entrada),
      valor_parcela: Number(simulacao.valor_parcela)
    };
    setSelectedSimulacao(simulacaoFormatada);
    setIsPDFModalOpen(true);
  };

  useEffect(() => {
    setTitle('Simulação de Crédito');
  }, [setTitle]);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Simulação de Crédito
            </h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
              Gerencie todas as simulações de crédito realizadas no sistema.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="block rounded-md bg-orange-600 dark:bg-orange-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-orange-500 dark:hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 dark:focus-visible:outline-orange-500"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Simulação
              </div>
            </button>
          </div>
        </div>

        {/* Modal */}
        <NovaSimulacaoModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={carregarSimulacoes}
        />

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
                placeholder="Buscar simulações..."
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
                  Nº Simulação
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
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
                  Parcelas
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Taxa
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
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {simulacoes.map((simulacao) => (
                <tr key={simulacao.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                    {simulacao.numero}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {simulacao.nome_cliente}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(simulacao.valor_emprestimo)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {simulacao.numero_parcelas}x
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {simulacao.taxa_entrada}%
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          simulacao.status === 'Aprovada'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : simulacao.status === 'Em Análise'
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {simulacao.status}
                      </span>
                      <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className="flex items-center text-gray-400 hover:text-gray-600">
                          <span className="sr-only">Mudar status</span>
                          <MoreVertical className="h-4 w-4" />
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              {statusOptions.map((option) => (
                                <Menu.Item key={option.id}>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleStatusChange(simulacao.id, option.id)}
                                      className={`${
                                        active
                                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                          : 'text-gray-700 dark:text-gray-200'
                                      } group flex items-center w-full px-4 py-2 text-sm`}
                                    >
                                      {simulacao.status === option.name && (
                                        <Check className="mr-2 h-4 w-4 text-orange-500" />
                                      )}
                                      <span className={simulacao.status === option.name ? 'font-medium' : ''}>
                                        {option.name}
                                      </span>
                                    </button>
                                  )}
                                </Menu.Item>
                              ))}
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatarData(simulacao.data_criacao)}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                    <button
                      onClick={() => handleDelete(simulacao)}
                      className="text-red-600 dark:text-red-500 hover:text-red-900 dark:hover:text-red-400"
                      title="Excluir simulação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleVisualizarPDF(simulacao)}
                      className="text-orange-600 dark:text-orange-500 hover:text-orange-900 dark:hover:text-orange-400 inline-flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      PDF
                    </button>
                    <a
                      href="#"
                      className="text-orange-600 dark:text-orange-500 hover:text-orange-900 dark:hover:text-orange-400"
                    >
                      Detalhes
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
              Confirmar Exclusão
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tem certeza que deseja excluir a simulação{' '}
                {simulacaoToDelete?.numero}? Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                onClick={confirmDelete}
              >
                Excluir
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal do PDF */}
      <Dialog
        open={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-start justify-center pt-24 sm:p-4">
          <Dialog.Panel className="mx-auto w-full max-w-4xl rounded bg-white dark:bg-gray-800 shadow-xl relative">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                Visualizar PDF
              </Dialog.Title>
              <button
                type="button"
                className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none p-2"
                onClick={() => setIsPDFModalOpen(false)}
              >
                <span className="sr-only">Fechar</span>
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 p-4">
              {selectedSimulacao && (
                <SimulacaoPDF simulacao={selectedSimulacao} />
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
