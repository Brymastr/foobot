FROM node:alpine

WORKDIR /src
COPY . /src

RUN
  apk update && \
  apk add bash && \
  chmod 775 wait-for-it.sh && \
  npm i --only=production

EXPOSE 80
CMD ["./wait-for-it.sh", "--strict", "rabbit:8080", "--", "npm", "start"]