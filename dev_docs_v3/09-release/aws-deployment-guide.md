# Ultra TMS — AWS Deployment Guide

> **Cost:** ~$23/month for Production + Staging
> **Time:** ~30 minutes per server
> **Difficulty:** Beginner-friendly

---

## Architecture Overview

```
Production Server (t3.small — $15/mo)
├── Docker: ultra-tms-api (NestJS, port 3001)
├── Docker: ultra-tms-web (Next.js, port 3000)
├── Docker: postgres (PostgreSQL 15, port 5432)
├── Docker: redis (Redis 7, port 6379)
├── Nginx reverse proxy (ports 80/443)
└── Certbot SSL (free, auto-renewing)

Staging Server (t3.micro — free tier or $8/mo)
└── Same stack, different branch + test data
```

---

## Prerequisites

- [ ] AWS account (https://aws.amazon.com)
- [ ] Domain name (optional — can use raw IP initially)
- [ ] GitHub repo access (`rabih-ultra-tms/Ultra-TMS`)

---

## Part 1: AWS Console Setup (~10 min)

### 1.1 — Create a Key Pair (one time, used for both servers)

1. AWS Console → EC2 → **Key Pairs** (left sidebar)
2. **Create key pair**
   - Name: `ultra-tms`
   - Type: RSA
   - Format: `.pem`
3. File downloads automatically — **save it, you cannot re-download**
4. On your local machine:
   ```bash
   mkdir -p ~/.ssh
   mv ~/Downloads/ultra-tms.pem ~/.ssh/
   chmod 400 ~/.ssh/ultra-tms.pem
   ```

### 1.2 — Create a Security Group

1. EC2 → **Security Groups** → **Create security group**
2. Name: `ultra-tms-sg`
3. Inbound rules:
   | Type | Port | Source |
   |-------|------|-------------------|
   | SSH | 22 | My IP |
   | HTTP | 80 | Anywhere (0.0.0.0/0) |
   | HTTPS | 443 | Anywhere (0.0.0.0/0) |
4. Click **Create**

### 1.3 — Launch EC2 Instances

Launch **two** instances with these settings:

| Setting        | Production       | Staging             |
| -------------- | ---------------- | ------------------- |
| Name           | `ultra-tms-prod` | `ultra-tms-staging` |
| AMI            | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS    |
| Instance type  | **t3.small**     | **t3.micro**        |
| Key pair       | `ultra-tms`      | `ultra-tms`         |
| Security group | `ultra-tms-sg`   | `ultra-tms-sg`      |
| Storage        | 25 GB gp3        | 20 GB gp3           |

### 1.4 — Attach Elastic IPs

Do this for **both** instances:

1. EC2 → **Elastic IPs** → **Allocate Elastic IP address** → Allocate
2. Select it → **Actions → Associate** → pick the instance
3. Record your IPs:
   - Production IP: `___.___.___.___`
   - Staging IP: `___.___.___.___`

### 1.5 — Point Your Domain (if you have one)

In your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

| Record                 | Type | Value          |
| ---------------------- | ---- | -------------- |
| `ultratms.com`         | A    | `<PROD_IP>`    |
| `staging.ultratms.com` | A    | `<STAGING_IP>` |

> No domain yet? Skip this — use `http://<IP>` for now.

---

## Part 2: Server Setup (~20 min per server)

### 2.1 — SSH into the server

```bash
# For production:
ssh -i ~/.ssh/ultra-tms.pem ubuntu@<PROD_IP>

# For staging:
ssh -i ~/.ssh/ultra-tms.pem ubuntu@<STAGING_IP>
```

### 2.2 — Run the setup script

Paste this entire block into the SSH terminal:

```bash
#!/bin/bash
set -e

echo "=== [1/7] Installing system packages ==="
sudo apt update && sudo apt install -y docker.io docker-compose-v2 nginx certbot python3-certbot-nginx git
sudo systemctl enable docker && sudo usermod -aG docker $USER

echo "=== [2/7] Creating swap file (prevents OOM on small instances) ==="
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

echo "=== [3/7] Cloning repository ==="
cd ~ && git clone https://github.com/rabih-ultra-tms/Ultra-TMS.git && cd Ultra-TMS

echo "=== [4/7] Generating secrets ==="
cat > .env << EOF
NODE_ENV=production
DB_USER=postgres
DB_PASSWORD=$(openssl rand -hex 16)
DB_NAME=ultra_tms
JWT_SECRET=$(openssl rand -hex 32)
REDIS_PASSWORD=$(openssl rand -hex 16)
CUSTOMER_PORTAL_JWT_SECRET=$(openssl rand -hex 32)
CARRIER_PORTAL_JWT_SECRET=$(openssl rand -hex 32)
CORS_ALLOWED_ORIGINS=*
EOF

DB_PASS=$(grep DB_PASSWORD .env | cut -d= -f2)
REDIS_PASS=$(grep REDIS_PASSWORD .env | cut -d= -f2)
echo "DATABASE_URL=postgresql://postgres:${DB_PASS}@postgres:5432/ultra_tms" >> .env
echo "REDIS_URL=redis://:${REDIS_PASS}@redis:6379" >> .env

echo "=== [5/7] Building & starting containers (takes ~10 min first time) ==="
sg docker -c "docker compose -f docker-compose.prod.yml up -d --build"

echo "=== [6/7] Waiting for services to start ==="
sleep 30

echo "=== [7/7] Running database migrations ==="
sg docker -c "docker exec ultra-tms-api npx prisma migrate deploy"

echo ""
echo "========================================="
echo "  SETUP COMPLETE"
echo "  App running at: http://$(curl -s ifconfig.me)"
echo "========================================="
echo ""
echo "SAVE THESE CREDENTIALS:"
echo "-----------------------------------------"
cat .env
echo "-----------------------------------------"
```

### 2.3 — For staging: checkout your dev branch

After the script completes on the **staging** server:

```bash
cd ~/Ultra-TMS
git checkout develop    # or your testing branch
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Part 3: Nginx + SSL (~5 min per server)

### 3.1 — Configure Nginx reverse proxy

```bash
# Set your domain (or use _ for IP-only access)
DOMAIN="ultratms.com"              # Production
# DOMAIN="staging.ultratms.com"    # Staging

sudo tee /etc/nginx/sites-available/ultra-tms << 'NGINX'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

sudo sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/" /etc/nginx/sites-available/ultra-tms
sudo ln -sf /etc/nginx/sites-available/ultra-tms /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

### 3.2 — Add free SSL certificate (requires domain pointed first)

```bash
sudo certbot --nginx -d $DOMAIN
# Follow prompts — select "redirect HTTP to HTTPS"
```

> SSL auto-renews via certbot's systemd timer. No maintenance needed.

---

## Part 4: Verify Deployment

```bash
# On the server:
docker ps                                        # 4 containers running
curl -s http://localhost:3001/api/v1/health       # API responds
curl -s http://localhost:3000                     # Web loads

# From your browser:
# http://<YOUR_IP>           (before SSL)
# https://ultratms.com       (after SSL)
```

---

## Day-to-Day Operations

### Deploy updates

```bash
ssh -i ~/.ssh/ultra-tms.pem ubuntu@<IP>
cd ~/Ultra-TMS
git pull
docker compose -f docker-compose.prod.yml up -d --build
# Only if Prisma schema changed:
docker exec ultra-tms-api npx prisma migrate deploy
```

### Staging → Production workflow

```
1. Push code to `develop` branch
2. SSH into STAGING → git pull → rebuild → test
3. Merge `develop` into `main` on GitHub
4. SSH into PROD → git pull → rebuild
```

### View logs

```bash
docker logs ultra-tms-api --tail 100 -f     # API logs (live)
docker logs ultra-tms-web --tail 100 -f     # Web logs (live)
docker logs ultra-tms-postgres --tail 50    # Database logs
```

### Restart a service

```bash
docker restart ultra-tms-api    # Restart just the API
docker restart ultra-tms-web    # Restart just the frontend
```

### Restart everything

```bash
cd ~/Ultra-TMS
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Database backup (manual)

```bash
docker exec ultra-tms-postgres pg_dump -U postgres ultra_tms > backup_$(date +%Y%m%d).sql
```

### Database restore

```bash
cat backup_20260318.sql | docker exec -i ultra-tms-postgres psql -U postgres ultra_tms
```

---

## Automated Daily Backups (optional)

```bash
# Create backup script
sudo tee /usr/local/bin/backup-tms.sh << 'SCRIPT'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR
docker exec ultra-tms-postgres pg_dump -U postgres ultra_tms | gzip > "$BACKUP_DIR/ultra_tms_$(date +%Y%m%d_%H%M).sql.gz"
# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
SCRIPT

sudo chmod +x /usr/local/bin/backup-tms.sh

# Schedule daily at 3am
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/backup-tms.sh") | crontab -
```

---

## Update CORS for Production

Once you have your domain, update `.env` on the prod server:

```bash
cd ~/Ultra-TMS
nano .env
# Change: CORS_ALLOWED_ORIGINS=https://ultratms.com
docker restart ultra-tms-api
```

---

## Troubleshooting

| Problem                | Fix                                                       |
| ---------------------- | --------------------------------------------------------- |
| Container won't start  | `docker logs ultra-tms-api` — check error                 |
| Out of memory          | `free -h` — if swap is full, upgrade to t3.medium         |
| Can't SSH              | Check security group allows port 22 from your IP          |
| 502 Bad Gateway        | `docker ps` — container probably crashed, check logs      |
| SSL won't issue        | Make sure domain A record points to the right IP          |
| Prisma migration fails | `docker exec -it ultra-tms-api npx prisma migrate status` |
| Disk full              | `docker system prune -a` to remove old images             |

---

## Cost Summary

| Item                   | Monthly         |
| ---------------------- | --------------- |
| EC2 t3.small (prod)    | $15.18          |
| EC2 t3.micro (staging) | Free\* / $8.47  |
| Elastic IPs (2)        | Free (attached) |
| Storage (45 GB)        | ~$3.60          |
| SSL (Certbot)          | Free            |
| **Total**              | **~$19-27/mo**  |

\* t3.micro is free for 12 months with AWS free tier.

---

## Future Upgrades (when you need them)

| Signal                             | Upgrade to                    | Cost     |
| ---------------------------------- | ----------------------------- | -------- |
| Hitting RAM/CPU limits             | t3.medium (4GB)               | $30/mo   |
| Need managed DB backups + failover | RDS PostgreSQL                | +$70/mo  |
| Need zero-downtime deploys         | ECS Fargate                   | +$120/mo |
| Need CDN for static assets         | CloudFront                    | +$5/mo   |
| Need full HA architecture          | ALB + ECS + RDS + ElastiCache | ~$260/mo |
