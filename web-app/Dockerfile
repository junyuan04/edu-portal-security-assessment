FROM node:20-alpine

RUN apk add --no-cache openssh \
    && ssh-keygen -A \
    && echo 'root:admin123' | chpasswd \
    && sed -i 's/#PermitRootLogin.*/PermitRootLogin yes/'               /etc/ssh/sshd_config \
    && sed -i 's/#PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config \
    && sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000 22

CMD ["/bin/sh", "-c", "/usr/sbin/sshd && node server.js"]


