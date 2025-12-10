FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Pre-fetch dependencies to speed up subsequent builds
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -B -DskipTests dependency:go-offline

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup --system spring && adduser --system --ingroup spring spring \
    && mkdir -p /app/logs /app/uploads \
    && chown -R spring:spring /app

COPY --from=builder /app/target/*.jar /app/app.jar

EXPOSE 8089
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:InitialRAMPercentage=40.0 -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -Djava.security.egd=file:/dev/urandom"

USER spring
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD wget -qO- http://localhost:8089/actuator/health >/dev/null 2>&1 || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /app/app.jar"]
