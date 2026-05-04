# 1. Instalar todo lo necesario
sudo dnf update -y
sudo dnf install -y httpd php php-json

# 2. Configurar permisos para que puedas subir tus archivos
sudo chown -R ec2-user:apache /var/www/html
sudo chmod -R 775 /var/www/html

# 3. Iniciar el servidor
sudo systemctl enable httpd
sudo systemctl start httpd