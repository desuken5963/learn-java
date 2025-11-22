FROM maven:3.9-eclipse-temurin-17

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

EXPOSE 8080

# The command will be overridden by docker-compose.yml
CMD ["mvn", "spring-boot:run"]


