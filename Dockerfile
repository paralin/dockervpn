FROM debian:jessie
MAINTAINER Christian Stewart

RUN apt-get update && apt-get install -y openvpn curl unzip wget sudo
RUN curl -sL https://deb.nodesource.com/setup | sudo bash - && apt-get install -y nodejs && apt-get clean
ADD *.sh /root/
ADD *.js* /root/
RUN cd /root/ && ls && npm install

CMD cd && node server.js

ENV PORT 80
EXPOSE 80
