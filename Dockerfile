FROM debian:stretch-20200514-slim
ENV workdir /usr/app
WORKDIR ${workdir}

COPY go-data-x64.sh ${workdir}
# ADD app-management ${workdir}/app-management
ADD go-data ${workdir}/go-data
ADD platforms ${workdir}/platforms

EXPOSE 3000

ENTRYPOINT [ "/usr/app/platforms/linux/x64/default/node/bin/node", "go-data/build/server/server.js" ]