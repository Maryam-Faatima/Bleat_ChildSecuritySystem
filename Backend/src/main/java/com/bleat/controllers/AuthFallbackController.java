package com.bleat.controllers;

// This class used to provide fallback auth endpoints during development but
// it created ambiguous mappings with the real `AuthController`. To avoid
// ambiguous request mapping errors we keep this file as a plain helper class
// (no Spring annotations) so it is not registered as a controller.
public class AuthFallbackController {
    // Intentionally empty - fallback behavior removed. Use AuthController instead.
}
