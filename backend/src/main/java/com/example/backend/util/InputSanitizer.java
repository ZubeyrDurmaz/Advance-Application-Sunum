package com.example.backend.util;

/**
 * Utility class for sanitizing user inputs to prevent XSS attacks.
 * Strips HTML tags and encodes dangerous characters.
 */
public final class InputSanitizer {

    private InputSanitizer() {}

    /**
     * Strip all HTML tags and encode special characters.
     */
    public static String sanitize(String input) {
        if (input == null) return null;
        // Remove HTML tags
        String cleaned = input.replaceAll("<[^>]*>", "");
        // Encode remaining dangerous characters
        cleaned = cleaned
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
        return cleaned.trim();
    }

    /**
     * Sanitize but preserve basic whitespace (no HTML).
     */
    public static String sanitizePreserveNewlines(String input) {
        if (input == null) return null;
        String cleaned = input.replaceAll("<[^>]*>", "");
        cleaned = cleaned
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
        return cleaned.trim();
    }
}
