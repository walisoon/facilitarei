'use client'

import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Combobox, Transition as HeadlessTransition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { Credito } from '@/types/credito';
import { jsPDF } from 'jspdf';

interface NovoCreditoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  creditoParaEditar?: Credito;
}

interface FormData {
  nome: string;
  cpf: string;
  rg: string;
  orgao_emissor: string;
  data_nascimento: string;
  naturalidade: string;
  estado_civil: string;
  conjuge: string;
  filiacao_materna: string;
  filiacao_paterna: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  cidade_uf: string;
  telefone1: string;
  telefone2: string;
  email: string;
  profissao: string;
  empresa: string;
  renda_individual: string;
  renda_familiar: string;
  pont_score: string;
  tipo_bem: string;
  valor_bem: string;
  valor_entrada: string;
  prazo: string;
  reducao: boolean;
  consultor: string;
  filial: string;
  status: "Aprovada" | "Em Análise" | "Reprovada";
  restricao: boolean;
  documentos: Array<{ nome: string; url: string; }>;
}

const initialFormData: FormData = {
  nome: '',
  cpf: '',
  rg: '',
  orgao_emissor: '',
  data_nascimento: '',
  naturalidade: '',
  estado_civil: '',
  conjuge: '',
  filiacao_materna: '',
  filiacao_paterna: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cep: '',
  cidade_uf: '',
  telefone1: '',
  telefone2: '',
  email: '',
  profissao: '',
  empresa: '',
  renda_individual: '',
  renda_familiar: '',
  pont_score: '',
  tipo_bem: '',
  valor_bem: '',
  valor_entrada: '',
  prazo: '',
  reducao: false,
  consultor: '',
  filial: '',
  status: 'Em Análise',
  restricao: false,
  documentos: []
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function NovoCredito({ isOpen, onClose, onSuccess, creditoParaEditar }: NovoCreditoProps) {
  // Função para pegar a data atual formatada YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [simulacoes, setSimulacoes] = useState<Credito[]>([]);
  const [selectedSimulacao, setSelectedSimulacao] = useState<Credito | null>(null);
  const [query, setQuery] = useState('');
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Carregar dados quando estiver editando
  useEffect(() => {
    if (creditoParaEditar) {
      setFormData({
        ...formData,
        ...creditoParaEditar,
        data_nascimento: getCurrentDate(), // Sempre usa a data atual
        valor_bem: creditoParaEditar.valor_bem?.toString() || '',
        valor_entrada: creditoParaEditar.valor_entrada?.toString() || '',
        prazo: creditoParaEditar.prazo?.toString() || '240',
        renda_individual: creditoParaEditar.renda_individual?.toString() || '',
        renda_familiar: creditoParaEditar.renda_familiar?.toString() || '',
        pont_score: creditoParaEditar.pont_score?.toString() || '',
        orgao_emissor: creditoParaEditar.orgao_emissor || '',
        cidade_uf: creditoParaEditar.cidade_uf || ''
      });
    }
  }, [creditoParaEditar]);

  const router = useRouter();

  const loadSimulacoes = async () => {
    try {
      console.log('Carregando simulações...');
      const { data, error } = await supabase
        .from('simulacoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar simulações:', error);
        throw error;
      }

      console.log('Simulações carregadas:', data); // Log para verificar os dados retornados
      setSimulacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar simulações:', error);
      toast.error('Erro ao carregar simulações');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSimulacoes();
    } else {
      setSimulacoes([]);
      setSelectedSimulacao(null);
      setQuery('');
    }
  }, [isOpen]);

  const filterSimulacoes = (simulacoes: Credito[], query: string) => {
    if (!query) return simulacoes;
    return simulacoes.filter((simulacao) => {
      const searchStr = query.toLowerCase();
      return (
        simulacao.nome?.toLowerCase().includes(searchStr) ||
        simulacao.cpf?.includes(searchStr)
      );
    });
  };

  const filteredSimulacoes = filterSimulacoes(simulacoes, query);

  console.log('Simulações filtradas:', filteredSimulacoes);

  const handleSimulacaoSelect = (simulacao: Credito) => {
    setSelectedSimulacao(simulacao);
    setFormData(prev => ({
      ...prev,
      // Dados pessoais
      nome: simulacao.nome || '',
      cpf: simulacao.cpf || '',
      data_nascimento: getCurrentDate(), // Sempre usa a data atual
      telefone1: simulacao.telefone1 || '',
      telefone2: simulacao.telefone2 || '',
      email: simulacao.email || '',
      
      // Dados profissionais
      profissao: simulacao.profissao || '',
      empresa: simulacao.empresa || '',
      renda_individual: simulacao.renda_individual?.toString() || '',
      
      // Dados do bem
      tipo_bem: simulacao.tipo_bem || '',
      valor_bem: simulacao.valor_bem?.toString() || '',
      valor_entrada: simulacao.valor_entrada?.toString() || '',
      prazo: simulacao.prazo?.toString() || '',
      
      // Status
      status: simulacao.status || 'Em análise',
      
      // Outros campos mantêm os valores padrão
      rg: '',
      orgao_emissor: '',
      naturalidade: '',
      estado_civil: '',
      conjuge: '',
      filiacao_materna: '',
      filiacao_paterna: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cep: '',
      cidade_uf: '',
      restricao: false,
      consultor: '',
      filial: ''
    }));
    
    // Mostrar mensagem de sucesso
    toast.success('Dados da simulação carregados com sucesso!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validar campos obrigatórios
      const requiredFields = [
        'nome',
        'cpf',
        'data_nascimento',
        'telefone1',
        'email',
        'profissao',
        'empresa',
        'renda_individual',
        'tipo_bem',
        'valor_bem',
        'valor_entrada',
        'prazo'
      ] as const;

      const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
      console.log('Campos faltando:', missingFields);
      
      if (missingFields.length > 0) {
        toast.error(`Por favor, preencha os campos obrigatórios: ${missingFields.join(', ')}`);
        return;
      }

      // Converter campos numéricos
      const numericFields = {
        renda_individual: parseFloat(formData.renda_individual.replace(/[^\d,]/g, '').replace(',', '.')),
        renda_familiar: parseFloat(formData.renda_familiar.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        pont_score: parseFloat(formData.pont_score) || 0,
        valor_bem: parseFloat(formData.valor_bem.replace(/[^\d,]/g, '').replace(',', '.')),
        valor_entrada: parseFloat(formData.valor_entrada.replace(/[^\d,]/g, '').replace(',', '.')),
        prazo: parseInt(formData.prazo)
      };

      // Validar campos numéricos obrigatórios
      const requiredNumericFields = ['renda_individual', 'valor_bem', 'valor_entrada', 'prazo'];
      for (const field of requiredNumericFields) {
        const value = numericFields[field as keyof typeof numericFields];
        if (isNaN(value)) {
          toast.error(`O campo ${field} deve ser um número válido`);
          return;
        }
      }

      // Pegar o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      // Criar objeto com os dados convertidos
      const data: Credito = {
        ...formData,
        ...numericFields,
        restricao: Boolean(formData.restricao),
        user_id: user.id
      };

      if (creditoParaEditar) {
        // Atualizar ficha existente
        const result = await supabase.from('creditos').update({ ...data }).eq('id', creditoParaEditar.id);
        const { data: resultData, error } = result;
        console.log('Resposta da API:', { data: resultData, error });
        
        if (error) {
          throw error;
        }

        toast.success('Ficha atualizada com sucesso!');
      } else {
        // Criar nova ficha
        const result = await supabase.from('creditos').insert({ ...data });
        const { data: resultData, error } = result;
        console.log('Resposta da API:', { data: resultData, error });
        
        if (error) {
          throw error;
        }

        toast.success('Ficha criada com sucesso!');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar ficha:', error);
      toast.error('Erro ao salvar ficha');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      // Se for um campo de valor monetário, formata o valor
      if (name === 'valor_bem' || name === 'valor_entrada') {
        setFormData(prev => ({
          ...prev,
          [name]: formatCurrency(value)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Pegar o usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Erro ao pegar usuário:', userError);
      toast.error('Erro ao enviar documentos');
      return;
    }
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    const validFiles = Array.from(files).filter(file => {
      const isValid = file.size <= MAX_FILE_SIZE;
      if (!isValid) {
        toast.error(`Arquivo ${file.name} é muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      }
      return isValid;
    });

    if (validFiles.length === 0) return;

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documentos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documentos')
          .getPublicUrl(filePath);

        return {
          nome: file.name,
          url: publicUrl
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      setFormData(prev => ({
        ...prev,
        documentos: [...prev.documentos, ...uploadedFiles]
      }));

      toast.success('Documentos enviados com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar documentos:', error);
      toast.error('Erro ao enviar documentos');
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documentos: prev.documentos.filter((_, i) => i !== index)
    }));
  };

  const handleViewPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Configurações de estilo
      const titleFontSize = 16;
      const headerFontSize = 12;
      const textFontSize = 10;
      const lineHeight = 7;
      let y = 20;

      // Título
      doc.setFontSize(titleFontSize);
      doc.text('Ficha de Crédito', pageWidth / 2, y, { align: 'center' });
      y += lineHeight * 2;

      // Dados pessoais
      doc.setFontSize(headerFontSize);
      doc.text('Dados Pessoais', 20, y);
      y += lineHeight;

      doc.setFontSize(textFontSize);
      doc.text(`Nome: ${formData.nome}`, 20, y); y += lineHeight;
      doc.text(`CPF: ${formData.cpf}`, 20, y); y += lineHeight;
      doc.text(`RG: ${formData.rg}`, 20, y); y += lineHeight;
      doc.text(`Data de Nascimento: ${formData.data_nascimento}`, 20, y); y += lineHeight;
      doc.text(`Estado Civil: ${formData.estado_civil}`, 20, y); y += lineHeight;
      y += lineHeight;

      // Contato
      doc.setFontSize(headerFontSize);
      doc.text('Contato', 20, y);
      y += lineHeight;

      doc.setFontSize(textFontSize);
      doc.text(`Telefone: ${formData.telefone1}`, 20, y); y += lineHeight;
      doc.text(`Email: ${formData.email}`, 20, y); y += lineHeight;
      doc.text(`Endereço: ${formData.endereco}, ${formData.numero}`, 20, y); y += lineHeight;
      doc.text(`Bairro: ${formData.bairro}`, 20, y); y += lineHeight;
      doc.text(`CEP: ${formData.cep}`, 20, y); y += lineHeight;
      doc.text(`Cidade/UF: ${formData.cidade_uf}`, 20, y); y += lineHeight;
      y += lineHeight;

      // Dados profissionais
      doc.setFontSize(headerFontSize);
      doc.text('Dados Profissionais', 20, y);
      y += lineHeight;

      doc.setFontSize(textFontSize);
      doc.text(`Profissão: ${formData.profissao}`, 20, y); y += lineHeight;
      doc.text(`Empresa: ${formData.empresa}`, 20, y); y += lineHeight;
      doc.text(`Renda Individual: R$ ${formData.renda_individual}`, 20, y); y += lineHeight;
      y += lineHeight;

      // Dados do bem
      doc.setFontSize(headerFontSize);
      doc.text('Dados do Bem', 20, y);
      y += lineHeight;

      doc.setFontSize(textFontSize);
      doc.text(`Tipo do Bem: ${formData.tipo_bem}`, 20, y); y += lineHeight;
      doc.text(`Valor do Bem: R$ ${formData.valor_bem}`, 20, y); y += lineHeight;
      doc.text(`Valor de Entrada: R$ ${formData.valor_entrada}`, 20, y); y += lineHeight;
      doc.text(`Prazo: ${formData.prazo} meses`, 20, y); y += lineHeight;
      y += lineHeight;

      // Status
      doc.setFontSize(headerFontSize);
      doc.text('Status', 20, y);
      y += lineHeight;

      doc.setFontSize(textFontSize);
      doc.text(`Status: ${formData.status}`, 20, y); y += lineHeight;
      doc.text(`Restrição: ${formData.restricao ? 'Sim' : 'Não'}`, 20, y); y += lineHeight;
      doc.text(`Consultor: ${formData.consultor}`, 20, y); y += lineHeight;
      doc.text(`Filial: ${formData.filial}`, 20, y);

      // Salvar o PDF
      doc.save(`ficha-${formData.nome}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  const calcularParcela = () => {
    if (!formData.valor_bem || !formData.valor_entrada || !formData.prazo) return '0,00';
    const valorFinanciado = parseFloat(formData.valor_bem.replace(/\D/g, '')) - parseFloat(formData.valor_entrada.replace(/\D/g, ''));
    const parcela = valorFinanciado / parseInt(formData.prazo);
    return parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatCurrency = (value: string) => {
    // Remove R$, espaços, pontos e qualquer caractere que não seja número ou vírgula
    let number = value.replace(/[R$\s.]/g, '').replace(',', '.');
    
    // Se não houver números, retorna vazio
    if (number === '') {
      return '';
    }
    
    // Converte para número
    const amount = parseFloat(number);
    
    // Formata com R$, pontos e vírgulas
    return `R$ ${amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
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

                <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                  {/* Seletor de Simulação */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Selecionar Simulação
                    </label>
                    <Combobox value={selectedSimulacao} onChange={handleSimulacaoSelect}>
                      <div className="relative mt-1">
                        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left border border-gray-300 dark:border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                          <Combobox.Input
                            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-gray-100 bg-transparent focus:ring-0"
                            displayValue={(simulacao: Credito | null) => 
                              simulacao ? `${simulacao.nome} - ${simulacao.numero || ''}` : ''
                            }
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Digite para buscar uma simulação..."
                          />
                          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown
                              className="h-5 w-5 text-gray-400"
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
                          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                            {filteredSimulacoes.length === 0 ? (
                              <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                                {query === '' ? 'Nenhuma simulação disponível.' : 'Nenhuma simulação encontrada.'}
                              </div>
                            ) : (
                              filteredSimulacoes.map((simulacao) => (
                                <Combobox.Option
                                  key={simulacao.id}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                      active ? 'bg-orange-500 text-white' : 'text-gray-900 dark:text-gray-100'
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
                                        {simulacao.nome} - {simulacao.numero || ''} 
                                        <span className="ml-2 text-sm opacity-75">
                                          (R$ {simulacao.valor_bem?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                                        </span>
                                      </span>
                                      {selected ? (
                                        <span
                                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                            active ? 'text-white' : 'text-orange-600'
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
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="text"
                          name="cpf"
                          placeholder="CPF"
                          value={formData.cpf}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="rg"
                          placeholder="RG"
                          value={formData.rg}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="orgao_emissor"
                          placeholder="Org. Em"
                          value={formData.orgao_emissor}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="date"
                          name="data_nascimento"
                          placeholder="Data Nasc."
                          value={formData.data_nascimento}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="naturalidade"
                          placeholder="Naturalidade"
                          value={formData.naturalidade}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="estado_civil"
                          placeholder="Estado Civil"
                          value={formData.estado_civil}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="conjuge"
                          placeholder="Cônjuge"
                          value={formData.conjuge}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                      </div>

                      <input
                        type="text"
                        name="filiacao_materna"
                        placeholder="Filiação Materna"
                        value={formData.filiacao_materna}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />

                      <input
                        type="text"
                        name="filiacao_paterna"
                        placeholder="Filiação Paterna"
                        value={formData.filiacao_paterna}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
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
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                          />
                        </div>
                        <input
                          type="text"
                          name="numero"
                          placeholder="Nº"
                          value={formData.numero}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="bairro"
                          placeholder="Bairro"
                          value={formData.bairro}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="text"
                          name="complemento"
                          placeholder="Complemento"
                          value={formData.complemento}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="cep"
                          placeholder="CEP"
                          value={formData.cep}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="cidade_uf"
                          placeholder="Cidade/UF"
                          value={formData.cidade_uf}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
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
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <input
                        type="tel"
                        name="telefone2"
                        placeholder="Telefone 02"
                        value={formData.telefone2}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="E-mail"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                    </div>
                  </div>

                  {/* Profissão */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Profissão</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        name="profissao"
                        placeholder="Profissão"
                        value={formData.profissao}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <input
                        type="text"
                        name="empresa"
                        placeholder="Empresa"
                        value={formData.empresa}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <input
                        type="text"
                        name="renda_individual"
                        placeholder="Renda Individual"
                        value={formData.renda_individual}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <input
                        type="text"
                        name="renda_familiar"
                        placeholder="Renda Familiar"
                        value={formData.renda_familiar}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <input
                        type="text"
                        name="pont_score"
                        placeholder="Pont. Score"
                        value={formData.pont_score}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            name="restricao"
                            checked={formData.restricao}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-orange-600 dark:text-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400"
                          />
                          <span>Restrição</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Bem */}
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">Dados do Bem</h4>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Tipo do Bem */}
                      <div className="flex justify-start gap-8">
                        {/* <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
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
                        </label> */}
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-[800px]">
                        <input
                          type="text"
                          name="valor_bem"
                          placeholder="R$ 0,00"
                          value={formData.valor_bem}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="valor_entrada"
                          placeholder="R$ 0,00"
                          value={formData.valor_entrada}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span>Redução:</span>
                          <input
                            type="checkbox"
                            name="reducao"
                            checked={formData.reducao}
                            onChange={handleInputChange}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-orange-600 dark:text-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400"
                          />
                        </label>
                        <input
                          type="text"
                          name="prazo"
                          placeholder="Prazo"
                          value={formData.prazo}
                          onChange={handleInputChange}
                          className="block w-24 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dados do Consultor */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dados do Consultor</h4>
                    <div className="grid grid-cols-2 gap-4 w-[800px]">
                      <input
                        type="text"
                        name="consultor"
                        placeholder="Consultor"
                        value={formData.consultor}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <input
                        type="text"
                        name="filial"
                        placeholder="Filial"
                        value={formData.filial}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                    </div>
                  </div>

                  {/* Documentos */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Documentos</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-white/50 dark:bg-gray-700/30 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PDF ou Imagens (JPG, PNG, GIF, etc)</p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={handleFileUpload}
                            accept=".pdf,image/*"
                            multiple
                          />
                        </label>
                      </div>

                      {/* Lista de documentos */}
                      {formData.documentos.length > 0 && (
                        <div className="space-y-2">
                          {formData.documentos.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{doc.nome}</span>
                              </div>
                              <button
                                onClick={() => removeDocument(index)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                              >
                                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => handleViewPDF()}
                      className="inline-flex justify-center rounded-md border border-transparent bg-orange-100 px-4 py-2 text-sm font-medium text-orange-900 hover:bg-orange-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    >
                      Visualizar PDF
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
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
