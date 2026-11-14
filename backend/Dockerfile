# Stage 1: Build JAR using Maven and JDK 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production executable JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Production JRE Image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy built JAR from builder stage
COPY --from=builder /workspace/target/product-code-manager-1.0.0.jar app.jar

# Expose standard Spring Boot HTTP port
EXPOSE 8080

# Environment variables with sensible production defaults
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/api/v1/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

