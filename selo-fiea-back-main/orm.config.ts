import { DataSource, DataSourceOptions } from 'typeorm'; // IMPORTANTE: Incluir DataSourceOptions
import { typeOrmConfig } from './src/config/typeorm.config';

// Cria a configuração base (executa a função de config)
const config = typeOrmConfig();

// O TypeORM CLI precisa de uma instância de DataSource exportada.
export const AppDataSource = new DataSource({
  // 🚨 CORREÇÃO AQUI: Casting explícito para DataSourceOptions
  ...(config as DataSourceOptions), 
  migrations: [__dirname + '/src/migrations/*.{ts,js}'],
}); 


/*

import { DataSource, DataSourceOptions } from 'typeorm';
import { typeOrmConfig } from './src/config/typeorm.config';

// Força a variável de ambiente para o modo SQLite/Development
process.env.NODE_ENV = 'development';

// Carrega a configuração do SQLite (que está definida para NODE_ENV=development)
const config = typeOrmConfig();

// O TypeORM CLI usa este DataSource para gerar migrações
export const AppDataSource = new DataSource({
  // ATENÇÃO: As entidades devem ser listadas para que o comando 'generate' funcione.
  // Você precisará listar todas as suas entidades aqui, ou usar um glob pattern:
  // Exemplo de glob pattern (ajuste o caminho se necessário):
  */
  //TIRAR baras entities: [__dirname + '/src/modules/**/*.entity.ts'],
  
  // O restante da configuração
  /*TIRAR
  ...(config as DataSourceOptions), 
  migrations: [__dirname + '/src/migrations/*.{ts,js}'],
});
TIRAR*/