// selo-fiea-frontend/src/pages/BadgesPage.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, ShieldAlert } from 'lucide-react';
import { BadgesTable } from "../components/BadgesTable"; 
import { DynamicForm } from "../components/DynamicForm";
import { apiClient } from "../services/apiClient"; 
import { useNotifications } from "../hooks/useNotifications";

// Tipos para os dados (TypeScript)
export interface Badge {
  id: number;
  name: string;
  description: string;
  validadeMeses: number;
  dataInicioEmissao: Date | string;
  dataFimEmissao: Date | string;
  icon: string;
  // criteria: string[];
}

export function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const badgesData = await apiClient.get('/selos');
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

  const handleOpenModal = (badge: Badge | null) => {
    setEditingBadge(badge); 
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBadge(null);
  };

  const handleSaveBadge = async (badgeToSave: Badge) => {
    try {
      if (editingBadge) { 
        const updatedBadge = await apiClient.patch(`/selos/${badgeToSave.id}`, badgeToSave);
        setBadges(badges.map(b => b.id === updatedBadge.id ? updatedBadge : b));
        addNotification('Selo atualizado com sucesso!', 'success');
      } else { 
        const { id, ...newBadgeData } = badgeToSave;
        const newBadge = await apiClient.post('/selos', newBadgeData);
        setBadges([...badges, newBadge]);
        addNotification('Selo criado com sucesso!', 'success');
      }
      handleCloseModal();
    } catch (error: any) {
      addNotification(`Falha ao salvar selo: ${error.message}`, 'error');
    }
  };

  const handleDeleteBadge = async (badgeId: number) => {
    if (window.confirm("Tem certeza que deseja deletar este selo? Os critérios associados podem ficar órfãos.")) {
      try {
        await apiClient.delete(`/selos/${badgeId}`);
        setBadges(badges.filter(b => b.id !== badgeId));
        addNotification('Selo deletado com sucesso.', 'success');
      } catch (error: any) {
        addNotification(`Falha ao deletar selo: ${error.message}`, 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
       <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
              <Link to="/dashboard" className="text-sm font-semibold text-blue-600 hover:underline">← Voltar para o Dashboard</Link>
              <h1 className="text-3xl font-bold text-gray-800 mt-2">Gerenciar Selos</h1>
              <p className="text-gray-600 mt-1">Crie e edite os tipos de selos. (Critérios devem ser gerenciados na página de Critérios).</p>
          </div>
       </header>

       <main className="container mx-auto px-6 py-8">
          <div className="flex justify-end mb-6">
              <button 
                onClick={() => handleOpenModal(null)}
                className="bg-blue-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors flex items-center"
              >
                  <PlusCircle size={20} className="mr-2"/>
                  Criar Novo Selo
              </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            {isLoading ? (
              <p className="text-center text-gray-500 py-12">Carregando selos...</p>
            ) : badges.length > 0 ? (
                <BadgesTable 
                    badges={badges}
                    onEdit={handleOpenModal}
                    onDelete={handleDeleteBadge}
                />
            ) : (
                <div className="text-center py-12">
                    <ShieldAlert size={48} className="mx-auto text-gray-400" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-700">Nenhum selo encontrado</h3>
                    <p className="mt-1 text-gray-500">Comece criando um novo selo para depois adicionar critérios.</p>
                </div>
            )}
          </div>
       </main>

       {isModalOpen && (
          <DynamicForm
            badge={editingBadge}
            onClose={handleCloseModal}
            onSave={handleSaveBadge}
          />
       )}
    </div>
  );
}
