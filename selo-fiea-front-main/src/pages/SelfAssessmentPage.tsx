// selo-fiea-frontend/src/pages/SelfAssessmentPage.tsx

import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Badge } from './BadgesPage';
import { ChevronLeft, ChevronRight, Save, Send, Star } from 'lucide-react';
import type { Criterion } from './CriteriaPage';
import { FileUploader } from '../components/FileUploader';
import { apiClient } from '../services/apiClient'; // A importação de Evidence virá de 'types'
import { useNotifications } from '../hooks/useNotifications';
import type { Evidence } from '../types/Evidence';

// A resposta para um critério específico
interface AssessmentAnswer {
  criterionId: number; // Usaremos o ID do critério
  criterionText: string;
  responseText: string;
  evidences: Evidence[]; // Armazena metadados das evidências, não o File
}

// O objeto principal da autoavaliação
interface SelfAssessment {
  id: string;
  badgeId: number;
  status: 'draft' | 'submitted';
  answers: AssessmentAnswer[];
}

export function SelfAssessmentPage() {
  const { badgeId } = useParams();
  const navigate = useNavigate();

  const [badge, setBadge] = useState<Badge | null>(null);
  const [assessment, setAssessment] = useState<SelfAssessment | null>(null);
  const [currentStep, setCurrentStep] = useState(0); // Index do critério atual
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const { addNotification } = useNotifications();
  const [allCriteria, setAllCriteria] = useState<Criterion[]>([]);

  // Carrega o selo e o rascunho salvo (se houver)
  useEffect(() => {
    const loadAssessment = async () => {
      setIsLoading(true);
      const numericId = Number(badgeId);

      try {
        // Carrega Selo, Critérios e a Autoavaliação em paralelo
        const [badgeData, criteriaData, existingAssessments] = await Promise.all([
          apiClient.get(`/selos/${numericId}`),
          apiClient.get('/criteria'), // Busca todos os critérios para ter os pesos
          apiClient.get(`/self-assessments?badgeId=${numericId}`) // Busca rascunho
        ]);

        if (!badgeData) {
          addNotification('Selo não encontrado.', 'error');
          navigate('/industry/dashboard');
          return;
        }

        setBadge(badgeData);
        setAllCriteria(criteriaData);
        
        if (existingAssessments && existingAssessments.length > 0) {
          setAssessment(existingAssessments[0]);
        } else {
          // Se não existir, cria um novo
          const newAssessment: SelfAssessment = await apiClient.post('/self-assessments', { badgeId: numericId });
          // A API deve retornar a estrutura completa da nova avaliação,
          // incluindo o array 'answers' inicializado para cada critério do selo.
          setAssessment(newAssessment);
        }
      } catch (error: any) {
        addNotification(`Erro ao carregar autoavaliação: ${error.message}`, 'error');
        navigate('/industry/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadAssessment();
  }, [badgeId, navigate, addNotification]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!assessment) return;

    const newAnswers = [...assessment.answers];
    newAnswers[currentStep].responseText = e.target.value;

    setAssessment({
      ...assessment,
      answers: newAnswers,
    });
    setSaveStatus('idle'); // Reseta o status de salvo ao digitar
  };

  // Atualiza os arquivos para o passo (critério) atual
  const handleFilesChange = async (newFiles: File[]) => {
    if (!assessment) return;

    const currentAnswer = assessment.answers[currentStep];
    const questionId = currentAnswer.criterionId;

    // Faz o upload de cada novo arquivo
    for (const file of newFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        // Chama o endpoint de upload com o ID da questão (critério)
        const uploadedEvidence: Evidence = await apiClient.upload(`/evidences/upload?questionId=${questionId}`, formData);
        
        // Atualiza o estado com a nova evidência
        const newAnswers = assessment.answers.map((ans, index) => {
          if (index === currentStep) {
            return { ...ans, evidences: [...ans.evidences, uploadedEvidence] };
          }
          return ans;
        });
        setAssessment({ ...assessment, answers: newAnswers });
        addNotification(`Arquivo '${file.name}' enviado com sucesso!`, 'success');
      } catch (error: any) {
        addNotification(`Falha ao enviar arquivo '${file.name}': ${error.message}`, 'error');
      }
    }
  };

  const handleFileDelete = (fileId: string | number) => {
    if (!assessment || !window.confirm("Tem certeza que deseja remover esta evidência?")) return;

    // Como nesta página o ID é sempre uma string, garantimos o tipo.
    const evidenceId = String(fileId);

    const deleteEvidence = async () => {
    try {
      await apiClient.delete(`/evidences/${evidenceId}`);
      // Atualiza o estado para remover a evidência da UI
      const newAnswers = assessment.answers.map((ans, index) => {
        if (index === currentStep) {
          return { ...ans, evidences: ans.evidences.filter(ev => ev.id !== evidenceId) };
        }
        return ans;
      });
      setAssessment({ ...assessment, answers: newAnswers });
      addNotification('Evidência removida com sucesso.', 'success');
    } catch (error: any) {
      addNotification(`Falha ao remover evidência: ${error.message}`, 'error');
    }
      setSaveStatus('idle');
    };

    void deleteEvidence();
  };


  // --- Funções de Navegação e Ação ---

  const nextStep = () => {
    if (assessment && currentStep < assessment.answers.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Requisito: "uma autoavaliação pode ser salva para ser completada depois."
  const handleSaveDraft = async () => {
    if (!assessment || !badge) return;
    setSaveStatus('saving');
    
    try {
      // Chama o endpoint PATCH para atualizar o rascunho
      await apiClient.patch(`/self-assessments/${assessment.id}`, {
        answers: assessment.answers,
      });
      setSaveStatus('saved');
      addNotification('Rascunho salvo com sucesso!', 'success');
    } catch (error: any) {
      setSaveStatus('idle');
      addNotification(`Erro ao salvar rascunho: ${error.message}`, 'error');
    }
  };

  // Requisito: "a auto avaliação so será submetida quando todos os critérios forem respondidos."
  const allCriteriaAnswered = assessment?.answers.every(a => a.responseText.trim() !== '') ?? false;

  const handleSubmit = async () => {
    if (!assessment || !badge || !allCriteriaAnswered) return;

    if (window.confirm("Tem certeza que deseja submeter esta autoavaliação? Após o envio, ela não poderá ser editada.")) {
      setIsLoading(true);
      
      try {
        // Chama o endpoint para submeter a avaliação
        await apiClient.post(`/self-assessments/${assessment.id}/submit`, {});
        addNotification('Autoavaliação submetida com sucesso!', 'success');
        navigate('/industry/dashboard');
      } catch (error: any) {
        addNotification(`Erro ao submeter avaliação: ${error.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- Renderização ---

  // --- LÓGICA DA PONTUAÇÃO TOTAL ---
  const { totalScoreAcquired, totalPossibleScore } = useMemo(() => {
    if (!assessment) {
      return { totalScoreAcquired: 0, totalPossibleScore: 0 };
    }

    let acquired = 0;
    let possible = 0;

    // Itera sobre todas as respostas da avaliação
    assessment.answers.forEach(answer => {
      // Encontra o critério correspondente na lista de critérios
      const criterionData = allCriteria.find(c => c.id === answer.criterionId);
      // Pega o peso (pontuação) desse critério. Se não achar, é 0.
      const weight = criterionData?.peso ?? 0;

      // O total possível é a soma de todos os pesos
      possible += weight; 

      // O total adquirido só soma se o campo de texto da resposta NÃO estiver vazio
      if (answer.responseText.trim() !== '') {
        acquired += weight;
      }
    });

    return { totalScoreAcquired: acquired, totalPossibleScore: possible };
  }, [assessment, allCriteria]); // Recalcula quando a avaliação (respostas) ou critérios mudarem
  // --- FIM DA LÓGICA ---


  if (isLoading || !assessment || !badge) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  const currentCriterionAnswer = assessment.answers[currentStep];
  const totalSteps = assessment.answers.length;

  // --- LÓGICA DA PONTUAÇÃO (Peso da pergunta atual) ---
  const currentCriterionData = allCriteria.find(c => c.id === currentCriterionAnswer.criterionId);
  const currentWeight = currentCriterionData?.peso ?? 0;
  // --- FIM DA LÓGICA ---

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <Link to="/industry/dashboard" className="text-sm font-semibold text-blue-600 hover:underline">← Voltar para o Portal</Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">{badge.name}</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-100">
          {/* Stepper / Progresso */}
          <div className="mb-6">

              {/* --- BLOCO MODIFICADO (Visualização de Pontuação) --- */}
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-semibold text-blue-700">PASSO {currentStep + 1} DE {totalSteps}</p>
               
                {/* Visualização da Pontuação (Peso) da Pergunta Atual */}
                {currentWeight > 0 && (
                  <div className="flex items-center space-x-1 text-gray-700 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-sm text-yellow-800">Vale {currentWeight} pontos</span>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{currentCriterionAnswer.criterionText}</h2>
              {/* --- FIM DO BLOCO --- */}

              {/* --- SEÇÃO DE PONTUAÇÃO TOTAL (MODIFICADA) --- */}
              <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-base font-semibold text-blue-800">Sua Pontuação Preliminar</h3>
                <div className="flex items-baseline space-x-2 text-gray-600">
                  <span className="text-3xl font-bold text-blue-700">{totalScoreAcquired}</span>
                  <span className="text-lg font-medium text-gray-500">/ {totalPossibleScore} pontos totais</span>
                </div>
                <p className="text-sm text-gray-500">Sua pontuação aumenta ao preencher cada critério respondido.</p>
              </div>
              {/* --- FIM DA SEÇÃO --- */}
            
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Campo de Resposta */}
            <div className="mb-6">
              <label htmlFor="responseText" className="block text-sm font-medium text-gray-700 mb-2">
                Descreva as práticas, processos ou evidências da sua indústria relacionadas a este critério.
              </label>
              <textarea
                id="responseText"
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite sua resposta aqui..."
                value={currentCriterionAnswer.responseText}
                onChange={handleTextChange}
              />
         </div>

            {/* Campo de Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anexar Evidências (Opcional)
              </label>
              <FileUploader
                  files={currentCriterionAnswer.evidences}
                  onFilesChange={handleFilesChange}
                  onFileDelete={handleFileDelete}
                  getFileId={(evidence) => evidence.id}
                  getFileName={(evidence) => evidence.fileName}
                  description="PDF, DOCX, PNG, ou JPG (Máx. 10MB)"
                />
            </div>

            <hr className="my-6" />

            {/* Navegação e Ações */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Navegação */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="font-semibold text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <ChevronLeft size={20} className="mr-1" />
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={currentStep === totalSteps - 1}
                 className="font-semibold text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  Próximo
                  <ChevronRight size={20} className="ml-1" />
                </button>
              </div>
              
              {/* Ações */}
              <div className="flex gap-2">
                <button
                  type="button"
               onClick={handleSaveDraft}
                  disabled={saveStatus === 'saving'}
                  className="font-semibold text-blue-700 bg-blue-100 py-2 px-4 rounded-lg hover:bg-blue-200 disabled:opacity-50 flex items-center"
                >
                  <Save size={18} className="mr-2" />
           {saveStatus === 'saving' ? 'Salvando...' : (saveStatus === 'saved' ? 'Salvo!' : 'Salvar Rascunho')}
                </button>
              </div>
            </div>
            
            {/* Botão de Submissão Final (só aparece no último passo) */}
         {currentStep === totalSteps - 1 && (
              <div className="mt-8 border-t pt-6 text-center">
                <button
                  type="button"
                   onClick={handleSubmit}
                  disabled={!allCriteriaAnswered || isLoading}
                 className="w-full md:w-auto bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
               >
                  <Send size={20} className="mr-2" />
                  {isLoading ? 'Enviando...' : 'Submeter Avaliação Final'}
                </button>
                {!allCriteriaAnswered && (
               <p className="text-red-600 text-sm mt-3">
                    Você deve preencher as respostas de todos os {totalSteps} critérios antes de submeter.
                  </p>
                )}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}