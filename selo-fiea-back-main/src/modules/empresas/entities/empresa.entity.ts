import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ValueTransformer } from 'typeorm';

// Crie um transformer simples (pode ser no mesmo arquivo ou importado)
const jsonTransformer: ValueTransformer = {
  // Converte o objeto JS em string JSON para salvar no banco
  to: (value: any) => {
    if (value === null || value === undefined) return value;
    return JSON.stringify(value);
  },
  // Converte a string do banco de dados de volta para objeto JS
  from: (value: string | null) => {
    if (value === null || value === undefined) return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
};
@Entity('empresas')
@Index(['cnpj'], { unique: true })
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 18, unique: true })
  cnpj: string;

  @Column({ type: 'varchar', length: 255 })
  razaoSocial: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nomeFantasia: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  setor: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  porte: string; // 'Pequeno', 'Médio', 'Grande'

  @Column({ type: 'text', nullable: true })
  endereco: string;

  @Column({ 
    type: 'text', // <-- Mude de 'json' para 'text'
    nullable: true,
    transformer: jsonTransformer // <-- Adicione o transformer
  })
  contatos: {
    telefones?: string[];
    emails?: string[];
  };

  @Column({ type: 'varchar', length: 50, default: 'Ativo' })
  status: string; // 'Ativo', 'Inativo', 'Pendente'

  // Campos adicionais já implementados
  @Column({ type: 'varchar', length: 10, nullable: true })
  cnae: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cidade: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  estado: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  cep: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomeResponsavel: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailResponsavel: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefoneResponsavel: string;

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}