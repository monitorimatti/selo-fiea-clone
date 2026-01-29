// selo-fiea-frontend/src/pages/IndustryDashboardPage.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, Edit, Building, Award, BadgeCheck, Plus } from 'lucide-react';

// --- Tipos de Dados ---
interface SelfAssessment {
  id: string;
  badgeId: number;
  badgeName: string;
  status: 'draft' | 'submitted';
  progress: number;
}

const MOCKED_ASSESSMENTS: SelfAssessment[] = [
  { id: 'draft_1', badgeId: 1, badgeName: 'Selo FIEA de Excelência', status: 'draft', progress: 50 },
];

export function IndustryDashboardPage() {
  const [myAssessments, setMyAssessments] = useState<SelfAssessment[]>([]);

  useEffect(() => {
    setMyAssessments(MOCKED_ASSESSMENTS);
  }, []);

  const drafts = myAssessments.filter(a => a.status === 'draft');
  const submitted = myAssessments.filter(a => a.status === 'submitted');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Portal da Indústria</h1>
          <Link to="/login" className="text-sm font-semibold text-blue-600 hover:underline">Sair</Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-gray-700 mb-6">Bem-vindo, Gestor da Indústria!</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">

          {/* 1. Card de Empresas (Modificado para Ação de Cadastro) */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-100 flex flex-col items-start h-full relative">
            <div className="flex items-center mb-6">
              <div className="bg-indigo-100 text-indigo-700 p-2 rounded-full mr-4">
                <Building size={38} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Empresas</h3>
            </div>
            <p className="text-gray-600 mb-6">Gerencie suas empresas ou cadastre novas unidades para certificação.</p>
            
            <div className="mt-auto w-full flex flex-col space-y-2">
              <Link to="/industry/dashboard/empresas" className="text-blue-600 font-semibold hover:underline">
                Ver Minhas Empresas →
              </Link>
              <Link 
                to="/industry/dashboard/nova-empresa" 
                className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <Plus size={16} className="mr-2" />
                Cadastrar Nova Empresa
              </Link>
            </div>
          </div>

          {/* 2. Card de Selos Conquistados */}
          <Link to="/industry/dashboard/selos" className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-100 flex flex-col items-start h-full">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 text-green-500 p-2 rounded-full mr-4">
                <BadgeCheck size={38} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Selos Conquistados</h3>
            </div>
            <p className="text-gray-600 mb-6">Visualize os selos de reconhecimento FIEA conquistados.</p>
            <span className="font-semibold text-blue-600 mt-auto">Acessar →</span>
          </Link>

          {/* 3. Card de Selos Disponíveis */}
          <Link to="/industry/dashboard/selos-disponiveis" className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-100 flex flex-col items-start h-full">
            <div className="flex items-center mb-6">
              <div className="bg-yellow-100 text-yellow-500 p-2 rounded-full mr-4">
                <Award size={38} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Selos Disponíveis</h3>
            </div>
            <p className="text-gray-600 mb-6">Veja os selos disponíveis para inscrição e inicie um novo processo.</p>
            <span className="font-semibold text-blue-600 mt-auto">Acessar →</span>
          </Link>

          {/* 4. Card de Minhas Autoavaliações */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Minhas Autoavaliações</h3>
            {drafts.length === 0 && submitted.length === 0 ? (
              <div className="text-center py-8 text-gray-500 flex-grow flex flex-col justify-center items-center">
                <FileText size={40} className="mx-auto mb-2" />
                <p>Nenhuma autoavaliação iniciada.</p>
              </div>
            ) : (
               <>
               {drafts.map(d => <div key={d.id} className="mb-2 text-sm">{d.badgeName} (Rascunho)</div>)}
               </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}