# 🚀 Guía de Despliegue - Puestos

Esta guía te ayudará a desplegar el sistema completo de gestión de puestos usando Docker y Docker Compose.

## 📋 Requisitos Previos

- Docker 20.10+ 
- Docker Compose 2.0+
- Git (opcional, para clonar el repositorio)

## 🗂️ Estructura del Proyecto

```
puestos/
├── backend/           # FastAPI + SQLAlchemy
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
├── frontend/          # React + Vite + TypeScript
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── docker-compose.yml
├── docker-compose.override.yml
└── .env
```

## 🚀 Despliegue Rápido

### 1. Clonar o descargar el proyecto

```bash
cd puestos
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y edita según tus necesidades:

```bash
# Windows PowerShell
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edita el archivo `.env` y cambia las contraseñas por valores seguros:

```env
POSTGRES_PASSWORD=tu_contraseña_segura_aqui
SECRET_KEY=tu_clave_secreta_muy_larga_y_segura
ADMIN_PASSWORD=tu_contraseña_admin_segura
```

⚠️ **IMPORTANTE**: Nunca uses las contraseñas por defecto en producción.

### 3. Iniciar los servicios

```bash
# Construir e iniciar todos los servicios
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### 4. Verificar el despliegue

Una vez iniciados los servicios:

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### 5. Acceder al panel de administración

- URL: http://localhost/admin
- Email: El valor de `ADMIN_EMAIL` en tu archivo `.env`
- Contraseña: El valor de `ADMIN_PASSWORD` en tu archivo `.env`

## 🛠️ Comandos Útiles

### Gestión de contenedores

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ BORRA TODOS LOS DATOS)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend
docker-compose restart frontend

# Reconstruir un servicio específico
docker-compose up -d --build backend
```

### Ver estado y logs

```bash
# Ver estado de los contenedores
docker-compose ps

# Ver uso de recursos
docker stats

# Ver logs completos
docker-compose logs

# Ver últimas 100 líneas
docker-compose logs --tail=100
```

### Acceso a la base de datos

```bash
# Acceder a PostgreSQL
docker-compose exec db psql -U postgres -d puestos

# Backup de la base de datos
docker-compose exec db pg_dump -U postgres puestos > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar base de datos
docker-compose exec -T db psql -U postgres -d puestos < backup.sql
```

### Acceso a los contenedores

```bash
# Acceder al contenedor del backend
docker-compose exec backend /bin/sh

# Acceder al contenedor de la base de datos
docker-compose exec db /bin/sh

# Ver archivos en uploads
docker-compose exec backend ls -la /app/uploads
```

## 🔧 Desarrollo

### Modo Desarrollo (con hot-reload)

El archivo `docker-compose.override.yml` está configurado para desarrollo:

```bash
# Iniciar en modo desarrollo (hot-reload automático en backend)
docker-compose up -d

# El backend se reiniciará automáticamente al hacer cambios en el código
```

### Desarrollo local sin Docker

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔒 Seguridad

### Antes de poner en producción:

1. **Cambiar todas las contraseñas por defecto** en `.env`
2. **Generar un SECRET_KEY seguro**:
   ```bash
   openssl rand -hex 32
   ```
3. **Configurar HTTPS** (usar reverse proxy como Nginx o Traefik)
4. **Limitar acceso a la base de datos** (no exponer puerto 5432)
5. **Configurar firewall** para permitir solo puertos necesarios

## 🔍 Solución de Problemas

### Los contenedores no inician

```bash
# Ver errores detallados
docker-compose logs

# Verificar configuración
docker-compose config
```

### Error de conexión a la base de datos

```bash
# Verificar que la base de datos esté saludable
docker-compose ps

# Reiniciar la base de datos
docker-compose restart db
```

### Error "Connection refused" al backend

```bash
# Verificar que el backend esté saludable
docker-compose ps

# Ver logs del backend
docker-compose logs backend
```

### Permisos de archivos (Linux/Mac)

```bash
# Arreglar permisos de uploads
sudo chown -R 1001:1001 uploads/
```

### Limpieza completa

```bash
# Detener todo y eliminar volúmenes, redes e imágenes
docker-compose down -v --rmi all

# Limpiar sistema Docker (⚠️ Elimina datos no utilizados)
docker system prune -a
```

## 📊 Monitoreo

### Health Checks

Todos los servicios tienen health checks configurados:

```bash
# Ver estado de salud
docker-compose ps

# Inspeccionar health check
docker inspect --format='{{.State.Health.Status}}' puestos-backend
docker inspect --format='{{.State.Health.Status}}' puestos-frontend
```

## 🔄 Actualizaciones

### Actualizar a una nueva versión

```bash
# 1. Detener servicios
docker-compose down

# 2. Obtener últimos cambios (si usas git)
git pull

# 3. Reconstruir imágenes
docker-compose build --no-cache

# 4. Iniciar servicios
docker-compose up -d
```

### Actualizar dependencias

```bash
# Backend: actualizar requirements.txt
cd backend
pip freeze > requirements.txt

# Frontend: actualizar package.json
cd frontend
npm update
```

## 💾 Backup y Restauración

### Backup completo

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)

# Backup base de datos
docker-compose exec -T db pg_dump -U postgres puestos > backup_${DATE}.sql

# Backup uploads
tar -czf uploads_${DATE}.tar.gz uploads/

echo "Backup completado: backup_${DATE}.sql y uploads_${DATE}.tar.gz"
```

### Restauración

```bash
# Restaurar base de datos
docker-compose exec -T db psql -U postgres -d puestos < backup_xxxx.sql

# Restaurar uploads
tar -xzf uploads_xxxx.tar.gz
```

## 🌐 Configuración con Reverse Proxy (Producción)

Para producción, se recomienda usar un reverse proxy como Nginx o Traefik:

### Ejemplo con Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📝 Notas

- La base de datos usa un volumen persistente (`pgdata`)
- Los archivos subidos se almacenan en el volumen `uploads`
- En desarrollo, el backend usa hot-reload automático
- El frontend se sirve con Nginx optimizado para producción

## 🤝 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs`
2. Verifica la configuración: `docker-compose config`
3. Comprueba el estado: `docker-compose ps`

---

**Versión**: 1.0  
**Última actualización**: 2024
