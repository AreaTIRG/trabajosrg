# ==========================================
# Script de Despliegue - Puestos (Windows)
# ==========================================
# Este script facilita el despliegue del sistema
# Uso: .\deploy.ps1 [comando]
# ==========================================

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Service
)

# Colores
$Red = "`e[0;31m"
$Green = "`e[0;32m"
$Yellow = "`e[1;33m"
$Blue = "`e[0;34m"
$NC = "`e[0m"

# Funciones de utilidad
function Print-Status($message) {
    Write-Host "$Blue[INFO]$NC $message"
}

function Print-Success($message) {
    Write-Host "$Green[OK]$NC $message"
}

function Print-Warning($message) {
    Write-Host "$Yellow[WARN]$NC $message"
}

function Print-Error($message) {
    Write-Host "$Red[ERROR]$NC $message"
}

# Verificar Docker
function Check-Docker {
    try {
        $null = Get-Command docker -ErrorAction Stop
        $null = Get-Command docker-compose -ErrorAction Stop
        Print-Success "Docker y Docker Compose están instalados"
    } catch {
        Print-Error "Docker o Docker Compose no están instalados"
        exit 1
    }
}

# Verificar archivo .env
function Check-Env {
    if (-not (Test-Path .env)) {
        Print-Warning "Archivo .env no encontrado"
        Print-Status "Copiando .env.example a .env"
        Copy-Item .env.example .env
        Print-Warning "Por favor, edita el archivo .env con tus configuraciones antes de continuar"
        exit 1
    }
    Print-Success "Archivo .env encontrado"
}

# Despliegue
function Deploy {
    Print-Status "Iniciando despliegue..."
    
    Check-Docker
    Check-Env
    
    Print-Status "Construyendo e iniciando servicios..."
    docker-compose up -d --build
    
    Print-Status "Esperando a que los servicios estén listos..."
    Start-Sleep -Seconds 10
    
    Print-Status "Verificando estado de los servicios..."
    docker-compose ps
    
    Print-Success "Despliegue completado!"
    Write-Host ""
    Write-Host "$Green Accesos:$NC"
    Write-Host "  Frontend: $Blue http://localhost $NC"
    Write-Host "  API: $Blue http://localhost:8000 $NC"
    Write-Host "  Documentación: $Blue http://localhost:8000/docs $NC"
    Write-Host ""
}

# Actualización
function Update {
    Print-Status "Actualizando servicios..."
    
    Print-Status "Deteniendo servicios..."
    docker-compose down
    
    Print-Status "Eliminando imágenes antiguas..."
    docker-compose rm -f
    
    Print-Status "Reconstruyendo servicios..."
    docker-compose up -d --build
    
    Print-Success "Actualización completada!"
}

# Backup
function Backup {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = "backups"
    
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir | Out-Null
    }
    
    Print-Status "Creando backup..."
    
    # Backup de base de datos
    docker-compose exec -T db pg_dump -U postgres puestos | Out-File -FilePath "$backupDir\backup_$timestamp.sql" -Encoding utf8
    Print-Success "Backup de base de datos: $backupDir\backup_$timestamp.sql"
    
    # Backup de uploads
    if (Test-Path "uploads") {
        Compress-Archive -Path "uploads" -DestinationPath "$backupDir\uploads_$timestamp.zip" -Force
        Print-Success "Backup de uploads: $backupDir\uploads_$timestamp.zip"
    }
    
    Print-Success "Backup completado!"
}

# Logs
function Show-Logs($service) {
    if ($service) {
        docker-compose logs -f $service
    } else {
        docker-compose logs -f
    }
}

# Estado
function Show-Status {
    docker-compose ps
}

# Detener
function Stop-Services {
    Print-Status "Deteniendo servicios..."
    docker-compose down
    Print-Success "Servicios detenidos"
}

# Limpieza
function Cleanup {
    Print-Warning "Esto eliminará TODOS los datos, volúmenes e imágenes"
    $confirm = Read-Host "¿Estás seguro? (s/N)"
    
    if ($confirm -eq 's' -or $confirm -eq 'S') {
        Print-Status "Limpiando..."
        docker-compose down -v --rmi all
        docker system prune -f
        Print-Success "Limpieza completada"
    } else {
        Print-Status "Operación cancelada"
    }
}

# Ayuda
function Show-Help {
    Write-Host "Uso: .\deploy.ps1 [comando] [servicio]"
    Write-Host ""
    Write-Host "Comandos disponibles:"
    Write-Host "  deploy    - Desplegar el sistema completo"
    Write-Host "  update    - Actualizar servicios"
    Write-Host "  backup    - Crear backup de datos"
    Write-Host "  logs      - Ver logs (opcional: servicio)"
    Write-Host "  status    - Ver estado de los servicios"
    Write-Host "  stop      - Detener todos los servicios"
    Write-Host "  cleanup   - Limpieza completa (⚠️ elimina datos)"
    Write-Host "  help      - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\deploy.ps1 deploy"
    Write-Host "  .\deploy.ps1 logs backend"
    Write-Host "  .\deploy.ps1 backup"
}

# Main
switch ($Command) {
    "deploy" { Deploy }
    "update" { Update }
    "backup" { Backup }
    "logs" { Show-Logs $Service }
    "status" { Show-Status }
    "stop" { Stop-Services }
    "cleanup" { Cleanup }
    "help" { Show-Help }
    "--help" { Show-Help }
    "-h" { Show-Help }
    default {
        Print-Error "Comando no reconocido: $Command"
        Show-Help
        exit 1
    }
}
