'use client';

import { useState, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, FileText } from 'lucide-react';
import { SimulacaoPDF } from './simulacao-pdf';
import { SimulacoesAPI } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { tabelaCredito } from '@/data/tabelaCredito';
import { SimulacaoStatus, Simulacao } from '@/types/simulacao';

interface NovaSimulacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NovaSimulacaoModal({ isOpen, onClose, onSuccess }: NovaSimulacaoModalProps) {
  const [formData, setFormData] = useState({
    nomeCliente: '',
    cpf: '',
    consultor: '',
    valorSelecionado: 0,
    dataNascimento: '',
    telefone: '',
    email: '',
    tipoBem: ''
  });

  const [selectedValue, setSelectedValue] = useState<number>(0);
  const valorSelecionado = tabelaCredito.find(item => item.credito === selectedValue);

  const [loading, setLoading] = useState(false);
  const [savingSimulacao, setSavingSimulacao] = useState(false);
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([]);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [selectedSimulacao, setSelectedSimulacao] = useState<Simulacao | null>(null);

  const validarCPF = (cpf: string) => {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;

    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
  };

  const formatarCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'valorSelecionado') {
      const numeroValue = Number(value);
      setSelectedValue(numeroValue);
      setFormData(prev => ({
        ...prev,
        valorSelecionado: numeroValue
      }));
    } else if (name === 'cpf') {
      const formattedCPF = formatarCPF(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedCPF
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Selected Value:', selectedValue);
      console.log('Form Data antes do submit:', formData);
      const dadosCredito = tabelaCredito.find(item => item.credito === selectedValue);
      
      if (!dadosCredito) {
        toast.error('Por favor, selecione um valor de crédito válido');
        setSavingSimulacao(false);
        return;
      }

      setSavingSimulacao(true);
      
      // Validações
      if (!formData.nomeCliente || !formData.cpf || !formData.consultor) {
        toast.error('Por favor, preencha os campos obrigatórios: Nome, CPF e Consultor');
        setSavingSimulacao(false);
        return;
      }

      // Validação específica do CPF
      if (!validarCPF(formData.cpf)) {
        toast.error('CPF inválido. Por favor, verifique.');
        setSavingSimulacao(false);
        return;
      }

      const novaSimulacao = {
        nome_cliente: formData.nomeCliente.trim(),
        cpf: formData.cpf.replace(/\D/g, ''),
        consultor: formData.consultor.trim(),
        valor_emprestimo: Number(dadosCredito.credito),
        valor_entrada: Number(dadosCredito.entrada),
        numero_parcelas: 240, // Fixo em 240 parcelas
        taxa_entrada: Number(((dadosCredito.entrada / dadosCredito.credito) * 100).toFixed(2)),
        valor_parcela: Number(dadosCredito.parcela),
        status: 'Em Análise' as SimulacaoStatus,
        data_nascimento: formData.dataNascimento ? new Date(formData.dataNascimento) : undefined,
        telefone: formData.telefone?.trim(),
        email: formData.email?.trim(),
        tipo_bem: formData.tipoBem?.trim()
      };

      console.log('Dados formatados para envio:', novaSimulacao);
      console.log('Tipos dos campos numéricos:', {
        valor_emprestimo: typeof novaSimulacao.valor_emprestimo,
        valor_entrada: typeof novaSimulacao.valor_entrada,
        numero_parcelas: typeof novaSimulacao.numero_parcelas,
        taxa_entrada: typeof novaSimulacao.taxa_entrada,
        valor_parcela: typeof novaSimulacao.valor_parcela
      });
      
      // Salva no Supabase
      const { data, error } = await SimulacoesAPI.criar(novaSimulacao);
      
      if (error) {
        console.error('Erro detalhado:', error);
        toast.error('Erro ao salvar a simulação');
        setSavingSimulacao(false);
        return;
      }

      console.log('Simulação salva com sucesso:', data);
      
      // Limpa o formulário
      setFormData({
        nomeCliente: '',
        cpf: '',
        consultor: '',
        valorSelecionado: 0,
        dataNascimento: '',
        telefone: '',
        email: '',
        tipoBem: ''
      });
      
      // Fecha o modal e notifica sucesso
      toast.success('Simulação criada com sucesso!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar simulação:', error);
      toast.error('Erro ao salvar simulação');
    } finally {
      setSavingSimulacao(false);
    }
  };

  const gerarNumeroSimulacao = () => {
    const ano = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-4); // Últimos 4 dígitos do timestamp
    const numeroAleatorio = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `SIM-${ano}-${timestamp}${numeroAleatorio}`;
  };

  const adicionarSimulacao = async () => {
    if (!formData.nomeCliente || !formData.valorSelecionado) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const dadosCredito = tabelaCredito.find(item => item.credito === selectedValue);
    
    if (!dadosCredito) {
      toast.error('Valor de crédito inválido');
      return;
    }

    const novaSimulacao = {
      numero: await gerarNumeroSimulacao(),
      nome_cliente: formData.nomeCliente,
      cpf: formData.cpf,
      consultor: formData.consultor,
      valor_emprestimo: dadosCredito.credito,
      taxa_entrada: valorSelecionado?.credito && valorSelecionado?.entrada 
        ? Number(((valorSelecionado.entrada / valorSelecionado.credito) * 100).toFixed(2))
        : 0,
      numero_parcelas: 240, // Alterado para exibir 240 parcelas
      valor_entrada: dadosCredito.entrada,
      valor_parcela: dadosCredito.parcela,
      status: 'Em Análise' as SimulacaoStatus
    };

    setSimulacoes([...simulacoes, novaSimulacao]);
    toast.success('Simulação adicionada à lista!');
    
    // Limpar apenas os campos de valor, mantendo os dados do cliente
    setFormData(prev => ({
      ...prev,
      valorSelecionado: 0,
    }));
  };

  const salvarTodasSimulacoes = async () => {
    if (!formData.nomeCliente || !formData.valorSelecionado) {
      // Se houver uma simulação em andamento, adiciona à lista primeiro
      if (formData.nomeCliente && formData.valorSelecionado) {
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
            status: 'Em Análise' as SimulacaoStatus, // Garante que o status está correto
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
          valorSelecionado: 0,
          dataNascimento: '',
          telefone: '',
          email: '',
          tipoBem: ''
        });
        
        onClose();
        onSuccess?.(); // Call onSuccess callback if provided
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
    if (!valorSelecionado?.credito || !valorSelecionado?.entrada || !valorSelecionado?.parcela) {
      return;
    }

    const simulacaoAtual = {
      numero: gerarNumeroSimulacao(),
      nome_cliente: formData.nomeCliente,
      cpf: formData.cpf,
      consultor: formData.consultor,
      valor_emprestimo: valorSelecionado.credito,
      taxa_entrada: Number(((valorSelecionado.entrada / valorSelecionado.credito) * 100).toFixed(2)),
      numero_parcelas: 240,
      valor_entrada: valorSelecionado.entrada,
      valor_parcela: valorSelecionado.parcela,
      status: 'Em Análise' as SimulacaoStatus
    };

    setSelectedSimulacao(simulacaoAtual);
    setIsPDFModalOpen(true);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 text-left align-middle shadow-xl transition-all">
              <div className="flex flex-col h-[90vh]">
                <div className="flex justify-between items-center px-4 py-3 border-b border-white/20 dark:border-gray-700/20 bg-white/5 dark:bg-gray-800/5 backdrop-blur-md">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                    Nova Simulação
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-white/5 dark:bg-gray-800/5 backdrop-blur-md">
                  <form className="space-y-6 p-4">
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
                          className="mt-1 block w-full rounded-md bg-white/10 dark:bg-gray-700/10 border border-white/20 dark:border-gray-600/20 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
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
                          className="mt-1 block w-full rounded-md bg-white/10 dark:bg-gray-700/10 border border-white/20 dark:border-gray-600/20 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
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
                          className="mt-1 block w-full rounded-md bg-white/10 dark:bg-gray-700/10 border border-white/20 dark:border-gray-600/20 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label htmlFor="dataNascimento" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                          Data de Nascimento
                        </label>
                        <input
                          type="date"
                          name="dataNascimento"
                          id="dataNascimento"
                          value={formData.dataNascimento}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md bg-white/10 dark:bg-gray-700/10 border border-white/20 dark:border-gray-600/20 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label htmlFor="telefone" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                          Telefone
                        </label>
                        <input
                          type="text"
                          name="telefone"
                          id="telefone"
                          value={formData.telefone}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md bg-white/10 dark:bg-gray-700/10 border border-white/20 dark:border-gray-600/20 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                          E-mail
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md bg-white/10 dark:bg-gray-700/10 border border-white/20 dark:border-gray-600/20 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label htmlFor="tipoBem" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                          Tipo de Bem
                        </label>
                        <input
                          type="text"
                          name="tipoBem"
                          id="tipoBem"
                          value={formData.tipoBem}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md bg-white/10 dark:bg-gray-700/10 border border-white/20 dark:border-gray-600/20 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label htmlFor="valorSelecionado" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                          Valor do Crédito
                        </label>
                        <select
                          id="valorSelecionado"
                          name="valorSelecionado"
                          required
                          value={formData.valorSelecionado}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md bg-white/10 dark:bg-gray-700/10 border border-white/20 dark:border-gray-600/20 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                        >
                          <option value="">Selecione um valor de crédito</option>
                          {tabelaCredito.map(item => (
                            <option key={item.credito} value={item.credito}>{item.credito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {formData.valorSelecionado && (
                      <div className="rounded-lg bg-gradient-to-br from-white/40 to-white/20 dark:from-gray-800/40 dark:to-gray-800/20 p-6 backdrop-blur-sm shadow-xl">
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-4">
                          Resultado da Simulação
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-3">
                              <div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">Valor do Bem</span>
                                <p className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                  R$ {valorSelecionado?.credito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">Entrada</span>
                                <p className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                  R$ {valorSelecionado?.entrada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">Parcelas</span>
                                <p className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                  240x de R$ {valorSelecionado?.parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">Taxa de Entrada</span>
                                <p className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                  {valorSelecionado?.credito && valorSelecionado?.entrada 
                                    ? Number(((valorSelecionado.entrada / valorSelecionado.credito) * 100).toFixed(2))
                                    : 0}%
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onClick={() => {
                                setIsPDFModalOpen(true);
                              }}
                            >
                              <FileText className="h-4 w-4" />
                              Visualizar PDF
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
                      <div className="mt-8 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Simulações Adicionadas:
                        </h3>
                        <div className="space-y-3">
                          {simulacoes.map((simulacao, index) => (
                            <div
                              key={index}
                              className="relative bg-white dark:bg-gray-700/50 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600/50 backdrop-blur-sm"
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <h4 className="text-base font-medium text-gray-900 dark:text-white">
                                    Simulação {index + 1}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Valor: <span className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulacao.valor_emprestimo)}</span>
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Parcelas: <span className="font-medium">{simulacao.numero_parcelas}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulacao.valor_parcela)}</span>
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removerSimulacao(index)}
                                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center pt-4">
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => {
                              setIsPDFModalOpen(true);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Visualizar PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>

                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={savingSimulacao}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("Botão salvar clicado");
                      if (simulacoes.length > 0) {
                        salvarTodasSimulacoes();
                      } else {
                        handleSubmit();
                      }
                    }}
                    disabled={savingSimulacao}
                    className="inline-flex w-full justify-center items-center rounded-md bg-orange-600 dark:bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 dark:hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 dark:focus-visible:outline-orange-500 disabled:opacity-50"
                  >
                    {savingSimulacao ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      'Salvar Simulação'
                    )}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>

      {/* Modal do PDF */}
      <Transition appear show={isPDFModalOpen} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-[9999]" 
          onClose={() => setIsPDFModalOpen(false)}
          static
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-4xl h-[90vh] bg-gradient-to-b from-gray-900/70 to-gray-900/50 backdrop-blur-sm rounded-lg shadow-xl">
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
                  <Dialog.Title className="text-lg font-medium text-white">
                    Visualizar PDF
                  </Dialog.Title>
                  <button
                    onClick={() => setIsPDFModalOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <SimulacaoPDF
                  simulacoes={simulacoes.length > 0 ? simulacoes : valorSelecionado ? [{
                    numero: '',
                    nome_cliente: formData.nomeCliente,
                    cpf: formData.cpf,
                    consultor: formData.consultor,
                    valor_emprestimo: valorSelecionado.credito,
                    valor_entrada: valorSelecionado.entrada,
                    valor_parcela: valorSelecionado.parcela,
                    numero_parcelas: 240,
                    taxa_entrada: valorSelecionado?.credito && valorSelecionado?.entrada 
                      ? Number(((valorSelecionado.entrada / valorSelecionado.credito) * 100).toFixed(2))
                      : 0,
                    status: 'Em Análise' as SimulacaoStatus
                  }] : []}
                  dadosCliente={{
                    nome_cliente: formData.nomeCliente,
                    cpf: formData.cpf,
                    consultor: formData.consultor
                  }}
                />
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}