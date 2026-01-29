# Guia de Execução Local (Ambiente Docker)

Este guia descreve os passos necessários para levantar o ambiente de desenvolvimento e produção localmente utilizando Docker.

---

## 1. Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

- **Docker Desktop** (ou Docker Engine + Docker Compose)
- **Git**
- **Cliente de Banco de Dados** (DBeaver, Beekeeper Studio ou Azure Data Studio)

---

## 2. Configuração de Variáveis de Ambiente

Antes de iniciar os containers, é necessário configurar as variáveis de ambiente.

### **Backend**
Navegue até a pasta `selo-fiea-api` (ou `backend`), duplique o arquivo `.env.example` e renomeie para `.env`.

### **Frontend**
Navegue até a pasta `selo-fiea-frontend`, duplique o arquivo `.env.example` (se houver) ou crie um arquivo `.env` apontando para a API local:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
````

---

## 3. Inicialização dos Serviços

Na raiz do projeto (onde se encontra o arquivo `docker-compose.yml`), execute o comando para construir e subir os containers em segundo plano:

```bash
docker-compose up -d --build
```

> **Nota:** Na primeira execução, o container do banco de dados (MSSQL) pode demorar alguns minutos para estar totalmente pronto para aceitar conexões.

---

## 4. Configuração Manual do Banco de Dados (Crítico)

O container do banco de dados será iniciado, mas o banco lógico **não é criado automaticamente**. Siga estes passos obrigatórios:

1. Abra seu cliente de banco de dados (ex: DBeaver).
2. Crie uma nova conexão SQL Server com os dados definidos no `docker-compose.yml`
   (geralmente `localhost`, porta **1433**, usuário **sa**).
3. Abra um editor SQL e execute o comando abaixo para criar o banco:

```sql
CREATE DATABASE selo_fiea;
```

---

## 5. Execução de Migrações (Schema)

Com o banco criado, é necessário criar as tabelas e popular os dados iniciais (seed) através do TypeORM.

1. No terminal, identifique o nome do container da API (ex: `selo-fiea-api` ou `backend`) usando:

```bash
docker ps
```

2. Execute as migrações de dentro do container:

```bash
# Substitua 'nome-do-container-backend' pelo nome real listado no docker ps
docker exec -it nome-do-container-backend npm run migration:run
```

Se houver seeds (dados iniciais, como usuário admin), eles serão inseridos nesta etapa.

***DADOS DE ACESSO:***

**Usuário**: admin@selofiea.com

**Senha**: SenhaSegura123


---

## 6. Acessando a Aplicação

Após os passos acima, o sistema estará acessível nos seguintes endereços:

* **Frontend (Aplicação):** [http://localhost:80](http://localhost:80)
  (ou a porta definida no nginx/vite)

  ***DADOS DE ACESSO:***

**Usuário**: admin@selofiea.com

**Senha**: SenhaSegura123


* **Backend (API):** [http://localhost:3000/api/v1](http://localhost:3000/api/v1)

* **Swagger / Documentação:** [http://localhost:3000/api](http://localhost:3000/api)

---

# Solução de Problemas Comuns (Troubleshooting)

### **1. Erro de Conexão com Banco (ECONNREFUSED)**

O container da API tentou conectar antes do SQL Server estar pronto.

**Solução:**

```bash
docker restart nome-do-container-backend
```

Aguarde cerca de 1 minuto antes de reiniciar.

---

### **2. Erro de Login**

* Verifique se as migrações rodaram corretamente.
* Verifique se o usuário **Admin** inicial foi criado na tabela `users`.

---

### **3. Frontend não conecta ao Back**

Verifique no console do navegador (**F12**) se as requisições estão indo para:

```
http://localhost:3000
```

Se estiverem indo para outra porta:

1. Ajuste o `.env` do frontend
2. Rebuild apenas do frontend:

```bash
docker-compose up -d --build frontend
```
