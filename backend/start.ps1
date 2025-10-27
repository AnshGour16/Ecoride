Write-Host "Starting EcoRide Backend Server..."
$env:PORT = "3000"
$env:DB_HOST = "localhost"
$env:DB_USER = "root"
$env:DB_PASSWORD = "1234"
$env:DB_NAME = "ecoride_db"
$env:DB_PORT = "3306"
$env:JWT_SECRET = "agbxywgw12yjgwfuiew"
$env:NODE_ENV = "development"

npm install
node src/app.js
