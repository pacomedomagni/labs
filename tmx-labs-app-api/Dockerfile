FROM ccir.prci.com/edv/pgrconfig as config
FROM ccir.prci.com/base_registry.redhat.io/ubi8/dotnet-80 AS builder 
LABEL images="ccir.prci.com/base_registry.redhat.io/ubi8/dotnet-80:latest"

ARG CI
ARG PGR_PROXY_CACHE
ARG PGR_PROXY_BYPASS
ARG ENABLE_IMAGE_UPDATE
ARG READWRITEMOUNTCONTAINERPATH
ENV http_proxy=${PGR_PROXY_CACHE} \
    HTTP_PROXY=${PGR_PROXY_CACHE} \
    https_proxy=${PGR_PROXY_CACHE} \
    HTTPS_PROXY=${PGR_PROXY_CACHE} \
    no_proxy=${PGR_PROXY_BYPASS} \
    NO_PROXY=${PGR_PROXY_BYPASS} \
    READWRITEMOUNTCONTAINERPATH=${READWRITEMOUNTCONTAINERPATH}

USER root
COPY --from=config /pgr /pgr
RUN --mount=type=secret,id=PGRCONFIG_TOKEN /pgr/activate

WORKDIR /opt/app-root
COPY . .
RUN --mount=type=secret,id=PGRCONFIG_TOKEN dotnet build

RUN dotnet test -c Release --settings /pgr/configs/cobertura/cobertura.settings \
    --collect:"XPlat Code Coverage" /p:CollectCoverage=true \
    --results-directory ${READWRITEMOUNTCONTAINERPATH}/TestResults \
    --logger "trx;LogFileName=TestResults.trx"

RUN ls -la ${READWRITEMOUNTCONTAINERPATH}/TestResults 

RUN dotnet publish -c Release -o /opt/app-root/runtime/ --no-restore

FROM ccir.prci.com/base_registry.redhat.io/ubi8/dotnet-80-runtime AS runtime
LABEL images="ccir.prci.com/base_registry.redhat.io/ubi8/dotnet-80-runtime"

ARG CI
ARG APP_NAME
ARG PGR_PROXY_CACHE
ARG PGR_PROXY_BYPASS
ARG ENABLE_IMAGE_UPDATE
ARG ENABLE_KERBSIDECAR
ARG ENABLE_APPDYNAMICS
ARG APPDYNAMICS_TYPE
ENV APP_NAME=$APP_NAME \
    http_proxy=${PGR_PROXY_CACHE} \
    HTTP_PROXY=${PGR_PROXY_CACHE} \
    https_proxy=${PGR_PROXY_CACHE} \
    HTTPS_PROXY=${PGR_PROXY_CACHE} \
    no_proxy=${PGR_PROXY_BYPASS} \
    NO_PROXY=${PGR_PROXY_BYPASS}

USER root
COPY --from=config /pgr /pgr
RUN --mount=type=secret,id=PGRCONFIG_TOKEN /pgr/activate

COPY --from=builder /opt/app-root/runtime/ .
USER default

USER 1001
EXPOSE 8080
CMD dotnet Progressive.Telematics.Labs.Api.dll

