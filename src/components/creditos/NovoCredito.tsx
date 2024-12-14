'use client'

import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SimulacoesAPI } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Simulacao } from '@/types/simulacao';
import { Combobox, Transition as HeadlessTransition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';

interface NovoCreditoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NovoCredito({ isOpen, onClose, onSuccess }: NovoCreditoProps) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    orgaoEmissor: '',
    data_nascimento: '',
    naturalidade: 'SORRISO - MT',
    estadoCivil: '',
    conjuge: '',
    filiacaoMaterna: '',
    filiacaoPaterna: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    cidadeUF: '',
    telefone1: '',
    telefone2: '',
    email: '',
    profissao: '',
    empresa: 'VIA BRASIL',
    rendaIndividual: '',
    rendaFamiliar: '',
    restricao: false,
    pontScore: '',
    tipoBem: {
      imovel: false,
      auto: false,
      pesados: false
    },
    valorBem: '',
    entrada: '',
    reducao: false,
    prazo: '',
    numeroSimulacao: '', 
    consultor: '',
    filial: 'MATRIZ'
  });

  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([]);
  const [selectedSimulacao, setSelectedSimulacao] = useState<Simulacao | null>(null);
  const [query, setQuery] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      loadSimulacoes();
    }
  }, [isOpen]);

  const loadSimulacoes = async () => {
    try {
      const { data, error } = await SimulacoesAPI.listar();
      if (error) throw error;
      setSimulacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar simulações:', error);
      toast.error('Erro ao carregar simulações');
    }
  };

  const handleSimulacaoSelect = (simulacao: Simulacao) => {
    setSelectedSimulacao(simulacao);
    setFormData(prev => ({
      ...prev,
      nome: simulacao.nome_cliente || '',
      cpf: simulacao.cpf || '',
      telefone1: simulacao.telefone || '',
      email: simulacao.email || '',
      tipoBem: {
        imovel: simulacao.tipo_bem === 'IMÓVEL',
        auto: simulacao.tipo_bem === 'AUTO',
        pesados: simulacao.tipo_bem === 'PESADOS'
      },
      valorBem: simulacao.valor_emprestimo?.toString() || '',
      entrada: simulacao.valor_entrada?.toString() || '',
      reducao: false,
      prazo: simulacao.numero_parcelas?.toString() || '',
      numeroSimulacao: simulacao.numero || '' 
    }));
  };

  const filteredSimulacoes = query === ''
    ? simulacoes
    : simulacoes.filter((simulacao) =>
        simulacao.nome_cliente?.toLowerCase().includes(query.toLowerCase()) ||
        simulacao.cpf?.includes(query)
      );

  const handleSimular = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Iniciando simulação...', formData);
    
    if (!formData.nome || !formData.cpf || !formData.consultor) {
      toast.error('Por favor, preencha os campos obrigatórios: Nome, CPF e Consultor');
      return;
    }

    try {
      // Prepare data for Supabase
      const simulacaoData = {
        nome_cliente: formData.nome,
        cpf: formData.cpf,
        consultor: formData.consultor,
        valor_emprestimo: formData.valorBem ? parseFloat(formData.valorBem.replace(/[^\d.,]/g, '').replace(',', '.')) : 0,
        valor_entrada: formData.entrada ? parseFloat(formData.entrada.replace(/[^\d.,]/g, '').replace(',', '.')) : 0,
        numero_parcelas: formData.prazo ? parseInt(formData.prazo) : 0,
        taxa_entrada: 0,
        valor_parcela: 0,
        status: 'Em Análise' as const,
        data_nascimento: formData.data_nascimento ? new Date(formData.data_nascimento) : undefined,
        telefone: formData.telefone1 || '',
        email: formData.email || '',
        tipo_bem: Object.entries(formData.tipoBem)
          .filter(([_, value]) => value)
          .map(([key]) => key.toUpperCase())
          .join(', ') || '',
        created_at: new Date().toISOString()
      };

      console.log('Dados formatados para envio:', simulacaoData);
      
      // Save to Supabase
      const { data, error } = await SimulacoesAPI.criar(simulacaoData);
      console.log('Resultado do Supabase:', { data, error });
      
      if (error) {
        throw error;
      }

      toast.success('Simulação salva com sucesso!');
      
      // Fechar o modal e redirecionar
      onClose();
      router.push('/creditos');
      
      // Chamar callback de sucesso se existir
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao salvar simulação:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar simulação');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name.startsWith('tipoBem.')) {
        const tipoBemKey = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          tipoBem: {
            ...prev.tipoBem,
            [tipoBemKey]: checkbox.checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checkbox.checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <HeadlessTransition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <HeadlessTransition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-[2px]" />
        </HeadlessTransition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <HeadlessTransition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white/30 dark:bg-gray-800/20 backdrop-blur-lg p-6 text-left align-middle shadow-xl transition-all border border-white/10 dark:border-gray-700/20">
                <Dialog.Title as="div" className="flex items-center justify-between border-b border-gray-200/20 dark:border-gray-700/20 pb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Novo Crédito
                  </h3>
                  <button
                    type="button"
                    className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </Dialog.Title>

                {/* Seção de Simulação */}
                <div className="mt-6 mb-6 bg-white/20 dark:bg-gray-700/10 backdrop-blur-sm p-4 rounded-lg border border-gray-200/20 dark:border-gray-600/20">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Importar Simulação</h4>
                  <Combobox value={selectedSimulacao} onChange={handleSimulacaoSelect}>
                    <div className="relative">
                      <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-700 text-left border border-gray-300 dark:border-gray-600 focus-within:border-orange-500 dark:focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-500 dark:focus-within:ring-orange-400">
                        <Combobox.Input
                          className="w-full border-none py-2.5 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white bg-transparent focus:ring-0"
                          displayValue={(simulacao: Simulacao) => simulacao?.nome_cliente || ''}
                          onChange={(event) => setQuery(event.target.value)}
                          placeholder="Buscar por nome ou CPF..."
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDown
                            className="h-5 w-5 text-gray-400 dark:text-gray-500"
                            aria-hidden="true"
                          />
                        </Combobox.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                      >
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black/5 dark:ring-white/5 focus:outline-none sm:text-sm">
                          {filteredSimulacoes.length === 0 && query !== '' ? (
                            <div className="relative cursor-default select-none px-4 py-2 text-gray-700 dark:text-gray-300">
                              Nenhuma simulação encontrada.
                            </div>
                          ) : (
                            filteredSimulacoes.map((simulacao) => (
                              <Combobox.Option
                                key={simulacao.id}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2.5 pl-10 pr-4 ${
                                    active ? 'bg-orange-500 text-white' : 'text-gray-900 dark:text-white'
                                  }`
                                }
                                value={simulacao}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? 'font-medium' : 'font-normal'
                                      }`}
                                    >
                                      {simulacao.nome_cliente} - CPF: {simulacao.cpf}
                                      <span className={`ml-2 text-xs ${active ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                        ({simulacao.numero}) - R$ {simulacao.valor_emprestimo?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </span>
                                    </span>
                                    {selected ? (
                                      <span
                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                          active ? 'text-white' : 'text-orange-500 dark:text-orange-400'
                                        }`}
                                      >
                                        <Check className="h-5 w-5" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Combobox.Option>
                            ))
                          )}
                        </Combobox.Options>
                      </Transition>
                    </div>
                  </Combobox>
                </div>

                <form className="mt-4 space-y-6">
                  {/* Dados Pessoais */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dados Pessoais</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <input
                        type="text"
                        name="nome"
                        placeholder="Nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="text"
                          name="cpf"
                          placeholder="CPF"
                          value={formData.cpf}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="rg"
                          placeholder="RG"
                          value={formData.rg}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="orgaoEmissor"
                          placeholder="Org. Em"
                          value={formData.orgaoEmissor}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="date"
                          name="data_nascimento"
                          placeholder="Data Nasc."
                          value={formData.data_nascimento}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="naturalidade"
                          placeholder="Naturalidade"
                          value={formData.naturalidade}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                          readOnly
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="estadoCivil"
                          placeholder="Estado Civil"
                          value={formData.estadoCivil}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="conjuge"
                          placeholder="Cônjuge"
                          value={formData.conjuge}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                      </div>

                      <input
                        type="text"
                        name="filiacaoMaterna"
                        placeholder="Filiação Materna"
                        value={formData.filiacaoMaterna}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />

                      <input
                        type="text"
                        name="filiacaoPaterna"
                        placeholder="Filiação Paterna"
                        value={formData.filiacaoPaterna}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Endereço</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2">
                          <input
                            type="text"
                            name="endereco"
                            placeholder="Endereço"
                            value={formData.endereco}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                          />
                        </div>
                        <input
                          type="text"
                          name="numero"
                          placeholder="Nº"
                          value={formData.numero}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="bairro"
                          placeholder="Bairro"
                          value={formData.bairro}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="text"
                          name="complemento"
                          placeholder="Complemento"
                          value={formData.complemento}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="cep"
                          placeholder="CEP"
                          value={formData.cep}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="cidadeUF"
                          placeholder="Cidade/UF"
                          value={formData.cidadeUF}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Contato</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="tel"
                        name="telefone1"
                        placeholder="Telefone 01"
                        value={formData.telefone1}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <input
                        type="tel"
                        name="telefone2"
                        placeholder="Telefone 02"
                        value={formData.telefone2}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="E-mail"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                    </div>
                  </div>

                  {/* Profissão */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Profissão</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="profissao"
                          placeholder="Profissão"
                          value={formData.profissao}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="empresa"
                          placeholder="Empresa"
                          value={formData.empresa}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                          readOnly
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="rendaIndividual"
                          placeholder="Renda Indiv."
                          value={formData.rendaIndividual}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span>Restrição:</span>
                            <input
                              type="checkbox"
                              name="restricao"
                              checked={formData.restricao}
                              onChange={handleInputChange}
                              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Bem */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Dados do Bem</h4>
                      {formData.numeroSimulacao && (
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-md">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Simulação:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{formData.numeroSimulacao}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {/* Tipo do Bem */}
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            name="tipoBem.imovel"
                            checked={formData.tipoBem.imovel}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                          />
                          <span>IMÓVEL</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            name="tipoBem.auto"
                            checked={formData.tipoBem.auto}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                          />
                          <span>AUTO</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            name="tipoBem.pesados"
                            checked={formData.tipoBem.pesados}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                          />
                          <span>PESADOS</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="text"
                          name="valorBem"
                          placeholder="Valor do bem"
                          value={formData.valorBem}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="entrada"
                          placeholder="Entrada"
                          value={formData.entrada}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span>Redução:</span>
                            <input
                              type="checkbox"
                              name="reducao"
                              checked={formData.reducao}
                              onChange={handleInputChange}
                              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            />
                          </label>
                          <input
                            type="text"
                            name="prazo"
                            placeholder="Prazo"
                            value={formData.prazo}
                            onChange={handleInputChange}
                            className="block w-24 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Consultor */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dados do Consultor</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="consultor"
                        placeholder="Consultor"
                        value={formData.consultor}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <input
                        type="text"
                        name="filial"
                        placeholder="Filial"
                        value={formData.filial}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        console.log('Clique no botão salvar detectado');
                        handleSimular(e);
                      }}
                      className="inline-flex justify-center rounded-md bg-orange-500 dark:bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 dark:hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:ring-offset-2"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </HeadlessTransition.Child>
          </div>
        </div>
      </Dialog>
    </HeadlessTransition>
  );
}
