package com.khojdu.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class  BackendApplication {

    public static void main(String[] args) {
        // Disable Netty's use of sun.misc.Unsafe to avoid the terminal deprecation warning
        // This must be set before any Netty classes are loaded.
        System.setProperty("io.netty.noUnsafe", "true");

        SpringApplication application = new SpringApplication(BackendApplication.class);
        application.addInitializers(new DotEnvInitializer());
        application.run(args);
    }

}
