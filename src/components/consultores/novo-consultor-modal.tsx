'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "@/styles/datepicker-custom.css";
import { ptBR } from 'date-fns/locale';

interface NovoConsultorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovoConsultorModal({ isOpen, onClose }: NovoConsultorModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cargo: '',
    status: 'Ativo',
    dataAdmissao: new Date(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria a lógica para salvar o consultor
    console.log('Novo consultor:', formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, dataAdmissao: date || new Date() }));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Backdrop com blur */}
      <div className="fixed inset-0 bg-gradient-to-br from-white/10 via-black/20 to-black/30 backdrop-blur-[2px]" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-xl w-full rounded-xl bg-gradient-to-br from-white/60 to-white/40 dark:from-gray-800/60 dark:to-gray-800/40 backdrop-blur-xl backdrop-saturate-150 border border-white/30 dark:border-gray-700/30 p-6 shadow-2xl ring-1 ring-black/5 dark:ring-white/5">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              Novo Consultor
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Nome
              </label>
              <input
                type="text"
                name="nome"
                id="nome"
                required
                value={formData.nome}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-white/40 dark:bg-gray-700/40 border border-white/60 dark:border-gray-600/60 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-white/40 dark:bg-gray-700/40 border border-white/60 dark:border-gray-600/60 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="cargo" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Cargo
              </label>
              <input
                type="text"
                name="cargo"
                id="cargo"
                required
                value={formData.cargo}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-white/40 dark:bg-gray-700/40 border border-white/60 dark:border-gray-600/60 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Status
              </label>
              <select
                name="status"
                id="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-white/40 dark:bg-gray-700/40 border border-white/60 dark:border-gray-600/60 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white backdrop-blur-sm transition-all duration-200"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>

            <div>
              <label htmlFor="dataAdmissao" className="block text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Data de Admissão
              </label>
              <DatePicker
                selected={formData.dataAdmissao}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                locale={ptBR}
                className="mt-1 block w-full rounded-md bg-white/40 dark:bg-gray-700/40 border border-white/60 dark:border-gray-600/60 shadow-sm focus:border-indigo-500 dark:focus:border-orange-500 focus:ring-indigo-500 dark:focus:ring-orange-500 sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                calendarClassName="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-white/60 dark:border-gray-600/60 bg-white/40 dark:bg-gray-700/40 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-orange-500 focus:ring-offset-2 backdrop-blur-sm transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-gradient-to-r from-indigo-600/90 to-indigo-500/90 dark:from-orange-500/90 dark:to-orange-400/90 px-4 py-2 text-sm font-medium text-white hover:from-indigo-500/90 hover:to-indigo-400/90 dark:hover:from-orange-400/90 dark:hover:to-orange-300/90 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-orange-500 focus:ring-offset-2 backdrop-blur-sm transition-all duration-200 shadow-lg shadow-indigo-500/20 dark:shadow-orange-500/20"
              >
                Salvar
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
