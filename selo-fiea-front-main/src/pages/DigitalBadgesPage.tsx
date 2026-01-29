// selo-fiea-frontend/src/pages/DigitalBadgesPage.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Award, Building, Calendar, ShieldCheck, ShieldAlert, Download, Copy, FileText } from 'lucide-react';
import type { Badge } from "./BadgesPage"; // Assumindo que Badge vem de BadgesPage
import type { Company } from "../types/company";
import { apiClient, BASE_URL } from "../services/apiClient"; 
import { useNotifications } from "../hooks/useNotifications";

// --- Tipos de Dados ---

interface DigitalBadge {
  id: string; // ID da *emissão* do selo
  badge: Badge; // Dados do tipo de selo
  company: Company; // Dados da empresa
  issueDate: string; // Data de emissão (string ISO)
  verificationUrl: string; // URL para verificação pública
  imageUrl: string; // URL da imagem do selo para download
  // adicionamos 'expiryDate' se a API já calcular
}


export function DigitalBadgesPage() {
  const [issuedBadges, setIssuedBadges] = useState<DigitalBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchMyBadges = async () => {
      setIsLoading(true);
      try {
        // 1. Pega o usuário logado do localStorage
        const userString = localStorage.getItem('user');
        if (!userString) {
          throw new Error('Usuário não autenticado.');
        }
        const user = JSON.parse(userString);
        
        // 2. Assume que o usuário tem uma 'empresaId'
        // ( se o campo for outro, ajustamos 'user.empresaId')
        const empresaId = user.empresaId;
        if (!empresaId) {
           throw new Error('Usuário não está associado a uma empresa.');
        }

        // 3. Busca os selos emitidos para essa empresa
        const data = await apiClient.get(`/selos-emitidos/empresa/${empresaId}`);
        setIssuedBadges(data);

      } catch (error: any) {
        addNotification(`Erro ao carregar selos: ${error.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyBadges();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateExpiryDate = (issueDateStr: string, validityMonths: number) => {
    const expiry = new Date(issueDateStr);
    expiry.setMonth(expiry.getMonth() + validityMonths);
    return expiry;
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link copiado para a área de transferência!');
    } catch (err) {
      console.error('Falha ao copiar o link: ', err);
      alert('Falha ao copiar o link.');
    }
  };

  const handleViewCertificate = (issuedId: string) => {
    // Constrói a URL completa para o endpoint do certificado
    const certificateUrl = `${BASE_URL}/selos-emitidos/${issuedId}/certificado`;
    // Abre o certificado em uma nova aba
    window.open(certificateUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <Link to="/industry/dashboard/" className="text-sm font-semibold text-blue-600 hover:underline">← Voltar para o Portal</Link>
            <h1 className="text-3xl font-bold text-gray-800 mt-2">Meus Selos</h1>
            <p className="text-gray-600 mt-1">Visualize os selos de reconhecimento FIEA conquistados.</p>
          </div>
        </header>

      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          <p className="text-center text-gray-500 py-12">Carregando selos...</p>
        ) : issuedBadges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {issuedBadges.map(issued => {
              const expiryDate = calculateExpiryDate(issued.issueDate, issued.badge.validadeMeses);
              const now = new Date();
              const isValid = now >= new Date(issued.issueDate) && now <= expiryDate;
              const fullVerificationUrl = `${window.location.origin}${issued.verificationUrl}`;

              return (
                <div key={issued.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center hover:shadow-xl transition-shadow">
                  <img src={issued.badge.icon} alt={issued.badge.name} className="h-24 w-24 rounded-full mb-4 border-4 border-gray-200" />
                  
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Award size={20} className="text-blue-600" />
                    {issued.badge.name}
                  </h2>
                  <p className="text-lg font-semibold text-gray-700 mt-2 mb-4 flex items-center gap-2">
                    <Building size={18} className="text-gray-500" />
                    {issued.company.nomeFantasia} 
                  </p>

                  <div className="text-sm text-gray-600 space-y-2 w-full border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-semibold flex items-center gap-1.5"><Calendar size={14} /> Data de Emissão:</span>
                      <span>{new Date(issued.issueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold flex items-center gap-1.5"><ShieldCheck size={14} /> Data de Validade:</span>
                      <span>{expiryDate.toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold flex items-center gap-1.5">Status:</span>
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {isValid ? 'Ativo' : 'Expirado'}
                      </span>
                    </div>
                  </div>

                  {isValid ? (
                    <div className="mt-5 w-full space-y-4">
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <h4 className="text-sm font-semibold mb-2">Divulgação</h4>

                        <div className="flex flex-wrap justify-center gap-2 mb-2">
                          <a
                            className="text-xs rounded border px-3 py-1 hover:bg-gray-100 flex items-center gap-1"
                            href={issued.imageUrl}
                            download
                          >
                            <Download size={12} /> Baixar Selo
                          </a>
                          <button 
                            className="text-xs rounded border px-3 py-1 hover:bg-gray-100 flex items-center gap-1"
                            onClick={() => handleViewCertificate(issued.id)}
                          >
                            <FileText size={12} /> Ver Certificado
                          </button>
                        </div>

                        <h4 className="text-sm font-semibold mb-2">Verificação</h4>
                        <div className="flex items-center gap-2">
                          <input
                            className="flex-1 text-xs px-2 py-1 rounded border bg-white truncate"
                            value={fullVerificationUrl}
                            readOnly
                          />
                          <button
                            className="text-xs rounded border px-2 py-1 hover:bg-gray-100 flex items-center gap-1"
                            onClick={() => copy(fullVerificationUrl)}
                          >
                            <Copy size={12} /> Copiar
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Este é o link oficial de verificação do seu selo.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShieldAlert size={48} className="mx-auto text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold text-gray-700">Nenhum selo conquistado</h3>
            <p className="mt-1 text-gray-500">Sua empresa ainda não possui selos FIEA emitidos.</p>
          </div>
        )}
      </main>
    </div>
  );
}