gcloud compute addresses create lb-ipv4-1 \
    --ip-version=IPV4 \
    --global

gcloud compute addresses describe lb-ipv4-1 \
    --format="get(address)" \
    --global


gcloud compute instance-groups unmanaged create unmanaged-group \
    --zone=us-central1-a \
   --template=instance-template-1 --size=1 

gcloud compute instance-groups unmanaged add-instances unmanaged-group \
    --zone=us-central1-a \
    --instances=list-of-VM-names


gcloud compute instances create canada001-01 
    --project=sincere-baton-318315 \
    --zone=us-central1-a \
    --machine-type=e2-standard-16 \
    --network-interface=network-tier=PREMIUM,subnet=default \
    --maintenance-policy=MIGRATE \
    --service-account=533435338367-compute@developer.gserviceaccount.com \
    --scopes=https://www.googleapis.com/auth/cloud-platform \
    --tags=http-server,https-server \
    --image=centos-7-v20210817 \
    --image-project=centos-cloud \
    --boot-disk-size=40GB \
    --boot-disk-type=pd-balanced \
    --boot-disk-device-name=instance-template-1 \
    --no-shielded-secure-boot \
    --shielded-vtpm \
    --shielded-integrity-monitoring \
    --reservation-affinity=any


gcloud compute instance-groups unmanaged list