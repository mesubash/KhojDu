# Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app

ENV JAVA_HOME=/opt/java/openjdk
ENV PATH=$JAVA_HOME/bin:$PATH

# Copy Maven files
COPY pom.xml ./
COPY .mvn .mvn

# Verify Java and Maven installation
RUN mvn -version && java -version && javac -version

# Download dependencies
RUN mvn -B -DskipTests dependency:go-offline

# Copy source code
COPY src src

# Build the application (THIS WAS MISSING THE GOAL)
RUN mvn -B -DskipTests clean package

# Runtime stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create non-root user
RUN groupadd -r khojdu && useradd -r -g khojdu khojdu

# Create directories
RUN mkdir -p /app/uploads /app/logs && \
    chown -R khojdu:khojdu /app

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Change ownership
RUN chown khojdu:khojdu app.jar

# Switch to non-root user
USER khojdu

# Expose port
EXPOSE 8089

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8089/actuator/health || exit 1

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]