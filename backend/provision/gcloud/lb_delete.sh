# gcloud compute instance-groups managed delete canadaone-managed-group

# Forwarding Rules (Frontend)
gcloud compute forwarding-rules delete http-content-rule --global
gcloud compute forwarding-rules delete https-content-rule --global

# Target Proxy
gcloud compute target-http-proxies delete http-lb-proxy --global
gcloud compute target-https-proxies delete https-lb-proxy --global

# URL Maps
gcloud compute url-maps delete web-map-http --global
gcloud compute url-maps delete web-map-https --global

# Backend Service
gcloud compute backend-services delete web-backend-service --global

# Static IP addresses
gcloud compute addresses delete lb-ipv4-1 --global

# Health Checks
gcloud compute health-checks delete http-basic-check --global