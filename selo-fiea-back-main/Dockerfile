# --- FASE 1: BUILD ---
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# 1. Copia arquivos de dependência
COPY package.json package-lock.json ./

# 2. Instala TODAS as dependências (incluindo devDependencies para o build)
# A flag --production foi REMOVIDA aqui pois precisamos do CLI do Nest
RUN npm install

# 3. Copia arquivos de configuração do TypeScript e Nest
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# 4. Copia o restante do código fonte
COPY . .

# DIAGNÓSTICO: Lista arquivos para garantir que tudo foi copiado corretamente
RUN ls -la

# 5. Executa a compilação (Gera a pasta /dist)
RUN npm run build

# --- FASE 2: PRODUÇÃO ---
FROM node:20-alpine

WORKDIR /usr/src/app

ENV NODE_ENV production
ENV TZ America/Sao_Paulo

# 1. Copia as dependências da fase de build
# (Para uma imagem menor, idealmente faríamos um novo npm install --production, 
# mas copiar node_modules funciona e é mais seguro para evitar versões diferentes)
COPY --from=build /usr/src/app/node_modules ./node_modules

# 2. Copia a pasta dist (O código compilado)
COPY --from=build /usr/src/app/dist ./dist

# 3. Copia package.json e arquivos estáticos
COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/orm.config.ts ./
COPY --from=build /usr/src/app/tsconfig.json ./
COPY --from=build /usr/src/app/src ./src
COPY --from=build /usr/src/app/uploads ./uploads

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]