# 純靜態。Zeabur 其實「不需要」這個檔（沒有 package.json 會自動靜態部署），
# 這支是給其他容器平台、或想自己掌控時用的。
FROM caddy:2-alpine
WORKDIR /srv
COPY index.html /srv/index.html
COPY _headers /srv/_headers
ENV PORT=8080
EXPOSE 8080
CMD ["sh","-c","caddy file-server --root /srv --listen :${PORT}"]
