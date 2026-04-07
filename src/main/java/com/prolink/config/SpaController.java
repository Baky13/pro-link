package com.prolink.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping(value = {
        "/", "/login", "/register", "/forgot-password",
        "/vacancies", "/vacancies/**",
        "/employers/**", "/workers", "/workers/**",
        "/profile", "/applications",
        "/chat", "/chat/**",
        "/notifications", "/my-vacancies",
        "/saved", "/map", "/dashboard", "/salary"
    })
    public String forward(HttpServletRequest request) {
        return "forward:/index.html";
    }
}
