// src/components/FileUploader.tsx
import { UploadCloud, X, FileText } from 'lucide-react';
import React from 'react';

interface FileUploaderProps<T> {
  files: T[];
  onFilesChange: (newFiles: File[]) => void;
  onFileDelete: (fileId: string | number) => void;
  // Funções para extrair dados do objeto de arquivo genérico
  getFileId: (file: T) => string | number;
  getFileName: (file: T) => string;
  acceptedTypes?: string; // Ex: ".pdf,.docx,.png"
  maxFileSizeMB?: number; // Tamanho máximo em Megabytes
  label?: string;
  description?: string;
}

const MAX_SIZE_MB = 10; // Padrão de 10MB se não for fornecido
const ALLOWED_TYPES = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"; // Padrão

export function FileUploader<T>({
  files: displayedFiles,
  onFilesChange,
  onFileDelete,
  getFileId,
  getFileName,
  acceptedTypes = ALLOWED_TYPES,
  maxFileSizeMB = MAX_SIZE_MB,
  label = "Clique para enviar arquivos",
  description = "PDF, DOCX, XLSX, PNG, ou JPG (Máx. 10MB por arquivo)"
}: FileUploaderProps<T>) {

  const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = Array.from(files);
    let errors: string[] = [];

    newFiles.forEach(file => {
      // Validação de tamanho
      if (file.size > maxFileSizeBytes) {
        errors.push(`O arquivo "${file.name}" é muito grande (Máx. ${maxFileSizeMB}MB).`);
        return;
      }

      // Validação de tipo (baseado na extensão, mais simples que MIME type)
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!acceptedTypes.split(',').includes(fileExtension)) {
         errors.push(`Tipo de arquivo inválido: "${file.name}".`);
         return;
      }
      
      // Validação de duplicidade (nome do arquivo já na lista de evidências)
      if (displayedFiles.some(existingFile => getFileName(existingFile) === file.name)) {
         errors.push(`O arquivo "${file.name}" já foi adicionado.`);
         return;
      }
    });

    if (errors.length > 0) {
      alert(errors.join("\n"));
    }

    // Envia apenas os arquivos que não geraram erro para a página pai
    onFilesChange(newFiles.filter(f => !errors.some(e => e.includes(f.name))));
  };

  return (
    <div className="w-full">
      {/* Área de Upload */}
      <label 
        htmlFor="file-upload" 
        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
      >
        <UploadCloud className="h-10 w-10 text-gray-400" />
        <span className="mt-2 text-sm font-semibold text-blue-600">{label}</span>
        <span className="text-xs text-gray-500">{description}</span>
      </label>
      <input 
        id="file-upload" 
        type="file" 
        className="sr-only" 
        multiple 
        onChange={handleFileChange}
        accept={acceptedTypes}
      />

      {/* Lista de Arquivos Selecionados */}
      {displayedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
           <h4 className="text-sm font-medium text-gray-700">Evidências Anexadas:</h4>
          <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {displayedFiles.map((file) => (
              <li 
                key={getFileId(file)} 
                className="flex items-center justify-between p-2 bg-gray-100 rounded-md border border-gray-200"
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                   <FileText size={18} className="text-gray-500 flex-shrink-0" />
                   <span className="text-sm text-gray-800 truncate" title={getFileName(file)}>{getFileName(file)}</span>
                   {/* O tamanho do arquivo não está disponível no objeto Evidence, então removemos a exibição */}
                </div>
                <button
                  type="button"
                  onClick={() => onFileDelete(getFileId(file))}
                  className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}