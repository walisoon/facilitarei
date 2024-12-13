'use client'

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SimulacoesAPI } from '@/lib/supabase';
import toast from 'react-hot-toast';

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
    consultor: '',
    filial: 'MATRIZ'
  });

  const router = useRouter();

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
        data_nascimento: formData.data_nascimento || null,
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
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 shadow-xl transition-all border border-gray-200/20 dark:border-gray-700/30">
                <Dialog.Title as="div" className="flex items-center justify-between border-b dark:border-gray-700 pb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Novo Crédito
                  </h3>
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </Dialog.Title>

                <form className="mt-4 space-y-6">
                  {/* Dados Pessoais */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Dados Pessoais</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <input
                        type="text"
                        name="nome"
                        placeholder="Nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="text"
                          name="cpf"
                          placeholder="CPF"
                          value={formData.cpf}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="rg"
                          placeholder="RG"
                          value={formData.rg}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="orgaoEmissor"
                          placeholder="Org. Em"
                          value={formData.orgaoEmissor}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="date"
                          name="data_nascimento"
                          placeholder="Data Nasc."
                          value={formData.data_nascimento}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="naturalidade"
                          placeholder="Naturalidade"
                          value={formData.naturalidade}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
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
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="conjuge"
                          placeholder="Cônjuge"
                          value={formData.conjuge}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                      </div>

                      <input
                        type="text"
                        name="filiacaoMaterna"
                        placeholder="Filiação Materna"
                        value={formData.filiacaoMaterna}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />

                      <input
                        type="text"
                        name="filiacaoPaterna"
                        placeholder="Filiação Paterna"
                        value={formData.filiacaoPaterna}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Endereço</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2">
                          <input
                            type="text"
                            name="endereco"
                            placeholder="Endereço"
                            value={formData.endereco}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                          />
                        </div>
                        <input
                          type="text"
                          name="numero"
                          placeholder="Nº"
                          value={formData.numero}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="bairro"
                          placeholder="Bairro"
                          value={formData.bairro}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="text"
                          name="complemento"
                          placeholder="Complemento"
                          value={formData.complemento}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="cep"
                          placeholder="CEP"
                          value={formData.cep}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="cidadeUF"
                          placeholder="Cidade/UF"
                          value={formData.cidadeUF}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Contato</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="tel"
                        name="telefone1"
                        placeholder="Telefone 01"
                        value={formData.telefone1}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <input
                        type="tel"
                        name="telefone2"
                        placeholder="Telefone 02"
                        value={formData.telefone2}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="E-mail"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                    </div>
                  </div>

                  {/* Profissão */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Profissão</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="profissao"
                          placeholder="Profissão"
                          value={formData.profissao}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="empresa"
                          placeholder="Empresa"
                          value={formData.empresa}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
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
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                            <span>Restrição:</span>
                            <input
                              type="checkbox"
                              name="restricao"
                              checked={formData.restricao}
                              onChange={handleInputChange}
                              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Bem */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Dados do Bem</h4>
                    <div className="space-y-4">
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                          <input
                            type="checkbox"
                            name="tipoBem.imovel"
                            checked={formData.tipoBem.imovel}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                          />
                          <span>IMÓVEL</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                          <input
                            type="checkbox"
                            name="tipoBem.auto"
                            checked={formData.tipoBem.auto}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                          />
                          <span>AUTO</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                          <input
                            type="checkbox"
                            name="tipoBem.pesados"
                            checked={formData.tipoBem.pesados}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
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
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="entrada"
                          placeholder="Entrada"
                          value={formData.entrada}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                            <span>Redução:</span>
                            <input
                              type="checkbox"
                              name="reducao"
                              checked={formData.reducao}
                              onChange={handleInputChange}
                              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            />
                          </label>
                          <input
                            type="text"
                            name="prazo"
                            placeholder="Prazo"
                            value={formData.prazo}
                            onChange={handleInputChange}
                            className="block w-24 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Consultor */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Dados do Consultor</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="consultor"
                        placeholder="Consultor"
                        value={formData.consultor}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <input
                        type="text"
                        name="filial"
                        placeholder="Filial"
                        value={formData.filial}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        console.log('Clique no botão simular detectado');
                        handleSimular(e);
                      }}
                      className="inline-flex justify-center rounded-md bg-green-600 dark:bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 dark:hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      Simular
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
