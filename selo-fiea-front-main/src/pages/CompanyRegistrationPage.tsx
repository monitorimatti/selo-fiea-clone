// selo-fiea-frontend/src/pages/CompanyRegistrationPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../services/apiClient"; 
import { Building, Save, ArrowLeft } from "lucide-react";

export function CompanyRegistrationPage() {
  const navigate = useNavigate();
  
  // Campos da empresa
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cnae, setCnae] = useState('');
  const [endereco, setEndereco] = useState('');
  const [setor, setSetor] = useState(''); 
  const [porte, setPorte] = useState<'Pequeno' | 'Médio' | 'Grande'>('Pequeno'); 
  const [telefoneEmpresa, setTelefoneEmpresa] = useState(''); 
  const [emailEmpresa, setEmailEmpresa] = useState(''); 

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      // Payload apenas da empresa
      const payload = {
          razao_social: razaoSocial,
          nome_fantasia: nomeFantasia,
          cnpj,
          cnae,
          setor,
          porte,
          endereco,
          email: emailEmpresa,
          telefone: telefoneEmpresa,
      };

      console.log("Cadastrando empresa:", payload);

      // Usa apiClient.post (privado/autenticado) pois o usuário já está logado
      await apiClient.post('/companies', payload);

      setMessage('Empresa cadastrada com sucesso!');
      
      setTimeout(() => {
        navigate('/industry/dashboard/empresas');
      }, 1500);

    } catch (err: any) {
      console.error("Falha no cadastro da empresa:", err);
      setError(err.message || 'Erro ao cadastrar empresa. Verifique os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm mb-8">
        <div className="container mx-auto px-6 py-4 flex items-center">
            <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-blue-600">
                <ArrowLeft />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Cadastro de Empresa</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-12">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-100">
            
            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center text-indigo-700 mb-4">
                  <Building className="mr-2" />
                  <h2 className="text-lg font-semibold">Dados Corporativos</h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
                    <input type="text" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required disabled={isLoading} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
                    <input type="text" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required disabled={isLoading} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                        <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="XX.XXX.XXX/XXXX-XX" required disabled={isLoading} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CNAE</label>
                        <input type="text" value={cnae} onChange={(e) => setCnae(e.target.value.replace(/\D/g, ''))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Apenas números" required disabled={isLoading} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Setor de Atuação</label>
                        <input type="text" value={setor} onChange={(e) => setSetor(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required disabled={isLoading} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Porte da Empresa</label>
                        <select value={porte} onChange={(e) => setPorte(e.target.value as typeof porte)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required disabled={isLoading}>
                        <option value="Pequeno">Pequeno Porte</option>
                        <option value="Médio">Médio Porte</option>
                        <option value="Grande">Grande Porte</option>
                        </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                    <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required disabled={isLoading} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Corporativo</label>
                        <input type="email" value={emailEmpresa} onChange={(e) => setEmailEmpresa(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required disabled={isLoading} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Corporativo</label>
                        <input type="tel" value={telefoneEmpresa} onChange={(e) => setTelefoneEmpresa(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required disabled={isLoading} />
                    </div>
                  </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full flex items-center justify-center bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-800 transition-all shadow-sm disabled:bg-blue-400" disabled={isLoading}>
                  <Save className="mr-2" size={20} />
                  {isLoading ? 'Salvando...' : 'Salvar e Cadastrar Empresa'}
                </button>
              </div>
            </form>
        </div>
      </main>
    </div>
  );
}