# Google Cloud Deploy Checklist

This project is currently best suited for a Google Compute Engine VM running Docker Compose.
That path keeps the existing MySQL container, NiFi container, API gateway, backend services, and frontend in one deploy unit.

## 1. Prepare Locally

Run these checks before copying the project to the VM:

```powershell
npm --prefix ev-service-center-frontend run build
docker compose -f infra/docker-compose.yml config --quiet
```

Confirm these URLs work locally:

```text
http://localhost:3000
http://localhost:8080/health
```

## 2. Required Environment

Create a root `.env` from `.env.example`:

```bash
cp .env.example .env
```

For a Google Compute Engine VM, set:

```env
MYSQL_ROOT_PASSWORD=your-strong-db-password
EV_INTERNAL_SERVICE_TOKEN=your-strong-internal-token
NIFI_SENSITIVE_PROPS_KEY=your-strong-nifi-key
NEXT_PUBLIC_API_URL=http://YOUR_VM_EXTERNAL_IP:8080
```

Important: `MYSQL_ROOT_PASSWORD` must match the `DB_PASS` value in each backend service `.env` if those services connect as `root`.

## 3. Create The VM

Recommended demo VM:

```bash
gcloud compute instances create ev-demo \
  --zone=asia-southeast1-b \
  --machine-type=e2-standard-4 \
  --boot-disk-size=50GB \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --tags=ev-web
```

Open demo ports:

```bash
gcloud compute firewall-rules create allow-ev-web \
  --allow tcp:3000,tcp:8080,tcp:8888 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=ev-web
```

Ports:

```text
3000 frontend
8080 api-gateway
8888 NiFi
```

Avoid exposing MySQL port `3307` publicly.

## 4. Install Runtime On VM

SSH to the VM, then install Docker and Compose plugin:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git docker.io docker-compose-plugin
sudo usermod -aG docker "$USER"
newgrp docker
```

## 5. Deploy

Clone or copy the project to the VM, then from the project root:

```bash
docker compose -f infra/docker-compose.yml up --build -d
docker compose -f infra/docker-compose.yml ps
```

Check logs:

```bash
docker compose -f infra/docker-compose.yml logs -f api-gateway frontend auth-service booking-service
```

Health check:

```bash
curl http://localhost:8080/health
```

Open in browser:

```text
http://YOUR_VM_EXTERNAL_IP:3000
```

## 6. Re-deploy After Code Changes

```bash
git pull
docker compose -f infra/docker-compose.yml up --build -d
docker compose -f infra/docker-compose.yml ps
```

## 7. Production Upgrade Path

After the VM demo is stable, move incrementally:

```text
MySQL container -> Cloud SQL for MySQL
Plain env files -> Secret Manager
Compose VM services -> Cloud Run services
VM public IP -> HTTPS Load Balancer or custom domain
```

Official Google Cloud references:

```text
Cloud Run deploy containers: https://docs.cloud.google.com/run/docs/deploying
Cloud SQL from Cloud Run: https://docs.cloud.google.com/sql/docs/mysql/connect-run
Artifact Registry Docker images: https://docs.cloud.google.com/artifact-registry/docs/docker/store-docker-container-images
Cloud Build Docker images: https://docs.cloud.google.com/build/docs/building/build-containers
```
