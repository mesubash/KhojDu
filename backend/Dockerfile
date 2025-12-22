FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app

ENV JAVA_HOME=/opt/java/openjdk
ENV PATH=$JAVA_HOME/bin:$PATH

COPY pom.xml ./
COPY .mvn .mvn

RUN mvn -version
RUN java -version
RUN javac -version

RUN mvn -B -DskipTests dependency:go-offline

COPY src src
RUN mvn -B -DskipTests package
