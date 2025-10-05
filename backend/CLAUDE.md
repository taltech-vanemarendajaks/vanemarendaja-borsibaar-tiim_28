# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Borsibaar backend Java codebase.

## Backend Overview

Borsibaar backend is a Spring Boot 3.5.5 application using Java 21, designed as a stock exchange/trading platform ("börsibaari" in Estonian means "stock bar"). The system manages organizations, users, products, categories, and inventory with transaction tracking.

**IMPORTANT**: The backend runs entirely inside Docker containers. All development, building, testing, and debugging should be done through Docker.

## Core Domain Model

The application follows a multi-tenant architecture where each organization has its own:
- **Products**: Items with pricing (base/min/max prices), organized into categories
- **Categories**: Product groupings with dynamic pricing flags
- **Inventory**: Current stock quantities per product
- **Inventory Transactions**: Audit trail of stock changes (SALE, PURCHASE, ADJUSTMENT, RETURN, TRANSFER_IN, TRANSFER_OUT, INITIAL)
- **Users**: Organization members with roles (USER, ADMIN)

Key entities:
- `Organization` - Tenant root entity
- `User` - OAuth2 authenticated users with organization membership
- `Product` - Catalog items with pricing and categories
- `Category` - Product categorization with dynamic pricing control
- `Inventory` - Current stock levels (quantity must be non-negative)
- `InventoryTransaction` - Immutable transaction log with quantity changes

## Architecture & Package Structure

```
src/main/java/com/borsibaar/backend/
├── BorsibaarApplication.java      # Main Spring Boot application
├── config/
│   └── SecurityConfig.java       # OAuth2 + CORS configuration
├── controller/                   # REST API endpoints
│   ├── AuthController.java       # OAuth2 authentication
│   ├── AccountController.java    # User account management
│   ├── OrganizationController.java
│   ├── ProductController.java
│   ├── CategoryController.java
│   └── InventoryController.java  # Stock management operations
├── service/                      # Business logic layer
│   ├── AuthService.java         # OAuth2 + JWT token handling
│   ├── JwtService.java          # JWT token operations
│   ├── OrganizationService.java
│   ├── ProductService.java
│   ├── CategoryService.java
│   └── InventoryService.java    # Complex stock operations & transactions
├── repository/                   # Spring Data JPA repositories
├── entity/                      # JPA entities (using Lombok)
├── dto/                         # Request/Response DTOs
├── mapper/                      # MapStruct entity-DTO mappers
└── exception/                   # Custom exception handling
```

## Database Schema & Migrations

**CRITICAL**: All database schema changes are managed in a single Liquibase file:
- `src/main/resources/db/changelog/db.changelog-master.yaml`

This file contains the complete database schema evolution with numbered changesets:
- 000-enable-citext: PostgreSQL case-insensitive text extension
- 001-create-organizations: Base tenant table
- 002-create-roles: USER/ADMIN roles
- 003-create-users: OAuth2 users with organization membership
- 004-add-users-fks: Foreign key constraints
- 005-insert-roles: Default role data
- 006-create-categories: Product categorization
- 007-create-products: Product catalog with pricing
- 008-create-inventory: Current stock tracking
- 009-create-inventory-transactions: Stock change audit log
- 010-seed-bar-inventory: Sample data for TalTech ITÜK organization

**Important constraints**:
- Organizations, products, and categories use case-insensitive CITEXT for names
- Inventory quantities must be non-negative (CHECK constraint)
- Unique constraints prevent duplicate names within organizations
- All timestamp fields use TIMESTAMPTZ (PostgreSQL timezone-aware timestamps)

## Docker Development Commands

**All backend operations must be performed through Docker containers.**

```bash
# Start the full development environment (from project root)
docker compose up

# Start only backend and database
docker compose up postgres backend

# Run backend in development mode (with hot reload)
docker compose up backend

# Execute commands inside the running backend container
docker compose exec backend ./mvnw clean package
docker compose exec backend ./mvnw test
docker compose exec backend ./mvnw spring-boot:run

# Run tests inside container
docker compose exec backend ./mvnw test

# Run single test class inside container
docker compose exec backend ./mvnw test -Dtest=ClassNameTest

# Run tests for specific package inside container
docker compose exec backend ./mvnw test -Dtest="com.borsibaar.backend.service.*"

# Build the backend inside container
docker compose exec backend ./mvnw clean package

# Access backend container shell for debugging
docker compose exec backend bash

# View backend logs
docker compose logs -f backend

# Restart backend service
docker compose restart backend
```

## Key Technologies & Dependencies

- **Spring Boot 3.5.5** with Spring Security, Data JPA, OAuth2 Client
- **PostgreSQL** with Liquibase migrations
- **JWT** tokens (jjwt library) for API authentication
- **MapStruct** for entity-DTO mapping
- **Lombok** for boilerplate reduction
- **Spring DotEnv** for environment variable management
- **Docker** for containerized development and deployment

## Configuration

Environment variables (loaded via Spring DotEnv from `.env` files):
- `SPRING_DATASOURCE_URL/USERNAME/PASSWORD` - PostgreSQL connection
- `GOOGLE_CLIENT_ID/CLIENT_SECRET` - OAuth2 Google integration
- `JWT_SECRET` - JWT token signing key

CORS is configured for `http://localhost:3000` (frontend development).

## Authentication & Security

- OAuth2 with Google as provider
- JWT tokens for API authentication
- Organization-based authorization (users can only access their organization's data)
- CORS enabled for frontend integration
- Currently excludes `SecurityAutoConfiguration` in main application class

## Inventory System

The inventory system supports:
- **Stock tracking**: Real-time quantity management per product
- **Transaction logging**: Immutable audit trail of all stock changes
- **Stock operations**: Add, remove, adjust inventory with automatic transaction creation
- **Multi-tenant isolation**: Each organization manages its own inventory
- **Atomic operations**: Stock changes and transaction logging happen atomically

Transaction types: SALE, PURCHASE, ADJUSTMENT, RETURN, TRANSFER_IN, TRANSFER_OUT, INITIAL

## Testing Strategy

When writing tests inside Docker containers:
- Use `@SpringBootTest` for integration tests
- Test repositories with `@DataJpaTest`
- Mock services in controller tests
- Test security configuration with `@SpringSecurity` test annotations
- Ensure organization-based data isolation in tests
- Always run tests via `docker compose exec backend ./mvnw test`

## Debugging

For debugging the backend:
1. Use `docker compose logs -f backend` to view application logs
2. Access the container shell with `docker compose exec backend bash`
3. Check application properties and environment variables inside container
4. Use Docker port mapping to connect external debugging tools if needed