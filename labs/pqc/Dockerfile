FROM ubuntu:24.04 AS build
RUN apt-get update && apt-get install -y --no-install-recommends build-essential perl python3 curl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY labs/pqc/build-openssl.sh /build-openssl.sh
RUN bash /build-openssl.sh /opt/pqc-openssl
FROM ubuntu:24.04
RUN apt-get update && apt-get install -y --no-install-recommends python3 ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=build /opt/pqc-openssl /opt/pqc-openssl
COPY labs/pqc /lab
ENV OPENSSL=/opt/pqc-openssl/bin/openssl
USER 65534:65534
WORKDIR /tmp
CMD ["bash", "/lab/run-all.sh"]
