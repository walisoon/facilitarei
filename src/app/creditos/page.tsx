'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import toast from 'react-hot-toast';
import { CreditosAPI } from '@/lib/supabase';
import NovoCredito from '@/components/creditos/NovoCredito';
import { Plus, Search, FileText, Pencil, Trash2 } from 'lucide-react';
import { usePage } from '@/contexts/page-context';
import { jsPDF } from 'jspdf';
import type { jsPDF as JsPDF } from 'jspdf';
import { Credito } from '@/types/credito';

type Ficha = Credito;

export default function CreditosPage() {
  const { setTitle } = usePage();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<Ficha | undefined>();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleViewPDF = (ficha: Ficha) => {
    const doc = new jsPDF();

    // Função para desenhar título de seção
    const drawSectionTitle = (title: string, y: number) => {
      doc.setFillColor(240, 240, 240);
      doc.rect(10, y - 4, 190, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(title, 12, y);
      doc.setFont('helvetica', 'normal');
    };

    // Cabeçalho
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FICHA CADASTRAL', 105, 20, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Data
    const currentDate = new Date().toLocaleDateString('pt-BR');
    doc.text(`Data: ${currentDate}`, 10, 30);

    // Dados Pessoais
    drawSectionTitle('Dados Pessoais', 43);

    // Nome
    doc.text('Nome', 12, 50);
    doc.text(ficha.nome || '', 42, 50);
    
    // Número da Proposta (usando id em vez de numero_simulacao)
    doc.text('Nº Proposta', 122, 57);
    doc.text(ficha.id?.toString() || '', 152, 57);
    
    // RG e CPF
    doc.text('RG', 12, 64);
    doc.text(`${ficha.rg || ''} / Org.Em: ${ficha.orgao_emissor || ''}`, 42, 64);
    doc.text('CPF', 122, 64);
    doc.text(ficha.cpf || '', 152, 64);
    
    // Data de Nascimento e Naturalidade
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
    drawSectionTitle('Endereço', 99);
    
    doc.text('Endereço', 12, 106);
    doc.text(ficha.endereco || '', 42, 106);
    doc.text('Número', 122, 106);
    doc.text(ficha.numero || '', 152, 106);
    
    doc.text('Complemento', 12, 113);
    doc.text(ficha.complemento || '', 42, 113);
    doc.text('Bairro', 122, 113);
    doc.text(ficha.bairro || '', 152, 113);
    
    doc.text('CEP', 12, 120);
    doc.text(ficha.cep || '', 42, 120);
    doc.text('Cidade/UF', 122, 120);
    doc.text(ficha.cidade_uf || '', 152, 120);
    
    // Contato
    drawSectionTitle('Contato', 127);
    
    doc.text('Telefone 1', 12, 134);
    doc.text(ficha.telefone1 || '', 42, 134);
    doc.text('Telefone 2', 122, 134);
    doc.text(ficha.telefone2 || '', 152, 134);
    
    doc.text('E-mail', 12, 141);
    doc.text(ficha.email || '', 42, 141);
    
    // Profissional
    drawSectionTitle('Profissional', 148);
    
    doc.text('Profissão', 12, 155);
    doc.text(ficha.profissao || '', 42, 155);
    doc.text('Empresa', 122, 155);
    doc.text(ficha.empresa || '', 152, 155);
    
    // Renda
    doc.text('Renda Indiv.', 12, 162);
    doc.text(`R$ ${ficha.renda_individual?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`, 42, 162);
    doc.text('Restrição', 122, 162);
    doc.text(ficha.restricao ? 'Sim' : 'Não', 152, 162);
    
    // Dados do Bem
    drawSectionTitle('Dados do Bem', 169);
    
    doc.text('Tipo do Bem', 12, 176);
    doc.text(ficha.tipo_bem || '', 42, 176);
    doc.text('Valor do Bem', 122, 176);
    doc.text(`R$ ${ficha.valor_bem?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`, 152, 176);
    
    doc.text('Entrada', 12, 183);
    doc.text(`R$ ${ficha.valor_entrada?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`, 42, 183);
    doc.text('Prazo', 122, 183);
    doc.text(`${ficha.prazo || ''} meses`, 152, 183);
    
    // Consultor
    drawSectionTitle('Consultor', 190);
    
    doc.text('Nome', 12, 197);
    doc.text(ficha.consultor || '', 42, 197);
    doc.text('Filial', 122, 197);
    doc.text(ficha.filial || '', 152, 197);
    
    // Status
    drawSectionTitle('Status', 204);
    doc.text('Situação', 12, 211);
    doc.text(ficha.status || '', 42, 211);
    
    // Salvar o PDF
    doc.save(`ficha-${ficha.nome?.toLowerCase().replace(/\s+/g, '-')}.pdf`);
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
    setSelectedFicha(undefined);
    setIsModalOpen(true);
  };

  const handleEditar = (ficha: Ficha) => {
    setSelectedFicha(ficha);
    setIsModalOpen(true);
  };

  const handleExcluir = async (id: number | undefined) => {
    if (!id) return;

    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta ficha?');
    if (!confirmDelete) return;

    try {
      await CreditosAPI.excluir(id);
      loadFichas();
    } catch (error) {
      console.error('Erro ao excluir ficha:', error);
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
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
                    {ficha.valor_entrada && ficha.valor_bem ? 
                      ((ficha.valor_entrada / ficha.valor_bem) * 100).toFixed(2) + '%' : 
                      '0%'
                    }
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
        onClose={() => {
          setSelectedFicha(undefined);
          setIsModalOpen(false);
        }}
        onSuccess={() => {
          loadFichas();
          setIsModalOpen(false);
        }}
        creditoParaEditar={selectedFicha}
      />
    </div>
  );
}
