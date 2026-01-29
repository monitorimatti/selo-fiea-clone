// selo-fiea-frontend/src/pages/CriteriaPage.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { CriterionForm } from "../components/CriterionModal"; 
import { apiClient } from "../services/apiClient";
import { useNotifications } from "../hooks/useNotifications";
import type { Badge } from "./BadgesPage";

// Tipos para os dados
export type Pilar = 'Qualidade' | 'Sustentabilidade' | 'Inovação Tecnológica';

export interface Criterion {
  id: number;
  pilar: Pilar;
  descricao: string;
  peso: number;
  seloId: number;
  seloName?: string;
}

const PILARES: Pilar[] = ['Qualidade', 'Sustentabilidade', 'Inovação Tecnológica'];

export function CriteriaPage() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]); // Estado para armazenar selos
  const [isCreating, setIsCreating] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [criteriaData, badgesData] = await Promise.all([
        apiClient.get('/criteria'),
        apiClient.get('/selos')
      ]);
      setCriteria(criteriaData);
      setBadges(badgesData);
    } catch (error: any) {
      addNotification(`Erro ao carregar dados: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = () => {
    setIsCreating(false);
    setEditingCriterion(null);
  };

  const handleSaveCriterion = async (criterionToSave: Omit<Criterion, 'id'> & { id?: number }) => {
    try {
      if (criterionToSave.id) { 
        const updated = await apiClient.patch(`/criteria/${criterionToSave.id}`, criterionToSave);
        setCriteria(criteria.map(c => c.id === updated.id ? updated : c));
        addNotification('Critério atualizado!', 'success');
      } else { 
        const newCriterion = await apiClient.post('/criteria', criterionToSave);
        setCriteria([...criteria, newCriterion]);
        addNotification('Critério criado!', 'success');
      }
      handleCancel();
    } catch (error: any) {
      addNotification(`Falha ao salvar critério: ${error.message}`, 'error');
    }
  };

  const handleDeleteCriterion = async (criterionId: number) => {
    if (window.confirm("Tem certeza que deseja deletar este critério?")) {
      try {
        await apiClient.delete(`/criteria/${criterionId}`);
        setCriteria(criteria.filter(c => c.id !== criterionId));
        addNotification('Critério deletado.', 'success');
      } catch (error: any) {
        addNotification(`Falha ao deletar critério: ${error.message}`, 'error');
      }
    }
  };

  const getBadgeName = (seloId: number) => {
    const badge = badges.find(b => b.id === seloId);
    return badge ? badge.name : 'Selo desconhecido';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <Link to="/dashboard" className="text-sm font-semibold text-blue-600 hover:underline">← Voltar para o Dashboard</Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Gerenciar Critérios de Avaliação</h1>
          <p className="text-gray-600 mt-1">Adicione, edite ou remova os critérios associados a cada selo.</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
               if (badges.length === 0) {
                 addNotification("Crie um Selo primeiro antes de criar critérios.", "error");
                 return;
               }
               setIsCreating(true);
            }}
            className="bg-blue-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={badges.length === 0}
          >
            <PlusCircle size={20} className="mr-2" />
            Criar Novo Critério
          </button>
        </div>

        <div className="space-y-8">
          {isLoading ? (
             <p className="text-center text-gray-500 py-12">Carregando dados...</p>
          ) : criteria.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-lg shadow">
                <ShieldAlert size={32} className="mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Nenhum critério cadastrado.</p>
             </div>
          ) : (
            PILARES.map(pilar => {
              const pilarCriteria = criteria.filter(c => c.pilar === pilar);
              if (pilarCriteria.length === 0) return null;

              return (
                <div key={pilar} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-700 mb-4">{pilar}</h2>
                  <ul className="space-y-3">
                    {pilarCriteria.map(criterion => (
                        <li key={criterion.id} className="flex justify-between items-center p-3 rounded-md bg-gray-50 border">
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium">{criterion.descricao}</p>
                            <div className="flex space-x-4 text-sm mt-1">
                                <span className="text-gray-500">Peso: {criterion.peso}</span>
                                <span className="text-blue-600 bg-blue-50 px-2 rounded">
                                    Selo: {criterion.seloName || getBadgeName(criterion.seloId)}
                                </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 ml-4">
                            <button onClick={() => setEditingCriterion(criterion)} className="text-blue-600 hover:text-blue-800 transition-colors"><Edit size={20} /></button>
                            <button onClick={() => handleDeleteCriterion(criterion.id)} className="text-red-600 hover:text-red-800 transition-colors"><Trash2 size={20} /></button>
                          </div>
                        </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </main>

      {(isCreating || editingCriterion) && (
        <CriterionForm
          criterion={editingCriterion}
          badges={badges}
          onSave={handleSaveCriterion}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
