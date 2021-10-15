FROM node:16-alpine3.14 as node

ARG GIT_USER
ARG GIT_EMAIL

WORKDIR /app

ADD ./package.json /app/
ADD ./package-lock.json /app/

RUN apk --no-cache add git openssh-client \
    && npm ci \
    && git config --global user.email "$GIT_EMAIL" \
    && git config --global user.name "$GIT_USER"

COPY ./index.js /app/

ENTRYPOINT ["node", "/app/index.js"]

