package com.example.pomodoro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// This is the file you run to start the whole backend server.
// @SpringBootApplication tells Spring Boot "scan this package and everything
// inside it for controllers, services, etc., and wire them all together".
@SpringBootApplication
public class PomodoroApplication {

    public static void main(String[] args) {
        SpringApplication.run(PomodoroApplication.class, args);
    }

}
