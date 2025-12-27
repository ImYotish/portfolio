FROM nginx:stable

# Installer certbot et gettext (envsubst)
RUN apt-get update && apt-get install -y certbot gettext-base && rm -rf /var/lib/apt/lists/*

# Copier le template
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Exposer les ports
EXPOSE 80 443

# Générer la config finale avec envsubst puis lancer nginx
CMD ["/bin/sh", "-c", "envsubst '${DOMAIN} ${BASE_URL} ${MAIN_URL} ${CHATGPT_URL} ${MESSAGE_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
