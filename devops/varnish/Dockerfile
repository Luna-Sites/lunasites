# syntax=docker/dockerfile:1
FROM varnish:7.6

LABEL maintainer="LunaSites <dobriceanionut@luna-sites.com>" \
      org.label-schema.name="lunasites-varnish" \
      org.label-schema.description="LunaSites Varnish image." \
      org.label-schema.vendor="LunaSites"

COPY etc/varnish.vcl /etc/varnish/default.vcl
