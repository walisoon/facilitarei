'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, FileText } from 'lucide-react';
import { SimulacaoPDF } from './simulacao-pdf';
import { SimulacoesAPI } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface NovaSimulacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovaSimulacaoModal({ isOpen, onClose }: NovaSimulacaoModalProps) {
  const [formData, setFormData] = useState({
    nomeCliente: '',
    cpf: '',
    consultor: '',
    valorEmprestimo: '',
    taxaEntrada: 0,
    numeroParcelas: 0,
  });

  const [loading, setLoading] = useState(false);
  const [simulacoes, setSimulacoes] = useState<any[]>([]);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [selectedSimulacao, setSelectedSimulacao] = useState(null);

  const formatarMoeda = (valor: string) => {
    valor = valor.replace(/\D/g, '');
    valor = (parseInt(valor) / 100).toFixed(2) + '';
    valor = valor.replace(".", ",");
    valor = valor.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    valor = valor.replace(/(\d)(\d{3}),/g, "$1.$2,");
    return valor;
  };

  const formatarValorParaNumero = (valor: string) => {
    return parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
  };

  const calcularEntrada = () => {
    const valor = parseFloat(formData.valorEmprestimo.replace(/\D/g, '')) / 100;
    const taxa = formData.taxaEntrada / 100;

    if (!valor || !taxa) return '0,00';

    const valorEntrada = valor * taxa;
    return formatarMoeda((valorEntrada * 100).toFixed(0));
  };

  const calcularValorParcelas = () => {
    const valor = parseFloat(formData.valorEmprestimo.replace(/\D/g, '')) / 100;
    const valorEntrada = valor * (formData.taxaEntrada / 100);
    const valorFinanciado = valor - valorEntrada;
    const parcelas = formData.numeroParcelas;

    if (!valorFinanciado || !parcelas) return '0,00';

    const valorParcela = valorFinanciado / parcelas;
    return formatarMoeda((valorParcela * 100).toFixed(0));
  };

  const gerarNumeroSimulacao = () => {
    const ano = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-4); // Últimos 4 dígitos do timestamp
    const numeroAleatorio = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `SIM-${ano}-${timestamp}${numeroAleatorio}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomeCliente || !formData.valorEmprestimo || !formData.numeroParcelas) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const novaSimulacao = {
      numero: await gerarNumeroSimulacao(),
      nome_cliente: formData.nomeCliente,
      cpf: formData.cpf,
      consultor: formData.consultor,
      valor_emprestimo: formatarValorParaNumero(formData.valorEmprestimo),
      taxa_entrada: Number(formData.taxaEntrada),
      numero_parcelas: Number(formData.numeroParcelas),
      valor_entrada: formatarValorParaNumero(calcularEntrada()),
      valor_parcela: formatarValorParaNumero(calcularValorParcelas()),
      status: 'Em Análise' as const
    };

    // Adiciona à lista de simulações
    setSimulacoes(prev => [...prev, novaSimulacao]);
    
    // Limpar apenas os campos de valor, mantendo os dados do cliente
    setFormData(prev => ({
      ...prev,
      valorEmprestimo: '',
      taxaEntrada: 0,
      numeroParcelas: 0,
    }));

    toast.success('Simulação adicionada à lista!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'valorEmprestimo') {
      setFormData(prev => ({
        ...prev,
        [name]: formatarMoeda(value.replace(/\D/g, ''))
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const adicionarSimulacao = async () => {
    if (!formData.nomeCliente || !formData.valorEmprestimo || !formData.numeroParcelas) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const novaSimulacao = {
      numero: await gerarNumeroSimulacao(),
      nome_cliente: formData.nomeCliente,
      cpf: formData.cpf,
      consultor: formData.consultor,
      valor_emprestimo: formatarValorParaNumero(formData.valorEmprestimo),
      taxa_entrada: Number(formData.taxaEntrada),
      numero_parcelas: Number(formData.numeroParcelas),
      valor_entrada: formatarValorParaNumero(calcularEntrada()),
      valor_parcela: formatarValorParaNumero(calcularValorParcelas()),
      status: 'Em Análise' as const
    };

    setSimulacoes([...simulacoes, novaSimulacao]);
    toast.success('Simulação adicionada à lista!');
    
    // Limpar apenas os campos de valor, mantendo os dados do cliente
    setFormData(prev => ({
      ...prev,
      valorEmprestimo: '',
      taxaEntrada: 0,
      numeroParcelas: 0,
    }));
  };

  const salvarTodasSimulacoes = async () => {
    if (!formData.nomeCliente || !formData.valorEmprestimo || !formData.numeroParcelas) {
      // Se houver uma simulação em andamento, adiciona à lista primeiro
      if (formData.nomeCliente && formData.valorEmprestimo && formData.numeroParcelas) {
        await adicionarSimulacao();
      }
    }

    if (simulacoes.length === 0) {
      toast.error('Adicione pelo menos uma simulação antes de salvar');
      return;
    }

    setLoading(true);
    const erros: string[] = [];
    let simulacoesSalvas = 0;

    try {
      for (const simulacao of simulacoes) {
        try {
          // Garantir que todos os valores numéricos estão no formato correto
          const simulacaoFormatada = {
            ...simulacao,
            status: 'Em Análise' as const, // Garante que o status está correto
            valor_emprestimo: Number(simulacao.valor_emprestimo),
            taxa_entrada: Number(simulacao.taxa_entrada),
            numero_parcelas: Number(simulacao.numero_parcelas),
            valor_entrada: Number(simulacao.valor_entrada),
            valor_parcela: Number(simulacao.valor_parcela),
          };

          await SimulacoesAPI.criar(simulacaoFormatada);
          simulacoesSalvas++;
        } catch (error) {
          console.error('Erro ao salvar simulação:', error);
          if (error instanceof Error) {
            erros.push(`Erro ao salvar simulação ${simulacao.numero}: ${error.message}`);
          } else {
            erros.push(`Erro desconhecido ao salvar simulação ${simulacao.numero}`);
          }
        }
      }

      if (erros.length === 0) {
        toast.success('Todas as simulações foram salvas com sucesso!');
        setSimulacoes([]); // Limpa a lista após salvar
        
        // Limpar formulário
        setFormData({
          nomeCliente: '',
          cpf: '',
          consultor: '',
          valorEmprestimo: '',
          taxaEntrada: 0,
          numeroParcelas: 0,
        });
        
        onClose();
      } else {
        if (simulacoesSalvas > 0) {
          toast.success(`${simulacoesSalvas} simulações foram salvas com sucesso!`);
        }
        toast.error(`${erros.length} simulações não puderam ser salvas:`);
        erros.forEach(erro => toast.error(erro));
      }
    } catch (error) {
      console.error('Erro ao salvar simulações:', error);
      if (error instanceof Error) {
        toast.error(`Erro ao salvar simulações: ${error.message}`);
      } else {
        toast.error('Erro desconhecido ao salvar simulações');
      }
    } finally {
      setLoading(false);
    }
  };

  const removerSimulacao = (index: number) => {
    setSimulacoes(simulacoes.filter((_, i) => i !== index));
    toast.success('Simulação removida da lista');
  };

  const handleVisualizarPDF = () => {
    const simulacaoAtual = {
      numero: gerarNumeroSimulacao(),
      nome_cliente: formData.nomeCliente,
      cpf: formData.cpf,
      consultor: formData.consultor,
      valor_emprestimo: formatarValorParaNumero(formData.valorEmprestimo),
      taxa_entrada: Number(formData.taxaEntrada),
      numero_parcelas: Number(formData.numeroParcelas),
      valor_entrada: formatarValorParaNumero(calcularEntrada()),
      valor_parcela: formatarValorParaNumero(calcularValorParcelas()),
      status: 'Em Análise' as const
    };

    setSelectedSimulacao(simulacaoAtual);
    setIsPDFModalOpen(true);
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={onClose}
        >
          {/* Backdrop com blur */}
          <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gradient-to-br from-white/10 via-black/20 to-black/30 backdrop-blur-[2px]" aria-hidden="true" />
          </Transition.Child>

          {/* Full-screen container */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-gradient-to-b from-white/70 to-white/50 dark:from-gray-900/70 dark:to-gray-900/50 text-left shadow-xl transition-all backdrop-blur-sm">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="h-[80vh] flex flex-col">
                  <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <Dialog.Title className="text-lg font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                      Nova Simulação
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="nomeCliente" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                            Nome do Cliente
                          </label>
                          <input
                            type="text"
                            name="nomeCliente"
                            id="nomeCliente"
                            required
                            value={formData.nomeCliente}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md bg-white/40 dark:bg-gray-700/40 border border-white/60 dark:border-gray-600/60 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label htmlFor="cpf" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                            CPF
                          </label>
                          <input
                            type="text"
                            name="cpf"
                            id="cpf"
                            required
                            value={formData.cpf}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md bg-white/40 dark:bg-gray-700/40 border border-white/60 dark:border-gray-600/60 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label htmlFor="consultor" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                            Consultor
                          </label>
                          <input
                            type="text"
                            name="consultor"
                            id="consultor"
                            required
                            value={formData.consultor}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md bg-white/40 dark:bg-gray-700/40 border border-white/60 dark:border-gray-600/60 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label htmlFor="valorEmprestimo" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                            Valor do Empréstimo
                          </label>
                          <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                              R$
                            </span>
                            <input
                              type="text"
                              name="valorEmprestimo"
                              id="valorEmprestimo"
                              required
                              value={formData.valorEmprestimo}
                              onChange={handleChange}
                              placeholder="0,00"
                              className="pl-8 block w-full rounded-md bg-white/40 dark:bg-gray-700/40 border border-white/60 dark:border-gray-600/60 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="taxaEntrada" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                            Taxa de Entrada (%)
                          </label>
                          <input
                            type="number"
                            name="taxaEntrada"
                            id="taxaEntrada"
                            required
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData.taxaEntrada}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md bg-white/40 dark:bg-gray-700/40 border border-white/60 dark:border-gray-600/60 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label htmlFor="numeroParcelas" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                            Número de Parcelas
                          </label>
                          <input
                            type="number"
                            name="numeroParcelas"
                            id="numeroParcelas"
                            required
                            min="1"
                            max="800"
                            value={formData.numeroParcelas}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md bg-white/40 dark:bg-gray-700/40 border border-white/60 dark:border-gray-600/60 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                          />
                        </div>
                      </div>
                      {formData.valorEmprestimo && formData.taxaEntrada && formData.numeroParcelas && (
                        <div className="rounded-lg bg-gradient-to-br from-white/40 to-white/20 dark:from-gray-800/40 dark:to-gray-800/20 p-6 backdrop-blur-sm shadow-xl">
                          <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-4">
                            Resultado da Simulação
                          </h3>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-3">
                                <div>
                                  <span className="text-sm text-gray-600 dark:text-gray-300">Valor do Empréstimo</span>
                                  <p className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                    R$ {formData.valorEmprestimo}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600 dark:text-gray-300">Taxa de Juros</span>
                                  <p className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                    {formData.taxaEntrada}%
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <span className="text-sm text-gray-600 dark:text-gray-300">Entrada</span>
                                  <p className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                    R$ {calcularEntrada()}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600 dark:text-gray-300">Parcelas</span>
                                  <p className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                    {formData.numeroParcelas}x de R$ {calcularValorParcelas()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-center gap-2">
                              <button
                                type="button"
                                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={handleVisualizarPDF}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                  <path d="M10 9H8" />
                                  <path d="M16 13H8" />
                                  <path d="M16 17H8" />
                                </svg>
                                Gerar PDF
                              </button>
                              <button
                                type="button"
                                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                onClick={adicionarSimulacao}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M5 12h14" />
                                  <path d="M12 5v14" />
                                </svg>
                                Adicionar à Lista
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {simulacoes.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Simulações Adicionadas:</h3>
                          <div className="space-y-2 mb-4">
                            {simulacoes.map((simulacao, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">Simulação {index + 1}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Valor: R$ {simulacao.valor_emprestimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Parcelas: {simulacao.numero_parcelas}x de R$ {simulacao.valor_parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                                <button
                                  onClick={() => removerSimulacao(index)}
                                  className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-center">
                            <button
                              type="button"
                              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onClick={() => {
                                setSelectedSimulacao(simulacoes);
                                setIsPDFModalOpen(true);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                <path d="M10 9H8" />
                                <path d="M16 13H8" />
                                <path d="M16 17H8" />
                              </svg>
                              Gerar PDF
                            </button>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>

        <Dialog
          open={isPDFModalOpen}
          onClose={() => setIsPDFModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-4xl h-[90vh] bg-gradient-to-b from-gray-900/70 to-gray-900/50 backdrop-blur-sm rounded-lg shadow-xl">
              <div className="h-full flex flex-col">
                <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                  <Dialog.Title className="text-lg font-medium text-white">
                    Visualizar Simulações
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={() => setIsPDFModalOpen(false)}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex-1 p-4">
                  {selectedSimulacao && (
                    <SimulacaoPDF simulacao={selectedSimulacao} />
                  )}
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}