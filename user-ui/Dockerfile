FROM node:17.9.0-slim
LABEL maintainer="DeekshithSN"
RUN useradd userui
WORKDIR /app
RUN chown userui /app /home
COPY . .
RUN npm install 
EXPOSE 3000
USER userui
CMD ["npm","start"]
