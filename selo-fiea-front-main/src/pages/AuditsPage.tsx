// selo-fiea-frontend/src/pages/AuditsPage.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, FileText } from 'lucide-react';
import { AuditsTable } from "../components/AuditsTable";
import { AuditModal, type AuditFormData } from "../components/AuditModal";
import { ParecerModal } from "../components/ParecerModal";
import { apiClient } from "../services/apiClient"; 
import { useNotifications } from "../hooks/useNotifications"; // para feedback
import type { Evidence } from '../types/Evidence';

// --- Tipos de Dados ---

// Usuários (Auditores)
export interface User {
  id: number;
  name: string;
  // se for preciso for, adicionar outros campos de usuário que a API /users retorna
}

// Tópicos de Auditoria
export interface AuditTopic {
  id: string; // Pode ser string (temp) ou number (da API)
  title: string;
  description: string;

  // Resposta da Empresa (Autoavaliação)
  companySelfScore: 0 | 1 | 2 | 3 | 4; 
  companyParecer: string;
  evidences: Evidence[]; // Evidências enviadas pela empresa

  // Resposta do Auditor
  scoreLevel: 0 | 1 | 2 | 3 | 4; // Nota do auditor
  auditorId: number | null;
  parecer: string; // Parecer do auditor
}

// Auditoria (Entidade Principal)
export interface Audit {
  id: number;
  title: string;
  description: string;
  mainAuditorId: number | null;
  documents: File[]; // esse campo pode não ser mapeado 1:1 com a API
  topics: AuditTopic[];
  status: 'em_analise' | 'conforme' | 'nao_conforme';
  parecerFinal: string;
}

