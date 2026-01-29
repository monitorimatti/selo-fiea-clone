# ESTÁGIO 1: Build (Construção)
FROM node:20-alpine AS build

WORKDIR /app

# Copia arquivos de dependências
COPY package.json package-lock.json ./

# Instala dependências
RUN npm install

# Copia todo o código fonte
COPY . .

# Cria um arquivo .env de produção temporário para o build
# IMPORTANTE: A URL deve ser onde o seu backend está acessível PARA O SEU NAVEGADOR.
# Se for rodar localmente, use http://localhost:3000/api/v1
RUN echo "VITE_API_BASE_URL=http://localhost:3000//api/v1" > .env.production

# Gera a pasta 'dist' otimizada
RUN npm run build

# ESTÁGIO 2: Servidor Web (Produção)
FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a nossa configuração personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos construídos no estágio anterior para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]