package com.bleat.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/_diag")
public class DiagnosticController {

    @Autowired
    private RequestMappingHandlerMapping mapping;

    @GetMapping("/mappings")
    public Object mappings() {
        return mapping.getHandlerMethods().keySet().stream()
                .map(k -> k.toString())
                .collect(Collectors.toList());
    }
}
