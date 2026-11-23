# librespot (Spotify Connect) built from source, without any sound card backends: it only writes PCM to a pipe.
FROM public.ecr.aws/docker/library/rust:1-slim-bookworm AS build
RUN cargo install librespot --git https://github.com/librespot-org/librespot --rev 53faaca002e5b4e5a4d57d9ef8459994b5db3216 \
        --locked --no-default-features \
        --features rustls-tls-webpki-roots,with-libmdns --root /out

FROM public.ecr.aws/docker/library/debian:bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg python3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /out/bin/librespot /usr/local/bin/librespot
COPY jukebox.py /app/jukebox.py
COPY jukebox-login /usr/local/bin/jukebox-login
RUN chmod +x /usr/local/bin/jukebox-login && mkdir -p /data
ENV DATA_DIR=/data PORT=8000
VOLUME /data
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2)"
CMD ["python3", "-u", "/app/jukebox.py"]
