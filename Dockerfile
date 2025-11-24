# Usa una imagen oficial de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm ci

# Instala Angular CLI globalmente
RUN npm install -g @angular/cli@17.3.11

# Copia todo el código fuente del proyecto
COPY . .

# Construye la aplicación para producción
RUN ng build --configuration production

# Expone el puerto 80
EXPOSE 80

# Comando para iniciar la aplicación
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "80"]