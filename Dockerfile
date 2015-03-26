FROM debian:jessie
MAINTAINER Christian Stewart

RUN apt-get update && apt-get install -y openvpn curl unzip wget sudo openssh-client openssh-server psmisc
RUN curl -sL https://deb.nodesource.com/setup | sudo bash - && apt-get install -y nodejs && apt-get clean
RUN cd /root/ && mkdir .ssh/ && cd .ssh/ && ssh-keygen -f id_rsa -t rsa -N '' && cd .. && cat .ssh/id_rsa.pub >> .ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/*
ADD *.sh /root/
ADD *.js* /root/
RUN cd /root/ && ls && npm install

CMD cd && service ssh restart && ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -f -N -D 0.0.0.0:1080 localhost && node server.js

ENV PORT 80
EXPOSE 80 1080
