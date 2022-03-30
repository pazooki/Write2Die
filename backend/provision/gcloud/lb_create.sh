# gcloud compute instance-templates create canadaone-instance-template \
#    --preempitble
#    --region=us-central1-a \
#    --network=default \
#    --subnet=default \
#    --tags=allow-health-check \
#    --image-family=centos-7 \
#    --image-project=canadaone \
#    --metadata=startup-script='#! /bin/bash
#      sudo yum upgrade

gcloud compute instance-groups managed create canadaone-managed-group \
   --template=canadaone-main-centos7-4gbram-2cores-20gbdisk --size=1 --zone=us-central1-a

gcloud compute instance-groups set-named-ports canadaone-managed-group \
    --named-ports http:80 \
    --zone us-central1-a

gcloud compute firewall-rules create fw-allow-health-check \
    --network=default \
    --action=allow \
    --direction=ingress \
    --source-ranges=130.211.0.0/22,35.191.0.0/16 \
    --target-tags=allow-health-check \
    --rules=tcp:80

gcloud compute addresses create lb-ipv4-1 \
    --ip-version=IPV4 \
    --global

gcloud compute addresses describe lb-ipv4-1 \
    --format="get(address)" \
    --global

gcloud compute health-checks create http http-basic-check \
    --port 80

gcloud compute backend-services create web-backend-service \
    --protocol=HTTP \
    --port-name=http \
    --health-checks=http-basic-check \
    --global

gcloud compute backend-services add-backend web-backend-service \
    --instance-group=canadaone-managed-group \
    --instance-group-zone=us-central1-a \
    --global

gcloud compute url-maps create web-map-https \
    --default-service web-backend-service

# gcloud compute ssl-certificates create canadaone-ssl-01 \
#     --description='canadaone SSL' \
#     --domains='canadaone.me' \
#     --global

# gcloud compute ssl-certificates list \
#    --global

# gcloud compute ssl-certificates describe canadaone-ssl-01 \
#    --global \
#    --format="get(name,managed.status, managed.domainStatus)"


gcloud compute target-https-proxies create https-lb-proxy \
    --url-map web-map-https \
    --ssl-certificates canadaone-ssl
    
gcloud compute forwarding-rules create https-content-rule \
    --address=lb-ipv4-1 \
    --global \
    --target-https-proxy=https-lb-proxy \
    --ports=443

# gcloud compute target-https-proxies update https-lb-proxy \
#     --ssl-certificates canadaone-ssl \
#     --global-ssl-certificates \
#     --global

gcloud compute target-https-proxies describe https-lb-proxy \
    --global \
    --format="get(sslCertificates)"

echo "Time to update DNS A Record"
echo "Here are all the forwarding rule"
gcloud compute forwarding-rules list

echo | openssl s_client -showcerts -servername canadaone.me -connect 34.149.228.105:443 -verify 99 -verify_return_error


gcloud compute url-maps create web-map-http \
    --default-service web-backend-service

gcloud compute target-http-proxies create http-lb-proxy \
    --url-map web-map-http

gcloud compute forwarding-rules create http-content-rule \
    --address=lb-ipv4-1 \
    --global \
    --target-http-proxy=http-lb-proxy \
    --ports=80

gcloud compute url-maps validate --source ./web-map-http.yaml

gcloud compute url-maps import web-map-http \
   --source ./web-map-http.yaml \
   --global

gcloud compute url-maps describe web-map-http

gcloud compute backend-services update web-backend-service \
    --global \
    --custom-response-header='Strict-Transport-Security:max-age=31536000; includeSubDomains; preload'

gcloud compute addresses describe lb-ipv4-1 \
    --format="get(address)" \
    --global