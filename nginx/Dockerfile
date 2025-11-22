FROM nginx:stable

# Installer certbot si nécessaire
RUN apt-get update && apt-get install -y certbot && rm -rf /var/lib/apt/lists/*

# Copier directement la config (pas de template)
COPY default.conf /etc/nginx/conf.d/default.conf

# Exposer les ports
EXPOSE 80 443

# Démarrer nginx normalement
CMD ["nginx", "-g", "daemon off;"]
