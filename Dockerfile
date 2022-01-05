FROM node:lts as build-stage
ARG rpc
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY ./ .
RUN yarn run conf ${rpc}

FROM haproxy as production-stage
COPY --from=build-stage /app/haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg
