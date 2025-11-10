# Docker MySQL Setup for Ecoride

This guide helps you set up MySQL using Docker for development while keeping the codebase compatible with local MySQL installations.

## Quick Start

1. **Start MySQL with Docker:**
   ```bash
   docker-compose up -d mysql
   ```

2. **Wait for MySQL to be ready:**
   ```bash
   docker-compose logs -f mysql
   ```
   Wait until you see "ready for connections" message.

3. **Create your environment file:**
   Copy `.env.docker.example` to `.env` and update if needed.

4. **Start the backend:**
   ```bash
   cd backend
   npm start
   ```

## What's Included

### MySQL Container
- **Image**: MySQL 8.0
- **Port**: 3306 (same as default MySQL)
- **Database**: ecoride
- **Username**: ecoride_user
- **Password**: ecoride_password
- **Root Password**: rootpassword

### Automatic Database Setup
The container automatically runs these SQL files on first startup:
- `database/schema.sql` - Database structure
- `database/setup.sql` - Initial setup
- `database/car_data_fixed.sql` - Sample car data
- `database/update_payments.sql` - Payment gateway updates

### phpMyAdmin (Optional)
- **URL**: http://localhost:8080
- **Username**: ecoride_user
- **Password**: ecoride_password

## Docker Commands

### Start Services
```bash
# Start MySQL only
docker-compose up -d mysql

# Start MySQL + phpMyAdmin
docker-compose up -d

# Start with logs
docker-compose up mysql
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes all data)
docker-compose down -v
```

### Database Management
```bash
# Connect to MySQL CLI
docker-compose exec mysql mysql -u ecoride_user -p ecoride

# View logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

### Backup & Restore
```bash
# Create backup
docker-compose exec mysql mysqldump -u root -prootpassword ecoride > backup.sql

# Restore from backup
docker-compose exec -i mysql mysql -u root -prootpassword ecoride < backup.sql
```

## Environment Configuration

The application will work with both Docker and local MySQL setups by using environment variables.

### For Docker (recommended for you):
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecoride
DB_USER=ecoride_user
DB_PASSWORD=ecoride_password
```

### For Local MySQL (for team members):
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecoride
DB_USER=root
DB_PASSWORD=your_mysql_password
```

## Troubleshooting

### Port Already in Use
If port 3306 is already in use, change it in docker-compose.yml:
```yaml
ports:
  - "3307:3306"  # Use port 3307 instead
```
Then update your .env file:
```env
DB_PORT=3307
```

### Container Won't Start
```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs mysql

# Remove and recreate
docker-compose down -v
docker-compose up -d mysql
```

### Permission Issues
```bash
# Reset MySQL data directory
docker-compose down -v
docker volume rm ecoride_mysql_data
docker-compose up -d mysql
```

### Database Schema Issues
If you need to update the database schema:
```bash
# Stop containers
docker-compose down -v

# Update your SQL files in ./database/

# Restart (will recreate database)
docker-compose up -d mysql
```

## Data Persistence

- Database data is stored in a Docker volume `mysql_data`
- Data persists between container restarts
- To completely reset: `docker-compose down -v`

## Team Compatibility

This setup doesn't affect team members who use local MySQL:
- All database connection details are in environment variables
- The application code is unchanged
- Team members can ignore Docker files and use their local setup

## Security Notes

- These credentials are for development only
- Change passwords for production environments
- The MySQL port is exposed for development convenience