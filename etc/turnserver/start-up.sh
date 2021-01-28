#!/bin/sh
### find the GCP VM external ip
EXTERNAL_IP=$(curl http://metadata/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip  -H "Metadata-Flavor: Google")

sed -i -e "s/^\(external-ip=\).*/\1${EXTERNAL_IP}/" turnserver.conf

turnserver -c turnserver.conf
