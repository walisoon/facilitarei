'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      await signUp(email, password);
      setError('Conta criada com sucesso! Verifique seu email para confirmar o registro.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Erro no signup:', error);
      if (error.message?.includes('network')) {
        setError('Erro de conexão. Por favor, verifique sua internet e tente novamente.');
      } else if (error.message?.includes('already registered')) {
        setError('Este email já está registrado. Por favor, faça login.');
      } else if (error.message?.includes('invalid email')) {
        setError('Email inválido. Por favor, use um email válido.');
      } else if (error.message?.includes('password')) {
        setError('Senha muito fraca. Use pelo menos 6 caracteres.');
      } else {
        setError('Erro ao criar conta. Por favor, tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-orange-600">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-6 h-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.32031 11.6835C3.32031 16.6541 7.34975 20.6835 12.3203 20.6835C17.2909 20.6835 21.3203 16.6541 21.3203 11.6835C21.3203 6.71289 17.2909 2.68347 12.3203 2.68347C7.34975 2.68347 3.32031 6.71289 3.32031 11.6835ZM12.3203 5.24244C12.3203 4.96925 12.5471 4.74244 12.8203 4.74244C15.7999 4.74244 18.3861 6.69799 19.2608 9.48347H16.5649C16.3056 9.48347 16.0869 9.31474 16.0487 9.05903C15.8835 8.07571 15.2603 7.23519 14.4017 6.75684C14.2148 6.64599 14.1101 6.43815 14.1361 6.22363C14.162 6.00911 14.3143 5.82833 14.5249 5.76741C13.8679 5.41748 13.1167 5.21054 12.3203 5.18421V5.24244ZM19.5021 10.4835C19.5381 10.8797 19.5556 11.2799 19.5556 11.6835C19.5556 15.5666 16.8476 18.7752 13.2031 19.5308V16.9251C13.2031 16.6519 13.4299 16.4251 13.7031 16.4251C14.6867 16.4251 15.5981 16.0874 16.3071 15.5022C16.5005 15.3484 16.7726 15.3654 16.9462 15.5389L18.5641 17.1568C17.0124 18.7084 14.9445 19.6835 12.7031 19.6835C10.4616 19.6835 8.39372 18.7084 6.84201 17.1568L8.45993 15.5389C8.63348 15.3654 8.90559 15.3484 9.09899 15.5022C9.80801 16.0874 10.7194 16.4251 11.7031 16.4251C11.9762 16.4251 12.2031 16.6519 12.2031 16.9251V19.5308C8.55851 18.7752 5.85052 15.5666 5.85052 11.6835C5.85052 11.2799 5.868 10.8797 5.90399 10.4835H8.07532C8.33481 10.4835 8.55345 10.6522 8.59167 10.9079C8.75685 11.8912 9.38007 12.7317 10.2387 13.2101C10.4255 13.3209 10.5303 13.5288 10.5043 13.7433C10.4784 13.9578 10.3261 14.1386 10.1155 14.1995C10.7725 14.5494 11.5237 14.7564 12.3203 14.7827V14.7244C12.3203 14.4513 12.5471 14.2244 12.8203 14.2244C15.7999 14.2244 18.3861 12.269 19.2608 9.48347H19.5021V10.4835ZM7.84945 9.48347C7.59012 9.48347 7.37148 9.31474 7.33326 9.05903C7.16808 8.07571 6.54486 7.23519 5.68627 6.75684C5.49945 6.64599 5.39466 6.43815 5.42063 6.22363C5.44659 6.00911 5.59884 5.82833 5.80946 5.76741C6.46642 5.41748 7.21765 5.21054 8.01406 5.18421V5.24244C8.01406 5.51563 8.24086 5.74244 8.51406 5.74244C11.4937 5.74244 14.0799 7.69799 14.9546 10.4835H7.84945V9.48347Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold">Facilita Cred</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Criar Conta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`rounded-md p-4 ${error.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <div className="text-sm">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Criar Conta
            </button>
          </div>
          
          <div className="text-sm text-center">
            <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
              Já tem uma conta? Faça login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
