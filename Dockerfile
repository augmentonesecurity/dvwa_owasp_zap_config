FROM owasp/zap2docker-stable
USER root

ARG USER_ID
ARG GROUP_ID

RUN apt-get update && apt-get install -q -y --fix-missing \
	iputils-ping \
	telnet \
	curl \
	nano

RUN userdel -f zap &&\
    if getent group zap ; then groupdel zap; fi &&\
    groupadd -g ${GROUP_ID} zap &&\
    useradd -l -u ${USER_ID} -g zap zap &&\
	chown --changes --silent --no-dereference --recursive \
          --from=1000:1000 ${USER_ID}:${GROUP_ID} \
        /zap \
		/home/zap/
	
USER zap