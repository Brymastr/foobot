FROM node:onbuild

WORKDIR /src
COPY . /src

RUN npm install

EXPOSE 80
CMD ["node", "classifier.js"]
CMD ["node", "index.js"]