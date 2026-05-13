#!/bin/bash

# ==========================================
# Script de Despliegue - Puestos
# ==========================================
# Este script facilita el despliegue del sistema
# Uso: ./deploy.sh [comando]
# ==========================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado"
        exit 1
    fi
    
    print_success "Docker y Docker Compose están instalados"
}

# Verificar archivo .env
check_env() {
    if [ ! -f .env ]; then
        print_warning "Archivo .env no encontrado"
        print_status "Copiando .env.example a .env"
        cp .env.example .env
        print_warning "Por favor, edita el archivo .env con tus configuraciones antes de continuar"
        exit 1
    fi
    print_success "Archivo .env encontrado"
}

# Despliegue completo
deploy() {
    print_status "Iniciando despliegue..."
    
    check_docker
    check_env
    
    print_status "Construyendo e iniciando servicios..."
    docker-compose up -d --build
    
    print_status "Esperando a que los servicios estén listos..."
    sleep 10
    
    print_status "Verificando estado de los servicios..."
    docker-compose ps
    
    print_success "Despliegue completado!"
    echo ""
    echo -e "${GREEN}Accesos:${NC}"
    echo -e "  Frontend: ${BLUE}http://localhost${NC}"
    echo -e "  API: ${BLUE}http://localhost:8000${NC}"
    echo -e "  Documentación: ${BLUE}http://localhost:8000/docs${NC}"
    echo ""
}

# Actualización
update() {
    print_status "Actualizando servicios..."
    
    print_status "Deteniendo servicios..."
    docker-compose down
    
    print_status "Eliminando imágenes antiguas..."
    docker-compose rm -f
    
    print_status "Reconstruyendo servicios..."
    docker-compose up -d --build
    
    print_success "Actualización completada!"
}

# Backup
backup() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="backups"
    
    mkdir -p $BACKUP_DIR
    
    print_status "Creando backup..."
    
    # Backup de base de datos
    docker-compose exec -T db pg_dump -U postgres puestos > "$BACKUP_DIR/backup_${TIMESTAMP}.sql"
    print_success "Backup de base de datos: $BACKUP_DIR/backup_${TIMESTAMP}.sql"
    
    # Backup de uploads
    if [ -d "uploads" ]; then
        tar -czf "$BACKUP_DIR/uploads_${TIMESTAMP}.tar.gz" uploads/
        print_success "Backup de uploads: $BACKUP_DIR/uploads_${TIMESTAMP}.tar.gz"
    fi
    
    print_success "Backup completado!"
}

# Logs
logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Estado
status() {
    docker-compose ps
}

# Detener
stop() {
    print_status "Deteniendo servicios..."
    docker-compose down
    print_success "Servicios detenidos"
}

# Limpieza completa
cleanup() {
    print_warning "Esto eliminará TODOS los datos, volúmenes e imágenes"
    read -p "¿Estás seguro? (s/N): " confirm
    
    if [[ $confirm == [sS] ]]; then
        print_status "Limpiando..."
        docker-compose down -v --rmi all
        docker system prune -f
        print_success "Limpieza completada"
    else
        print_status "Operación cancelada"
    fi
}

# Menú de ayuda
show_help() {
    echo "Uso: ./deploy.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  deploy    - Desplegar el sistema completo"
    echo "  update    - Actualizar servicios"
    echo "  backup    - Crear backup de datos"
    echo "  logs      - Ver logs (opcional: servicio)"
    echo "  status    - Ver estado de los servicios"
    echo "  stop      - Detener todos los servicios"
    echo "  cleanup   - Limpieza completa (⚠️ elimina datos)"
    echo "  help      - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./deploy.sh deploy"
    echo "  ./deploy.sh logs backend"
    echo "  ./deploy.sh backup"
}

# Main
case "${1:-help}" in
    deploy)
        deploy
        ;;
    update)
        update
        ;;
    backup)
        backup
        ;;
    logs)
        logs "$2"
        ;;
    status)
        status
        ;;
    stop)
        stop
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Comando no reconocido: $1"
        show_help
        exit 1
        ;;
esac