export function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [auditors, setAuditors] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);
  const [isParecerModalOpen, setIsParecerModalOpen] = useState(false);
  const [auditForParecer, setAuditForParecer] = useState<Audit | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const { addNotification } = useNotifications();

  // Função para carregar os dados
  const fetchAudits = async () => {
    setIsLoading(true);
    try {
      const auditsData = await apiClient.get('/auditorias');
      // A API /auditorias pode não retornar os tópicos,
      // podemos precisar de chamadas adicionais se quisermos exibir a contagem
      setAudits(auditsData);
    } catch (error: any) {
      addNotification(`Erro ao carregar auditorias: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuditors = async () => {
    try {
      // assumindo que /users retorna a lista de auditores
      const auditorsData = await apiClient.get('/users');
      setAuditors(auditorsData);
    } catch (error: any) {
      addNotification(`Erro ao carregar auditores: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    fetchAudits();
    fetchAuditors();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // desabilita o aviso de dependência para addNotification

  const handleOpenModal = (audit: Audit | null) => {
    setEditingAudit(audit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAudit(null);
  };

  const handleOpenParecerModal = (audit: Audit) => {
    // a api de auditoria pode não retornar os tópicos na listagem principal
    // precisamos buscar os tópicos da auditoria selecionada ANTES de abrir o modal.
    const fetchAuditDetails = async () => {
      setIsLoading(true);
      try {
        // 1. Busca a auditoria completa
        const auditDetails = await apiClient.get(`/auditorias/${audit.id}`);
        // 2. Busca os tópicos associados
        const topicsData = await apiClient.get(`/auditorias/topicos-pontuacao?auditId=${audit.id}`); // Assumindo query param
        
        // Combina os dados
        const auditWithTopics = {
          ...auditDetails,
          topics: topicsData || [],
        };

        setAuditForParecer(auditWithTopics);
        setIsParecerModalOpen(true);
      } catch (error: any) {
        addNotification(`Erro ao carregar detalhes da auditoria: ${error.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAuditDetails();
  };

  const handleCloseParecerModal = () => {
    setIsParecerModalOpen(false);
    setAuditForParecer(null);
  };

  // Salva os pareceres
  const handleSaveParecer = async (updatedAudit: Audit) => {
    setIsLoading(true);
    try {
      // avaliar cada Tópico em loop
      for (const topic of updatedAudit.topics) {
        const topicEvaluationPayload = {
          topicId: topic.id, 
          scoreLevel: topic.scoreLevel,
          parecer: topic.parecer,
          auditorId: topic.auditorId,
        };
        await apiClient.post(
          `/auditorias/${updatedAudit.id}/avaliar-topico`, 
          topicEvaluationPayload
        );
      }
      
      // Salvar o Parecer Final
      await apiClient.post(
        `/auditorias/${updatedAudit.id}/parecer`, 
        { parecerFinal: updatedAudit.parecerFinal }
      );
      
      // Se a auditoria foi marcada como 'conforme', emite o selo
      if (updatedAudit.status === 'conforme') {
        try {
          await apiClient.post('/selos-emitidos/emitir', {
            auditoriaId: updatedAudit.id,
          });
          addNotification('Auditoria concluída e selo emitido com sucesso!', 'success');
        } catch (emissionError: any) {
          // Notifica sobre o parecer salvo, mas avisa sobre o erro na emissão
          addNotification(`Parecer salvo, mas falha ao emitir selo: ${emissionError.message}`, 'error');
        }
      } else {
        addNotification('Parecer salvo com sucesso!', 'success');
      }

      handleCloseParecerModal();
      fetchAudits(); 
      
    } catch (error: any) {
      addNotification(`Falha ao salvar parecer: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Salva a auditoria (lógica complexa da API)
  const handleSaveAudit = async (formData: AuditFormData) => {
    setIsLoading(true);
    try {
      // 1. Criar/Atualizar a Auditoria principal
      const auditPayload = {
        title: formData.title,
        description: formData.description,
        mainAuditorId: formData.mainAuditorId,
        status: formData.status,
      };

      let savedAudit: Audit;

      if (editingAudit) {
        savedAudit = await apiClient.patch(`/auditorias/${formData.id}`, auditPayload);
        // NOTA: a api não parece suportar a atualização de tópicos por aqui
        // a edição de tópicos (adicionar/remover) deve ser um fluxo separado
        // o modal de edição, por ora, só edita os dados principais
      } else {
        // Criando uma nova auditoria
        savedAudit = await apiClient.post('/auditorias', auditPayload);

        // 2. Criar os Tópicos em loop
        for (const topic of formData.topics) {
          const topicPayload = {
            auditId: savedAudit.id, // Linka o tópico à auditoria criada
            title: topic.title,
            description: topic.description,
            // (outros campos do DTO 'topicos-pontuacao')
          };
          await apiClient.post('/auditorias/topicos-pontuacao', topicPayload);
        }
      }
      
      // 3. Lidar com Upload de Documentos
      // a api de evidências (/evidences/upload) não parece ligada a 'auditorias',
      // mas sim a 'selfAssessmentId' ou 'questionId'.
      // portanto, o upload de 'documents' da auditoria principal é pulado.
      if (formData.documents.length > 0) {
        console.warn('O upload de documentos da auditoria principal não foi implementado (API endpoint ausente).');
        // se o endpoint existisse (ex: /auditorias/:id/upload), seria:
        // const docFormData = new FormData();
        // formData.documents.forEach(file => docFormData.append('files', file));
        // await apiClient.upload(`/auditorias/${savedAudit.id}/upload`, docFormData);
      }
      
      addNotification(editingAudit ? 'Auditoria atualizada!' : 'Auditoria criada!', 'success');
      handleCloseModal();
      fetchAudits(); 

    } catch (error: any) {
      addNotification(`Falha ao salvar auditoria: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAudit = async (auditId: number) => {
    if (window.confirm("Tem certeza que deseja deletar esta auditoria?")) {
      try {
        await apiClient.delete(`/auditorias/${auditId}`);
        addNotification('Auditoria deletada com sucesso.', 'success');
        setAudits(audits.filter(a => a.id !== auditId));
      } catch (error: any) {
        addNotification(`Falha ao deletar auditoria: ${error.message}`, 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <Link to="/dashboard" className="text-sm font-semibold text-blue-600 hover:underline">← Voltar para o Dashboard</Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Gerenciar Auditorias</h1>
          <p className="text-gray-600 mt-1">Crie e acompanhe os processos de auditoria das indústrias.</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => handleOpenModal(null)}
            className="bg-blue-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors flex items-center"
          >
            <PlusCircle size={20} className="mr-2" />
            Criar Nova Auditoria
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          {isLoading && audits.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Carregando auditorias...</p>
          ) : audits.length > 0 ? (
            <AuditsTable
              audits={audits}
              users={auditors}
              onEdit={handleOpenModal}
              onDelete={handleDeleteAudit}
              onParecer={handleOpenParecerModal}
            />
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400" />
              <h3 className="mt-4 text-xl font-semibold text-gray-700">Nenhuma auditoria encontrada</h3>
              <p className="mt-1 text-gray-500">Comece criando um novo processo de auditoria.</p>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <AuditModal
          audit={editingAudit}
          allAuditors={auditors}
          onClose={handleCloseModal}
          onSave={handleSaveAudit}
        />
      )}

      {isParecerModalOpen && auditForParecer && (
        <ParecerModal
          audit={auditForParecer}
          onClose={handleCloseParecerModal}
          onSave={handleSaveParecer}
        />
      )}
    </div>
  );
}