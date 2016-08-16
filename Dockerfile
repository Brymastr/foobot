FROM node:onbuild

WORKDIR /src
COPY . /src

RUN npm install

EXPOSE 443
CMD ["node", "index.js"]