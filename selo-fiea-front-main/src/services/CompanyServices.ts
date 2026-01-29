import { apiClient } from './apiClient';
import type { Company } from '../types/company';

/**
 * Creates a new company.
 * Corresponds to: POST /empresas
 * @param companyData - The data for the company to be created.
 * @returns The newly created company.
 */
export const createCompany = async (
  companyData: Omit<Company, 'id' | 'ativo'>
): Promise<Company> => {
  return apiClient.post('/empresas', companyData);
};

/**
 * Lists all companies.
 * Corresponds to: GET /empresas
 * @returns A list of all companies.
 */
export const listCompanies = async (): Promise<Company[]> => {
  return apiClient.get('/empresas');
};

/**
 * Fetches a specific company by its ID.
 * Corresponde a: GET /empresas/:id
 * @param id - The company's ID.
 * @returns The found company data.
 */
export const getCompanyById = async (id: number): Promise<Company> => {
  return apiClient.get(`/empresas/${id}`);
};

/**
 * Fetches a specific company by its CNPJ.
 * Corresponde a: GET /empresas/cnpj/:cnpj
 * @param cnpj - The company's CNPJ.
 * @returns The found company data.
 */
export const getCompanyByCnpj = async (cnpj: string): Promise<Company> => {
  return apiClient.get(`/empresas/cnpj/${cnpj}`);
};

/**
 * Updates a company's data.
 * Corresponde a: PATCH /empresas/:id
 * @param id - The ID of the company to be updated.
 * @param dataToUpdate - An object with the fields to be updated.
 * @returns The company with updated data.
 */
export const updateCompany = async (
  id: number,
  dataToUpdate: Partial<Omit<Company, 'id' | 'ativo'>>
): Promise<Company> => {
  return apiClient.patch(`/empresas/${id}`, dataToUpdate);
};

/**
 * Toggles a company's active status.
 * Corresponde a: PATCH /empresas/:id/toggle-active
 * @param id - The ID of the company to have its status changed.
 * @returns The company with the updated status.
 */
export const toggleCompanyActiveStatus = async (id: number): Promise<Company> => {
  // A sua implementação de patch espera um body, então passamos um objeto vazio.
  return apiClient.patch(`/empresas/${id}/toggle-active`, {});
};

/**
 * Deletes a company.
 * Corresponde a: DELETE /empresas/:id
 * @param id - The ID of the company to be deleted.
 */
export const deleteCompany = async (id: number): Promise<void> => {
  await apiClient.delete(`/empresas/${id}`);
};
