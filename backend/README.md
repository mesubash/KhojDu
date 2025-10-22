# 🏠 KhojDu Backend

**Nepal's Premier Rental Property Platform - Backend API**

A comprehensive Spring Boot application providing REST APIs for property listings, user management, reviews, messaging, and more.

## 🌟 Features

### 🎯 **Core Features**
- **Multi-role Authentication** (Tenant/Landlord/Admin)
- **Property Management** with rich media support
- **Advanced Search & Filtering** with location-based queries
- **Real-time Messaging** between tenants and landlords
- **Review & Rating System** for transparency
- **Complaint Management** for platform moderation
- **Wishlist Management** for users
- **Analytics & Tracking** for property performance

### 🔧 **Technical Features**
- **JWT-based Authentication** with refresh tokens
- **File Upload** with Cloudinary integration
- **Email Notifications** with Thymeleaf templates
- **Full-text Search** with PostgreSQL
- **Caching** with Redis
- **Database Migrations** with Flyway
- **API Documentation** with Swagger/OpenAPI
- **Docker Support** for easy deployment

## 🛠️ Tech Stack

- **Framework:** Spring Boot 3.2.0
- **Security:** Spring Security + JWT
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **ORM:** Spring Data JPA (Hibernate)
- **Migration:** Flyway
- **Documentation:** Swagger/OpenAPI
- **File Storage:** Cloudinary
- **Email:** Spring Mail + Thymeleaf
- **Build Tool:** Maven
- **Java:** 17+

## 🚀 Quick Start

### Prerequisites

- Java 17 or higher
- PostgreSQL 15+
- Redis 7+
- Maven 3.8+
- Cloudinary account (for file uploads)
- Email service (Gmail recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/mesubash/khojdu.git
cd khojdu
```

### 2. Database Setup

```bash
# Start PostgreSQL and create database
createdb khojdu

# Or using Docker
docker run --name khojdu-postgres -e POSTGRES_DB=khojdu -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine
```

### 3. Redis Setup

```bash
# Start Redis
redis-server

# Or using Docker
docker run --name khojdu-redis -p 6379:6379 -d redis:7-alpine
```

### 4. Environment Configuration

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update `src/main/resources/application.yml` with your configurations:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/khojdu
    username: postgres
    password: your_password
  
  data:
    redis:
      host: localhost
      port: 6379

# Add your email and Cloudinary credentials
```

### 5. Build and Run

```bash
# Build the application
mvn clean package

# Run the application
mvn spring-boot:run

# Or run the JAR directly
java -jar target/khojdu-backend-1.0.0.jar
```

The application will be available at:
- **API:** http://localhost:8080/api
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **Health Check:** http://localhost:8080/api/actuator/health

## 🐳 Docker Setup

### Using Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL + Redis + Backend)
docker-compose up -d

# For development with separate database
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f khojdu-backend

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build the image
docker build -t khojdu-backend .

# Run the container
docker run -p 8080:8080 --env-file .env khojdu-backend
```

## 📚 API Documentation

### Interactive Documentation
Visit http://localhost:8080/swagger-ui.html after starting the application.

### Key Endpoints

#### Authentication
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - User login
POST /api/auth/refresh     - Refresh access token
POST /api/auth/logout      - User logout
```

#### Properties
```
GET    /api/properties/search        - Search properties
GET    /api/properties/{id}          - Get property details
POST   /api/properties               - Create property (Landlord)
PUT    /api/properties/{id}          - Update property (Landlord)
DELETE /api/properties/{id}          - Delete property (Landlord)
```

#### Users
```
GET /api/users/profile     - Get user profile
PUT /api/users/profile     - Update user profile
```

#### Wishlist
```
GET    /api/wishlist           - Get user wishlist
POST   /api/wishlist/{id}     - Add to wishlist
DELETE /api/wishlist/{id}     - Remove from wishlist
```

## 🗄️ Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users** - User accounts with roles
- **Properties** - Property listings with rich details
- **Property Images** - Multiple images per property
- **Amenities** - Property amenities and features
- **Reviews** - User reviews and ratings
- **Inquiries** - Communication between users
- **Complaints** - Platform moderation
- **Notifications** - User notifications
- **Wishlists** - User saved properties

### Database Migrations

Flyway handles all database migrations automatically:

```sql
-- Located in src/main/resources/db/migration/
V1__Create_initial_tables.sql
V2__Insert_default_amenities.sql
V3__Insert_app_settings.sql
V4__Create_indexes.sql
V5__Create_triggers.sql
```

## 🔒 Security

### Authentication Flow
1. User registers/logs in → JWT access token + refresh token
2. Access token expires in 24 hours
3. Refresh token used to get new access token
4. All protected endpoints require valid JWT

### Role-based Authorization
- **TENANT** - Search properties, create reviews, send inquiries
- **LANDLORD** - All tenant permissions + create/manage properties
- **ADMIN** - All permissions + user management + platform moderation

### Security Features
- Password hashing with BCrypt
- JWT tokens with expiration
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Rate limiting (via Nginx)

## 📧 Email Configuration

### Gmail Setup
1. Enable 2FA on your Google account
2. Generate an App Password
3. Use App Password in configuration

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password
```

### Email Templates
Located in `src/main/resources/templates/email/`:
- `welcome.html` - Welcome new users
- `verification.html` - Email verification
- `password-reset.html` - Password reset

## 📁 File Upload

### Cloudinary Integration
```yaml
file:
  cloudinary:
    cloud-name: your-cloud-name
    api-key: your-api-key
    api-secret: your-api-secret
```

### Supported File Types
- **Images:** JPEG, JPG, PNG, WebP (max 10MB)
- **Documents:** PDF, DOC, DOCX (max 25MB)

## 🔧 Configuration

### Application Profiles
- **dev** - Development environment
- **prod** - Production environment
- **test** - Testing environment

### Key Configuration Properties
```yaml
# JWT Settings
app:
  jwt:
    secret: your-secret-key
    expiration: 86400000  # 24 hours

# File Upload
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 50MB

# Pagination
pagination:
  default-page-size: 20
  max-page-size: 100
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=PropertyControllerTest

# Run tests with coverage
mvn test jacoco:report
```

### Test Categories
- **Unit Tests** - Service layer logic
- **Integration Tests** - Controller endpoints
- **Repository Tests** - Database operations

## 📊 Monitoring & Health

### Actuator Endpoints
- `/api/actuator/health` - Health check
- `/api/actuator/metrics` - Application metrics
- `/api/actuator/info` - Application information

### Logging
- **Console Logging** - Development
- **File Logging** - Production (`logs/khojdu-backend.log`)
- **Structured Logging** - JSON format for production

## 🚀 Deployment

### Production Checklist
1. Set strong JWT secret
2. Configure production database
3. Set up SSL certificates
4. Configure email service
5. Set up file storage
6. Enable monitoring
7. Set up backups

### Environment Variables
```bash
# Database
DB_USERNAME=postgres
DB_PASSWORD=secure_password

# Security
JWT_SECRET=super-secure-jwt-secret-key

# Email
MAIL_USERNAME=noreply@khojdu.com
MAIL_PASSWORD=app-password

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

### Docker Production Deployment
```bash
# Build and deploy
docker-compose -f docker-compose.yml up -d

# Scale the application
docker-compose up -d --scale khojdu-backend=3
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow Java conventions
- Use Lombok for boilerplate reduction
- Write comprehensive tests
- Document public APIs
- Use meaningful commit messages

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check database exists
psql -h localhost -U postgres -l
```

**Redis Connection Issues**