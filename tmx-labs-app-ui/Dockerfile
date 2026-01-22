FROM ccir.prci.com/edv/pgrconfig AS config
FROM ccir.prci.com/base_registry.redhat.io/ubi9/nodejs-22:latest AS builder
LABEL images="ccir.prci.com/base_registry.redhat.io/ubi9/nodejs-22:latest"

ARG CI
ARG APP_NAME
ARG PGR_PROXY_CACHE
ARG PGR_PROXY_BYPASS
ENV http_proxy=${PGR_PROXY_CACHE} \
    HTTP_PROXY=${PGR_PROXY_CACHE} \
    https_proxy=${PGR_PROXY_CACHE} \
    HTTPS_PROXY=${PGR_PROXY_CACHE} \
    no_proxy=${PGR_PROXY_BYPASS} \
    NO_PROXY=${PGR_PROXY_BYPASS}


USER root
COPY --from=config /pgr /pgr
RUN --mount=type=secret,id=PGRCONFIG_TOKEN /pgr/activate

# Chrome Setup - Install Dependencies
USER root
RUN rm -f /etc/yum.repos.d/*repo
COPY ./chrome-image/ubi9.repo /etc/yum.repos.d/

# increase yum call timeout
RUN echo "timeout=120">>/etc/yum.conf
RUN cat /etc/yum.conf

# Chrome dependencies
RUN --mount=type=secret,id=PGRCONFIG_TOKEN \
    dnf clean all && \
    dnf -y update && \
    dnf -y install yum-utils wget pango.x86_64 libXcomposite.x86_64 libXcursor.x86_64 libXdamage.x86_64 libXext.x86_64 libXi.x86_64 libXtst.x86_64 cups-libs.x86_64 libXScrnSaver.x86_64 libXrandr.x86_64 alsa-lib.x86_64 atk.x86_64 gtk3.x86_64 nss.x86_64 mesa-libgbm.x86_64 libX11-xcb.x86_64 && \
    dnf clean all


WORKDIR /opt/app-root

COPY package*.json .
RUN --mount=type=secret,id=PGRCONFIG_TOKEN \
    npm config set loglevel warn && \
    npm i -g npm && \
    npm install -g @angular/cli && \
    npm ci --log-level warn

COPY . .

RUN node node_modules/puppeteer/install.mjs
RUN ln -s $(find /opt/app-root/src -name chrome -type f|tail -1) /opt/app-root/src/chrome
ENV CHROME_BIN=/opt/app-root/src/chrome

RUN npm run test-ci

RUN npm run build:prod

FROM ccir.prci.com/base_docker.io/nginx AS runtime
LABEL images="ccir.prci.com/base_docker.io/nginx"

ARG CI
ARG APP_NAME
ARG PGR_PROXY_CACHE
ARG PGR_PROXY_BYPASS
ENV http_proxy=${PGR_PROXY_CACHE} \
    HTTP_PROXY=${PGR_PROXY_CACHE} \
    https_proxy=${PGR_PROXY_CACHE} \
    HTTPS_PROXY=${PGR_PROXY_CACHE} \
    no_proxy=${PGR_PROXY_BYPASS} \
    NO_PROXY=${PGR_PROXY_BYPASS}

WORKDIR /usr/share/nginx/html
RUN chmod -R g+rwx /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html

COPY --from=config /pgr/configs/nginx/healthz.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /opt/app-root/dist/${APP_NAME}/browser/ .

RUN chmod -R a+rwx /usr/share/nginx/html/envConfig

USER 1001
EXPOSE 8080

CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/envConfig/env.template.json > /usr/share/nginx/html/envConfig/env.config.json && exec nginx -g 'daemon off;'"]