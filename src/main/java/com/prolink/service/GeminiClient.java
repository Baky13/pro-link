package com.prolink.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Тонкий HTTP-клиент к Google Gemini (generateContent).
 * Провайдеро-зависимый слой: чтобы сменить ИИ, меняется только этот класс.
 * Любая ошибка (нет ключа / таймаут / битый ответ) → Optional.empty() → вызывающий уходит в fallback.
 */
@Slf4j
@Component
public class GeminiClient {

    @Value("${gemini.api-key:}") private String apiKey;
    @Value("${gemini.model:gemini-2.0-flash}") private String model;
    @Value("${gemini.base-url:https://generativelanguage.googleapis.com}") private String baseUrl;
    @Value("${gemini.max-output-tokens:512}") private int maxOutputTokens;
    @Value("${gemini.timeout-ms:8000}") private int timeoutMs;
    @Value("${gemini.enabled:true}") private boolean enabled;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private RestClient client;

    /** ИИ доступен, только если включён И задан непустой ключ. Иначе сразу fallback без сети. */
    public boolean isAvailable() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }

    private RestClient client() {
        if (client == null) {
            SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
            f.setConnectTimeout(Duration.ofMillis(timeoutMs));
            f.setReadTimeout(Duration.ofMillis(timeoutMs));
            client = RestClient.builder().baseUrl(baseUrl).requestFactory(f).build();
        }
        return client;
    }

    /**
     * Запрос к модели. Ожидаем, что модель вернёт JSON-строку (responseMimeType=application/json).
     * @return текст ответа модели или empty при любой проблеме.
     */
    public Optional<String> generateJson(String systemInstruction, String userPrompt) {
        if (!isAvailable()) return Optional.empty();
        try {
            Map<String, Object> body = Map.of(
                    "system_instruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", userPrompt)))),
                    "generationConfig", Map.of(
                            "temperature", 0.3,
                            "maxOutputTokens", maxOutputTokens,
                            "responseMimeType", "application/json",
                            // gemini-2.5-flash — thinking-модель; отключаем "размышления",
                            // чтобы не съедать output-токены на коротких структурированных ответах
                            "thinkingConfig", Map.of("thinkingBudget", 0)
                    )
            );
            String resp = client().post()
                    .uri("/v1beta/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode text = objectMapper.readTree(resp)
                    .path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text");
            if (text.isMissingNode() || text.asText().isBlank()) {
                log.warn("Gemini: пустой ответ модели");
                return Optional.empty();
            }
            return Optional.of(text.asText());
        } catch (Exception e) {
            log.warn("Gemini недоступен, уходим в fallback: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
