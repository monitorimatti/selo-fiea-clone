import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import { PlusCircle, ShieldAlert } from "lucide-react";
import { CompanyModal } from "../components/CompanyModal";
import {
  listCompanies,
  createCompany,
  updateCompany,
  toggleCompanyActiveStatus,
} from "../services/CompanyServices";
import type { Company } from "../types/company";
import { useNotifications } from "../hooks/useNotifications";

export function MyCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listCompanies();
        setCompanies(data);
      } catch (err) {
        setError('Erro ao carregar as empresas.');
        console.error('Falha ao buscar empresas:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanies();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenModal = (company: Company | null) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  const handleSaveCompany = async (companyToSave: Partial<Company>) => {
    try {
      if (editingCompany) { // Editando
        if (!companyToSave.id) {
          addNotification('Erro: ID da empresa não encontrado para atualização.', 'error');
          return;
        }
        const updatedCompany = await updateCompany(companyToSave.id, companyToSave);
        setCompanies(companies.map(c => c.id === updatedCompany.id ? updatedCompany : c));
        addNotification('Empresa atualizada com sucesso!', 'success');
      } else { // Criando
        // A função createCompany espera um objeto sem 'id' e 'ativo'
        const newCompanyData = {
          ...companyToSave,
          id: undefined,
          ativo: undefined,
        } as Omit<Company, 'id' | 'ativo'>;
        const newCompany = await createCompany(newCompanyData);
        setCompanies([...companies, newCompany]);
        addNotification('Empresa criada com sucesso!', 'success');
      }
      handleCloseModal();
    } catch (err: any) {
      addNotification(`Erro ao salvar empresa: ${err.message}`, 'error');
    }
  };

  const handleToggleActive = async (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;

    const action = company.ativo ? 'desativar' : 'ativar';
    if (window.confirm(`Tem certeza que deseja ${action} esta empresa?`)) {
      try {
        const updatedCompany = await toggleCompanyActiveStatus(companyId);
        setCompanies(companies.map(c => 
          c.id === companyId ? updatedCompany : c
        ));
        addNotification(`Empresa ${action === 'ativar' ? 'ativada' : 'desativada'} com sucesso!`, 'success');
      } catch (err: any) {
        addNotification(`Erro ao ${action} empresa: ${err.message}`, 'error');
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <Link to="/industry/dashboard/" className="text-sm font-semibold text-blue-600 hover:underline">← Voltar para o Portal</Link>
            <h1 className="text-3xl font-bold text-gray-800 mt-2">Minhas Empresas</h1>
            <p className="text-gray-600 mt-1">Visualize e gerencie as informações das empresas cadastradas.</p>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="flex justify-end mb-6">
            <button
              onClick={() => handleOpenModal(null)}
              className="bg-blue-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors flex items-center"
            >
              <PlusCircle size={20} className="mr-2" />
              Cadastrar Nova Empresa
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            {isLoading && <p className="text-center text-gray-600">Carregando empresas...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {!isLoading && !error && companies && (
              companies.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razão Social</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome Fantasia</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {companies.map((company) => ( 
                        <tr key={company.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.razaoSocial}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.nomeFantasia || '--'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.cnpj}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              company.ativo ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {company.ativo ? 'Ativa' : 'Inativa'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleOpenModal(company)} className="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
                            <button onClick={() => handleToggleActive(company.id)} className={company.ativo ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}>
                              {company.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShieldAlert size={48} className="mx-auto text-gray-400" />
                  <h3 className="mt-4 text-xl font-semibold text-gray-700">Nenhuma empresa encontrada</h3>
                  <p className="mt-1 text-gray-500">Comece cadastrando uma nova empresa no botão acima.</p>
                </div>
              )
            )}
          </div>
        </main>
      </div>
      {isModalOpen && (
        <CompanyModal
          company={editingCompany}
          onClose={handleCloseModal}
          onSave={handleSaveCompany}
        />
      )}
      <Footer />
    </>
  );
}