// selo-fiea-frontend/src/pages/AvailableBadgesPage.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ShieldAlert } from 'lucide-react';
import type { Badge } from './BadgesPage';
import badgeIcon from '/badge.jpg';

// --- Dados Mocados (Simulando API) ---
const MOCKED_BADGES: Badge[] = [
  { 
    id: 1, 
    name: 'Selo FIEA de Excelência', 
    description: 'Concedido a empresas com excelência em gestão, sustentabilidade ambiental e inovação tecnológica.',
    validadeMeses: 12,
    dataInicioEmissao: new Date('2023-01-01'),
    dataFimEmissao: new Date('2023-12-31'),
    icon: badgeIcon 
  },
];

export function AvailableBadgesPage() {
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);

  useEffect(() => {
    // ! Substituir com chamada real à API para buscar selos disponíveis
    setAvailableBadges(MOCKED_BADGES);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <Link to="/industry/dashboard" className="text-sm font-semibold text-blue-600 hover:underline">← Voltar para o Portal</Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Selos Disponíveis para Inscrição</h1>
          <p className="text-gray-600 mt-1">Inicie o processo de autoavaliação para conquistar um novo selo.</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {availableBadges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableBadges.map(badge => (
              <div key={badge.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-100 flex flex-col">
                <div className="flex items-center mb-4">
                  <img src={badge.icon} alt={badge.name} className="h-16 w-16 rounded-full mr-4 border-2 border-gray-200" />
                  <h2 className="text-xl font-bold text-gray-800">{badge.name}</h2>
                </div>
                <p className="text-gray-600 flex-grow mb-6">{badge.description}</p>
                <Link to={`/industry/assessment/${badge.id}`} className="w-full text-center bg-blue-700 text-white font-bold py-3 px-5 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center mt-auto">
                  <PlusCircle size={20} className="mr-2" />
                  Iniciar Autoavaliação
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <ShieldAlert size={48} className="mx-auto text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold text-gray-700">Nenhum selo disponível no momento</h3>
            <p className="mt-1 text-gray-500">Por favor, verifique novamente mais tarde.</p>
          </div>
        )}
      </main>
    </div>
  );
}