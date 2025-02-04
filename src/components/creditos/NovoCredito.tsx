'use client'

import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CreditosAPI from '@/api/creditos';
import toast from 'react-hot-toast';
import { Combobox, Transition as HeadlessTransition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Simulacao } from '@/types/simulacao';

interface NovoCreditoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  creditoParaEditar?: any;
}

export function NovoCredito({ isOpen, onClose, onSuccess, creditoParaEditar }: NovoCreditoProps) {
  // Função para pegar a data atual formatada YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([]);
  const [selectedSimulacao, setSelectedSimulacao] = useState<Simulacao | null>(null);
  const [query, setQuery] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    orgaoEmissor: '',
    data_nascimento: getCurrentDate(),
    naturalidade: '',
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
    empresa: '',
    rendaIndividual: '',
    rendaFamiliar: '',
    pontScore: '',
    tipoBem: {
      imovel: false,
      auto: false,
      pesados: false
    },
    valorBem: '',
    entrada: '',
    reducao: false,
    prazo: '240',
    consultor: '',
    filial: '',
    documentos: [] as File[],
    numeroSimulacao: '',
    restricao: false
  });

  // Carregar dados quando estiver editando
  useEffect(() => {
    if (creditoParaEditar) {
      setFormData({
        ...formData,
        ...creditoParaEditar,
        tipoBem: {
          imovel: creditoParaEditar.tipo_bem === 'imovel',
          auto: creditoParaEditar.tipo_bem === 'auto',
          pesados: creditoParaEditar.tipo_bem === 'pesados'
        },
        data_nascimento: getCurrentDate(), // Sempre usa a data atual
        valorBem: creditoParaEditar.valor_bem?.toString() || '',
        entrada: creditoParaEditar.valor_entrada?.toString() || '',
        prazo: creditoParaEditar.prazo?.toString() || '240',
        rendaIndividual: creditoParaEditar.renda_individual?.toString() || '',
        rendaFamiliar: creditoParaEditar.renda_familiar?.toString() || '',
        pontScore: creditoParaEditar.pont_score?.toString() || '',
        orgaoEmissor: creditoParaEditar.orgao_emissor || '',
        cidadeUF: creditoParaEditar.cidade_uf || ''
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

  const filteredSimulacoes = query === ''
    ? simulacoes
    : simulacoes.filter((simulacao) => {
        const searchStr = query.toLowerCase();
        return (
          simulacao.nome_cliente?.toLowerCase().includes(searchStr) ||
          simulacao.cpf?.includes(searchStr) ||
          simulacao.numero?.toLowerCase().includes(searchStr)
        );
      });

  console.log('Simulações filtradas:', filteredSimulacoes);

  const handleSimulacaoSelect = (simulacao: Simulacao) => {
    setSelectedSimulacao(simulacao);
    setFormData(prev => ({
      ...prev,
      // Dados pessoais
      nome: simulacao.nome_cliente || '',
      cpf: simulacao.cpf || '',
      data_nascimento: getCurrentDate(), // Sempre usa a data atual
      telefone1: simulacao.telefone || '',
      email: simulacao.email || '',

      // Dados do financiamento
      valorBem: simulacao.valor_emprestimo?.toString() || '',
      entrada: simulacao.valor_entrada?.toString() || '',
      prazo: simulacao.numero_parcelas?.toString() || '240',
      numeroSimulacao: simulacao.numero || '',
      consultor: simulacao.consultor || '',

      // Tipo do bem
      tipoBem: {
        imovel: simulacao.tipo_bem?.toLowerCase() === 'imovel',
        auto: simulacao.tipo_bem?.toLowerCase() === 'auto',
        pesados: simulacao.tipo_bem?.toLowerCase() === 'pesados'
      }
    }));

    // Mostrar mensagem de sucesso
    toast.success('Dados da simulação carregados com sucesso!');
  };

  const handleSubmit = async () => {
    try {
      console.log('Iniciando submit...', formData);
      console.log('Tipo dos campos:', {
        valorBem: typeof formData.valorBem,
        entrada: typeof formData.entrada,
        prazo: typeof formData.prazo,
        rendaIndividual: typeof formData.rendaIndividual,
        rendaFamiliar: typeof formData.rendaFamiliar,
        pontScore: typeof formData.pontScore,
        reducao: typeof formData.reducao,
        restricao: typeof formData.restricao
      });

      // Validar apenas campos básicos da simulação
      const requiredFields = [
        'nome',
        'cpf'
      ];

      const missingFields = requiredFields.filter(field => !formData[field]);
      console.log('Campos faltando:', missingFields);
      
      if (missingFields.length > 0) {
        toast.error(`Por favor, preencha todos os campos obrigatórios: ${missingFields.join(', ')}`);
        return;
      }

      // Validar se pelo menos um tipo de bem foi selecionado
      if (!formData.tipoBem.imovel && !formData.tipoBem.auto && !formData.tipoBem.pesados) {
        toast.error('Por favor, selecione o tipo do bem');
        return;
      }

      console.log('Tentando salvar ficha...');
      let result;
      
      if (creditoParaEditar) {
        // Atualizar ficha existente
        result = await CreditosAPI.atualizar(creditoParaEditar.id, formData);
      } else {
        // Criar nova ficha
        result = await CreditosAPI.criar(formData);
      }

      const { data, error } = result;
      console.log('Resposta da API:', { data, error });
      
      if (error) {
        throw error;
      }

      toast.success(creditoParaEditar ? 'Ficha atualizada com sucesso!' : 'Ficha criada com sucesso!');
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
      // Se for um campo de valor monetário, formata o valor
      if (name === 'valorBem' || name === 'entrada') {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValid = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValid) {
        toast.error(`Arquivo ${file.name} não suportado. Apenas PDF e imagens são permitidos.`);
      }
      return isValid;
    });

    setFormData(prev => ({
      ...prev,
      documentos: [...prev.documentos, ...validFiles]
    }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documentos: prev.documentos.filter((_, i) => i !== index)
    }));
  };

  const handleViewPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Continuar a geração do PDF após a imagem ser carregada
    // Adiciona logo e informações do cabeçalho
    doc.addImage('/logo.png', 'PNG', pageWidth - 50, 10, 40, 20);
    
    // Informações da empresa (lado esquerdo)
    doc.setFontSize(8);
    doc.text('FACILITA CRED - CORRESPONDENTE BANCÁRIO AUTORIZADO', 10, 15);
    doc.text('Rua das Pitangueiras, Nº 274 - Setor Comercial - MT', 10, 20);
    doc.text('Contato: (11) 5152-5823 ou (66) 9.9207-3183 - WWW.FACILITACREDSINOP.COM.BR', 10, 25);
    
    // Adicionar uma linha fina acima da data
    const dateLineY = 31; 
    doc.setDrawColor(0); 
    doc.setLineWidth(0.1); 
    // Desenha a linha
    doc.line(10, dateLineY, 200, dateLineY); 
    
    // Data
    doc.setFontSize(10);
    doc.text('Data', 12, 40);
    doc.text(new Date().toLocaleDateString('pt-BR'), 32, 40);
    
    // Ajustar a posição vertical da data e do restante do conteúdo
    const dateY = 45; 
    
    // Função para desenhar título de seção
    const drawSectionTitle = (title: string, y: number) => {
      doc.setDrawColor(255, 230, 210); 
      doc.rect(10, y, pageWidth - 20, 7);
      doc.setFillColor(255, 236, 217);
      doc.rect(10, y, pageWidth - 20, 7, 'F');
      doc.text(title, 12, y + 5);
    };
    
    // Dados Pessoais
    drawSectionTitle('Dados Pessoais', 45);
    
    // Nome e CPF
    doc.text('Nome', 12, 57);
    doc.text(formData.nome || '', 42, 57);
    
    // Número da Simulação
    doc.text('Nº Prosposta', 122, 57);
    doc.text(formData.numeroSimulacao || '', 152, 57);
    
    // RG e CPF
    doc.text('RG', 12, 64);
    doc.text(`${formData.rg || ''} / Org.Em: ${formData.orgaoEmissor || ''}`, 42, 64);
    doc.text('CPF', 122, 64);
    doc.text(formData.cpf || '', 152, 64);
    
    // Data Nasc. e Naturalidade
    doc.text('Data Nasc.', 12, 71);
    doc.text(formData.data_nascimento || '', 42, 71);
    doc.text('Naturalidade', 122, 71);
    doc.text(formData.naturalidade || '', 152, 71);
    
    // Estado Civil e Cônjuge
    doc.text('Estado Civil', 12, 78);
    doc.text(formData.estadoCivil || '', 42, 78);
    doc.text('Cônjuge', 122, 78);
    doc.text(formData.conjuge || '', 152, 78);
    
    // Filiação
    doc.text('Filiação Materna', 12, 85);
    doc.text(formData.filiacaoMaterna || '', 42, 85);
    
    doc.text('Filiação Paterna', 12, 92);
    doc.text(formData.filiacaoPaterna || '', 42, 92);
    
    // Endereço
    drawSectionTitle('Endereço', 94);
    
    doc.text('Endereço', 12, 106);
    doc.text(formData.endereco || '', 42, 106);
    doc.text('Nº', 122, 106);
    doc.text(formData.numero || '', 152, 106);
    
    // Complemento e Bairro
    doc.text('Complemento', 12, 113);
    doc.text(formData.complemento || '', 42, 113);
    doc.text('Bairro', 122, 113);
    doc.text(formData.bairro || '', 152, 113);
    
    // CEP e Cidade/UF
    doc.text('CEP', 12, 120);
    doc.text(formData.cep || '', 42, 120);
    doc.text('Cidade/UF', 122, 120);
    doc.text(formData.cidadeUF || '', 152, 120);
    
    // Contato
    drawSectionTitle('Contato', 122);
    
    // Telefones
    doc.text('Telefone 01', 12, 134);
    doc.text(formData.telefone1 || '', 42, 134);
    doc.text('Telefone 02', 122, 134);
    doc.text(formData.telefone2 || '', 152, 134);
    
    // Email
    doc.text('E-mail', 12, 141);
    doc.text(formData.email || '', 42, 141);
    
    // Profissão
    drawSectionTitle('Profissão', 143);
    
    doc.text('Profissão', 12, 155);
    doc.text(formData.profissao || '', 42, 155);
    doc.text('Empresa', 122, 155);
    doc.text(formData.empresa || '', 152, 155);
    
    // Renda
    doc.text('Renda Indiv.', 12, 162);
    doc.text(formData.rendaIndividual ? `R$ ${formData.rendaIndividual.replace('.', ',')}` : '', 42, 162);
    doc.text('Restrição', 122, 162);
    
    // Função para desenhar checkbox com visto
    const drawCheckbox = (x: number, y: number, checked: boolean) => {
      // Salva a cor atual
      const currentDrawColor = doc.getDrawColor();
      
      // Define preto para a caixa
      doc.setDrawColor(0);
      doc.rect(x, y, 3, 3);
      
      if (checked) {
        // Desenha um V usando linhas pretas
        doc.setLineWidth(0.1);
        doc.line(x + 0.5, y + 1.5, x + 1.2, y + 2.2);
        doc.line(x + 1.2, y + 2.2, x + 2.5, y + 0.8);
      }
      
      // Restaura a cor original
      doc.setDrawColor(currentDrawColor);
    };
    
    // Checkboxes para restrição
    drawCheckbox(152, 159, formData.restricao);
    doc.setFontSize(8);  
    doc.text('SIM', 156, 162);
    drawCheckbox(167, 159, !formData.restricao);
    doc.text('NÃO', 171, 162);
    
    // Dados do Bem
    drawSectionTitle('Dados do Bem', 164);
    
    // Tipo do bem
    doc.text('Tipo do bem', 12, 176);
    
    // Valor da Parcela
    const valorParcelaFormatado = formatCurrency(formData.prazo);
    // Mover a exibição do valor da parcela para uma posição mais baixa
    const novaPosicaoY = 190; 
    // Ajustar a posição do texto 'Valor da Parcela' para o lado direito
    const posicaoTextoX = 122; 
    doc.text('Valor da Parcela', posicaoTextoX, novaPosicaoY); 
    // Ajustar a posição do valor da parcela para o lado direito
    const posicaoX = 152; 
    doc.text(valorParcelaFormatado, posicaoX, novaPosicaoY);
    
    // Checkboxes para tipo do bem
    drawCheckbox(42, 173, formData.tipoBem?.imovel);
    doc.text('IMÓVEL', 46, 176);
    drawCheckbox(67, 173, formData.tipoBem?.auto);
    doc.text('AUTO', 71, 176);
    drawCheckbox(92, 173, formData.tipoBem?.pesados);
    doc.text('PESADOS', 96, 176);
    
    // Ajustar a posição do valor 'R$ 500.000,00' para afastá-lo do texto 'Valor do Bem'
    doc.text('Valor do bem', 125, 176);
    doc.text(formData.valorBem ? formatCurrency(formData.valorBem) : '', 150, 176);
    
    // Entrada e Parcelas
    doc.text('Entrada', 12, 183);
    doc.text(formData.entrada ? formatCurrency(formData.entrada) : '', 42, 183);
    // Remover a exibição duplicada do valor da parcela
    // doc.text(formData.prazo || '', 152, 183);
    
    // Redução
    doc.text('Redução', 12, 190);
    
    // Checkboxes para redução
    drawCheckbox(42, 187, formData.reducao);
    doc.text('SIM', 46, 190);
    drawCheckbox(57, 187, !formData.reducao);
    doc.text('NÃO', 61, 190);
    
    // Definir o prazo como 240 ao exibir no PDF
    doc.text('Prazo', 82, 190);
    doc.text('240', 102, 190);
    
    // Dados do Consultor
    drawSectionTitle('Dados do Consultor', 192);
    
    doc.text('Consultor', 12, 204);
    doc.text(formData.consultor || '', 42, 204);
    doc.text('Filial', 122, 204);
    doc.text(formData.filial || '', 152, 204);
    
    // Texto de autorização
    doc.setFontSize(5);
    doc.setTextColor(80); 
    
    // Adicionar uma linha fina acima do termo
    const lineY = 210; 
    doc.setDrawColor(0); 
    doc.setLineWidth(0.1); 
    // Desenha a linha
    doc.line(10, lineY, 200, lineY); 
    
    // Centralizar o texto
    const texto = 'Autorizo o envio deste formulário para solicitação de vaga e análise cadastral para as condições a mim apresentadas. Sabendo que no caso de aprovação, se optar por não ' +
                  'dar continuidade no processo e nas condições aprovadas, poderei ficar restrito dentro do sistema de análise desta instituição durante o período de noventa dias, podendo ' +
                  'fazer outra oferta apenas após o periodo de restrição. Todas as propostas são fiscalizadas e autorizadas pelo BACEN e regulamentados pela Lei Federal 11.795/08.';
    
    // Quebrar o texto em linhas
    const splitText = doc.splitTextToSize(texto, 180); 
    const textX = (pageWidth - doc.getTextWidth(splitText[0])) / 2; 

    // Adiciona o texto quebrado
    splitText.forEach((line, index) => {
      doc.text(line, textX, 215 + (index * 5), { align: 'justify' }); 
    });
    
    // Linhas para assinatura
    doc.setDrawColor(200, 200, 200); 
    doc.setFontSize(10); 
    
    doc.line(10, 245, 90, 245);
    doc.text('Solicitante', 40, 250);
    
    doc.line(110, 245, 190, 245);
    doc.text('Consultor Responsável', 135, 250);

    // Aplicando marca d'água por cima de todo o conteúdo
    const img = new Image();
    img.src = '/images/watermark.png';
    img.onload = () => {
      // Calculando posição central com proporções ajustadas
      const pageHeight = doc.internal.pageSize.height;
      const imgWidth = 170;
      const imgHeight = 125;
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.08 }));
      doc.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
      doc.restoreGraphicsState();

      // Salvar o PDF com o nome do cliente
      const nomeArquivo = formData.nome ? 
        `${formData.nome.toLowerCase().replace(/\s+/g, '-')}-ficha-cadastral.pdf` : 
        'ficha-cadastral.pdf';
      doc.save(nomeArquivo);
    };
  };

  const calcularParcela = () => {
    if (!formData.valorBem || !formData.entrada || !formData.prazo) return '0,00';
    const valorFinanciado = parseFloat(formData.valorBem.replace(/\D/g, '')) - parseFloat(formData.entrada.replace(/\D/g, ''));
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

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="mt-4 space-y-6">
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
                            displayValue={(simulacao: Simulacao | null) => 
                              simulacao ? `${simulacao.nome_cliente} - ${simulacao.numero || ''}` : ''
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
                                        {simulacao.nome_cliente} - {simulacao.numero || ''} 
                                        <span className="ml-2 text-sm opacity-75">
                                          (R$ {simulacao.valor_emprestimo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
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
                          name="orgaoEmissor"
                          placeholder="Org. Em"
                          value={formData.orgaoEmissor}
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
                          name="estadoCivil"
                          placeholder="Estado Civil"
                          value={formData.estadoCivil}
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
                        name="filiacaoMaterna"
                        placeholder="Filiação Materna"
                        value={formData.filiacaoMaterna}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />

                      <input
                        type="text"
                        name="filiacaoPaterna"
                        placeholder="Filiação Paterna"
                        value={formData.filiacaoPaterna}
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
                          name="cidadeUF"
                          placeholder="Cidade/UF"
                          value={formData.cidadeUF}
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
                        name="rendaIndividual"
                        placeholder="Renda Individual"
                        value={formData.rendaIndividual}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <input
                        type="text"
                        name="rendaFamiliar"
                        placeholder="Renda Familiar"
                        value={formData.rendaFamiliar}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <input
                        type="text"
                        name="pontScore"
                        placeholder="Pont. Score"
                        value={formData.pontScore}
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

                      <div className="grid grid-cols-2 gap-4 w-[800px]">
                        <input
                          type="text"
                          name="valorBem"
                          placeholder="R$ 0,00"
                          value={formData.valorBem}
                          onChange={handleInputChange}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                        />
                        <input
                          type="text"
                          name="entrada"
                          placeholder="R$ 0,00"
                          value={formData.entrada}
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
                            onChange={handleFileChange}
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
                                <span className="text-sm text-gray-700 dark:text-gray-300">{doc.name}</span>
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
