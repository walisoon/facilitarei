'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, FileText, Pencil, Trash2 } from 'lucide-react';
import { usePage } from '@/contexts/page-context';
import { jsPDF } from 'jspdf';
import type { GState } from 'jspdf';
import toast from 'react-hot-toast';
import { CreditosAPI } from '@/lib/supabase';
import { NovoCredito } from '@/components/creditos/NovoCredito';

interface Ficha {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  estado_civil: string;
  naturalidade: string;
  orgao_emissor?: string;
  numero_simulacao?: string;
  conjuge?: string;
  filiacao_materna?: string;
  filiacao_paterna?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade_uf?: string;
  telefone1?: string;
  telefone2?: string;
  email?: string;
  profissao?: string;
  empresa?: string;
  renda_individual?: number;
  restricao?: number;
  tipo_bem?: 'imovel' | 'auto' | 'pesados';
  valor_bem?: number;
  valor_entrada?: number;
  reducao?: number;
  prazo?: number;
  consultor?: string;
  filial?: string;
}

export default function CreditosPage() {
  const { setTitle } = usePage();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<Ficha | null>(null);

  const handleViewPDF = (ficha: Ficha) => {
    const doc = new jsPDF();
    const pageWidth: number = doc.internal.pageSize.width;
    
    // Adiciona logo e informações do cabeçalho
    doc.addImage('/images/logo.png', 'PNG', pageWidth - 50, 10, 40, 20);
    
    // Informações da empresa (lado esquerdo)
    doc.setFontSize(8);
    doc.text('FACILITA CRED - CORRESPONDENTE BANCÁRIO AUTORIZADO', 10, 15);
    doc.text('Rua das Pitangueiras, Nº 274 - Setor Comercial - MT', 10, 20);
    doc.text('Contato: (11) 5152-5823 ou (66) 9.9207-3183 - WWW.FACILITACREDSINOP.COM.BR', 10, 25);
    
    // Adicionar uma linha fina acima da data
    const dateLineY = 31; 
    doc.setDrawColor(0); 
    doc.setLineWidth(0.1); 
    doc.line(10, dateLineY, 200, dateLineY); 
    
    // Data
    doc.setFontSize(10);
    doc.text('Data', 12, 40);
    doc.text(new Date().toLocaleDateString('pt-BR'), 32, 40);
    
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
    doc.text(ficha.nome || '', 42, 57);
    
    // Número da Simulação
    doc.text('Nº Prosposta', 122, 57);
    doc.text(ficha.numero_simulacao || '', 152, 57);
    
    // RG e CPF
    doc.text('RG', 12, 64);
    doc.text(`${ficha.rg || ''} / Org.Em: ${ficha.orgao_emissor || ''}`, 42, 64);
    doc.text('CPF', 122, 64);
    doc.text(ficha.cpf || '', 152, 64);
    
    // Data Nasc. e Naturalidade
    doc.text('Data Nasc.', 12, 71);
    doc.text(ficha.data_nascimento || '', 42, 71);
    doc.text('Naturalidade', 122, 71);
    doc.text(ficha.naturalidade || '', 152, 71);
    
    // Estado Civil e Cônjuge
    doc.text('Estado Civil', 12, 78);
    doc.text(ficha.estado_civil || '', 42, 78);
    doc.text('Cônjuge', 122, 78);
    doc.text(ficha.conjuge || '', 152, 78);
    
    // Filiação
    doc.text('Filiação Materna', 12, 85);
    doc.text(ficha.filiacao_materna || '', 42, 85);
    
    doc.text('Filiação Paterna', 12, 92);
    doc.text(ficha.filiacao_paterna || '', 42, 92);
    
    // Endereço
    drawSectionTitle('Endereço', 94);
    
    doc.text('Endereço', 12, 106);
    doc.text(ficha.endereco || '', 42, 106);
    doc.text('Nº', 122, 106);
    doc.text(ficha.numero || '', 152, 106);
    
    // Complemento e Bairro
    doc.text('Complemento', 12, 113);
    doc.text(ficha.complemento || '', 42, 113);
    doc.text('Bairro', 122, 113);
    doc.text(ficha.bairro || '', 152, 113);
    
    // CEP e Cidade/UF
    doc.text('CEP', 12, 120);
    doc.text(ficha.cep || '', 42, 120);
    doc.text('Cidade/UF', 122, 120);
    doc.text(ficha.cidade_uf || '', 152, 120);
    
    // Contato
    drawSectionTitle('Contato', 122);
    
    // Telefones
    doc.text('Telefone 01', 12, 134);
    doc.text(ficha.telefone1 || '', 42, 134);
    doc.text('Telefone 02', 122, 134);
    doc.text(ficha.telefone2 || '', 152, 134);
    
    // Email
    doc.text('E-mail', 12, 141);
    doc.text(ficha.email || '', 42, 141);
    
    // Profissão
    drawSectionTitle('Profissão', 143);
    
    doc.text('Profissão', 12, 155);
    doc.text(ficha.profissao || '', 42, 155);
    doc.text('Empresa', 122, 155);
    doc.text(ficha.empresa || '', 152, 155);
    
    // Renda
    doc.text('Renda Indiv.', 12, 162);
    doc.text(ficha.renda_individual ? `R$ ${ficha.renda_individual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '', 42, 162);
    doc.text('Restrição', 122, 162);
    
    // Função para desenhar checkbox com visto
    const drawCheckbox = (x: number, y: number, checked: boolean) => {
      doc.setDrawColor(0);
      doc.rect(x, y, 3, 3);
      
      if (checked) {
        doc.setLineWidth(0.1);
        doc.line(x + 0.5, y + 1.5, x + 1.2, y + 2.2);
        doc.line(x + 1.2, y + 2.2, x + 2.5, y + 0.8);
      }
    };
    
    // Checkboxes para restrição
    drawCheckbox(152, 159, ficha.restricao === 1);
    doc.setFontSize(8);  
    doc.text('SIM', 156, 162);
    drawCheckbox(167, 159, ficha.restricao === 0);
    doc.text('NÃO', 171, 162);
    
    // Dados do Bem
    drawSectionTitle('Dados do Bem', 164);
    
    // Tipo do bem
    doc.text('Tipo do bem', 12, 176);
    
    // Checkboxes para tipo do bem
    drawCheckbox(42, 173, ficha.tipo_bem === 'imovel');
    doc.text('IMÓVEL', 46, 176);
    drawCheckbox(67, 173, ficha.tipo_bem === 'auto');
    doc.text('AUTO', 71, 176);
    drawCheckbox(92, 173, ficha.tipo_bem === 'pesados');
    doc.text('PESADOS', 96, 176);
    
    // Valor do bem
    doc.text('Valor do bem', 125, 176);
    doc.text(ficha.valor_bem ? `R$ ${ficha.valor_bem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '', 150, 176);
    
    // Entrada e Parcelas
    doc.text('Entrada', 12, 183);
    doc.text(ficha.valor_entrada ? `R$ ${ficha.valor_entrada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '', 42, 183);
    
    // Redução
    doc.text('Redução', 12, 190);
    
    // Checkboxes para redução
    drawCheckbox(42, 187, ficha.reducao === 1);
    doc.text('SIM', 46, 190);
    drawCheckbox(57, 187, ficha.reducao === 0);
    doc.text('NÃO', 61, 190);
    
    // Prazo
    doc.text('Prazo', 82, 190);
    doc.text(ficha.prazo?.toString() || '240', 102, 190);
    
    // Dados do Consultor
    drawSectionTitle('Dados do Consultor', 192);
    
    doc.text('Consultor', 12, 204);
    doc.text(ficha.consultor || '', 42, 204);
    doc.text('Filial', 122, 204);
    doc.text(ficha.filial || '', 152, 204);
    
    // Texto de autorização
    const texto: string = 'Autorizo o envio deste formulário para solicitação de vaga e análise cadastral para as condições a mim apresentadas. Sabendo que no caso de aprovação, se optar por não ' +
                  'dar continuidade no processo e nas condições aprovadas, poderei ficar restrito dentro do sistema de análise desta instituição durante o período de noventa dias, podendo ' +
                  'fazer outra oferta apenas após o periodo de restrição. Todas as propostas são fiscalizadas e autorizadas pelo BACEN e regulamentados pela Lei Federal 11.795/08.';
    
    const splitText: string[] = doc.splitTextToSize(texto, 180); 
    const textX: number = (pageWidth - doc.getTextWidth(splitText[0])) / 2; 

    splitText.forEach((line: string, index: number) => {
      doc.text(line, textX, 215 + (index * 5), { align: 'justify' }); 
    });
    
    // Linhas para assinatura
    doc.setDrawColor(200, 200, 200); 
    doc.setFontSize(10); 
    
    doc.line(10, 245, 90, 245);
    doc.text('Solicitante', 40, 250);
    
    doc.line(110, 245, 190, 245);
    doc.text('Consultor Responsável', 135, 250);

    // Aplicando marca d'água
    const img = new Image();
    img.src = '/images/watermark.png';
    img.onload = () => {
      const pageHeight: number = doc.internal.pageSize.height;
      const imgWidth: number = 170;
      const imgHeight: number = 125;
      const x: number = (pageWidth - imgWidth) / 2;
      const y: number = (pageHeight - imgHeight) / 2;

      doc.saveGraphicsState();
      const gState = new doc.GState({ opacity: 0.08 }) as GState;
      doc.setGState(gState);
      doc.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
      doc.restoreGraphicsState();

      // Salvar o PDF
      const nomeArquivo: string = ficha.nome ? 
        `${ficha.nome.toLowerCase().replace(/\s+/g, '-')}-ficha-cadastral.pdf` : 
        'ficha-cadastral.pdf';
      doc.save(nomeArquivo);
    };
  };

  const loadFichas = async () => {
    try {
      const { data, error } = await CreditosAPI.listar();
      if (error) throw error;
      setFichas(data || []);
    } catch (error) {
      console.error('Erro ao carregar fichas:', error);
      toast.error('Erro ao carregar fichas');
    }
  };

  useEffect(() => {
    setTitle('Créditos');
    loadFichas();
  }, [setTitle]);

  const handleNovoCadastro = () => {
    setSelectedFicha(null);
    setIsModalOpen(true);
  };

  const handleEditar = (ficha: Ficha) => {
    setSelectedFicha(ficha);
    setIsModalOpen(true);
  };

  const handleExcluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ficha?')) return;
    
    try {
      const { error } = await CreditosAPI.excluir(id);
      if (error) throw error;
      toast.success('Ficha excluída com sucesso!');
      loadFichas();
    } catch (error) {
      console.error('Erro ao excluir ficha:', error);
      toast.error('Erro ao excluir ficha');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fichas</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie todas as solicitações de ficha do sistema.</p>
        </div>
        <button
          onClick={handleNovoCadastro}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Ficha
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Buscar
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 dark:focus:ring-orange-500 sm:text-sm sm:leading-6 bg-white dark:bg-gray-700"
              placeholder="Buscar fichas..."
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Número de Parcelas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Taxa de Entrada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {fichas.map((ficha) => (
                <tr key={ficha.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {ficha.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {ficha.valor_bem?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {ficha.prazo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {((ficha.valor_entrada / ficha.valor_bem) * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {ficha.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewPDF(ficha)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditar(ficha)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleExcluir(ficha.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Nova Ficha */}
      <NovoCredito
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          loadFichas();
          setIsModalOpen(false);
        }}
        creditoParaEditar={selectedFicha}
      />
    </div>
  );
}
