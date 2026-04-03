
FROM maven:3.9.8-eclipse-temurin-21 AS build

WORKDIR /app


COPY pom.xml .
RUN mvn dependency:go-offline -B


COPY src ./src
RUN mvn clean package -DskipTests -B


FROM eclipse-temurin:21-jre-jammy AS runtime

WORKDIR /app


RUN addgroup --system estore \
    && adduser --system --ingroup estore estore


COPY --from=build /app/target/*.jar app.jar

USER estore

# Port must match server.port in application.yml
EXPOSE 8081

ENTRYPOINT ["java", "-jar", "-Xmx512m", "app.jar"]
