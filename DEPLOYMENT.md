# Deployment Guide

## AWS EC2 Deployment

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2
2. Launch Instance:
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t2.medium (minimum)
   - Security Group: Allow ports 22, 80, 443, 8000, 3000
3. Create/Select Key Pair
4. Launch Instance

### Step 2: Connect to Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install Git
sudo apt install git -y
```

### Step 4: Deploy Application

```bash
# Clone repository
git clone <your-repository-url>
cd chatbot-sarvv

# Configure environment
cp .env.example .env
nano .env  # Edit as needed

# Build and run
sudo docker-compose up -d

# Check logs
sudo docker-compose logs -f
```

### Step 5: Configure Nginx (Optional)

```bash
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/chatbot
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/chatbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Alternative: DigitalOcean Deployment

### Using Droplet

1. Create Ubuntu Droplet (2GB RAM minimum)
2. Follow same steps as EC2 deployment
3. Point domain to Droplet IP

### Using App Platform

1. Connect GitHub repository
2. Configure build settings:
   - Backend: Dockerfile
   - Frontend: Node.js
3. Set environment variables
4. Deploy

## Docker Hub Deployment

### Build and Push Images

```bash
# Build images
docker build -t yourusername/chatbot-backend:latest .
docker build -t yourusername/chatbot-frontend:latest ./frontend

# Push to Docker Hub
docker login
docker push yourusername/chatbot-backend:latest
docker push yourusername/chatbot-frontend:latest
```

### Pull and Run on Server

```bash
docker pull yourusername/chatbot-backend:latest
docker pull yourusername/chatbot-frontend:latest
docker-compose up -d
```

## Environment Variables for Production

```env
# Database (Use PostgreSQL in production)
DATABASE_URL=postgresql://user:password@host:5432/chatbot

# CORS
CORS_ORIGINS=https://yourdomain.com

# Logging
LOG_LEVEL=WARNING

# Security
CONFIDENCE_THRESHOLD=0.7
```

## Monitoring & Maintenance

### Check Application Status

```bash
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
```

### Backup Database

```bash
# SQLite
cp chatbot.db chatbot_backup_$(date +%Y%m%d).db

# PostgreSQL
pg_dump -U user chatbot > backup.sql
```

### Update Application

```bash
git pull origin main
docker-compose down
docker-compose up -d --build
```

## Scaling Considerations

1. **Database**: Migrate to PostgreSQL or RDS
2. **Load Balancer**: Use AWS ELB or Nginx
3. **Caching**: Add Redis for session management
4. **CDN**: Use CloudFront for static assets
5. **Monitoring**: Implement CloudWatch or Datadog

## Security Checklist

- [ ] Enable HTTPS with SSL certificate
- [ ] Configure firewall (UFW or Security Groups)
- [ ] Use strong database passwords
- [ ] Implement rate limiting
- [ ] Enable CORS only for trusted domains
- [ ] Regular security updates
- [ ] Backup strategy in place
- [ ] Monitor logs for suspicious activity

## Troubleshooting

**Port already in use:**
```bash
sudo lsof -i :8000
sudo kill -9 <PID>
```

**Docker permission denied:**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

**Database connection error:**
- Check DATABASE_URL in .env
- Verify database service is running
- Check network connectivity

## Cost Estimation (AWS)

- EC2 t2.medium: ~$30/month
- RDS PostgreSQL: ~$15/month
- Data Transfer: ~$5/month
- **Total**: ~$50/month

For detailed pricing, use: https://calculator.aws
