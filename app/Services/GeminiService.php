<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class GeminiService
{
    private function normalizeModel(string $model): string
    {
        $model = trim($model);
        if ($model === '') return $model;

        // Accept common formats:
        // - gemini-2.0-flash
        // - gemini-2.0-flash:generateContent
        // - models/gemini-2.0-flash
        // - models/gemini-2.0-flash:generateContent
        if (str_starts_with($model, 'models/')) {
            $model = substr($model, strlen('models/'));
        }
        if (str_ends_with($model, ':generateContent')) {
            $model = substr($model, 0, -strlen(':generateContent'));
        }

        return $model;
    }

    /**
     * @param  array<int, array{role:'user'|'model', text:string}>  $messages
     */
    public function generateText(array $messages): string
    {
        $apiKey = (string) config('services.gemini.key');
        $model = $this->normalizeModel((string) config('services.gemini.model', 'gemini-3-pro-preview'));
        $baseUrl = (string) config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta');

        if ($apiKey === '') {
            throw new \RuntimeException('GEMINI_API_KEY não configurada.');
        }
        if ($model === '') {
            throw new \RuntimeException('GEMINI_MODEL não configurado.');
        }

        $contents = array_map(
            fn(array $m) => [
                'role' => $m['role'],
                'parts' => [['text' => $m['text']]],
            ],
            $messages,
        );

        $url = rtrim($baseUrl, '/') . "/models/{$model}:generateContent";

        try {
            $response = Http::withHeaders([
                'x-goog-api-key' => $apiKey,
                'Accept' => 'application/json',
            ])
                ->timeout(30)
                ->retry(1, 200)
                ->post($url, [
                    'contents' => $contents,
                ])
                ->throw();
        } catch (RequestException $e) {
            $status = $e->response?->status();
            $body = $e->response?->body();
            $apiMessage = $e->response?->json('error.message');
            $message = is_string($apiMessage) && $apiMessage !== '' ? $apiMessage : $e->getMessage();
            if ($status) $message = "[HTTP {$status}] {$message}";
            if (is_string($body) && $body !== '') $message .= " | Body: {$body}";
            throw new \RuntimeException("Gemini request falhou: {$message}", previous: $e);
        }

        $text = $response->json('candidates.0.content.parts.0.text');
        if (! is_string($text) || trim($text) === '') {
            throw new \RuntimeException('Gemini retornou uma resposta vazia.');
        }

        return $text;
    }

    /**
     * @param  array<int, array{role:'user'|'model', text:string}>  $messages
     * @return array<string, mixed>
     */
    public function generateJson(array $messages): array
    {
        $apiKey = (string) config('services.gemini.key');
        $model = $this->normalizeModel((string) config('services.gemini.model', 'gemini-3-pro-preview'));
        $baseUrl = (string) config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta');

        if ($apiKey === '') {
            throw new \RuntimeException('GEMINI_API_KEY não configurada.');
        }
        if ($model === '') {
            throw new \RuntimeException('GEMINI_MODEL não configurado.');
        }

        $contents = array_map(
            fn(array $m) => [
                'role' => $m['role'],
                'parts' => [['text' => $m['text']]],
            ],
            $messages,
        );

        $url = rtrim($baseUrl, '/') . "/models/{$model}:generateContent";

        try {
            $response = Http::withHeaders([
                'x-goog-api-key' => $apiKey,
                'Accept' => 'application/json',
            ])
                ->timeout(30)
                ->retry(1, 200)
                ->post($url, [
                    'contents' => $contents,
                    'generationConfig' => [
                        'responseMimeType' => 'application/json',
                    ],
                ])
                ->throw();
        } catch (RequestException $e) {
            $status = $e->response?->status();
            $body = $e->response?->body();
            $apiMessage = $e->response?->json('error.message');
            $message = is_string($apiMessage) && $apiMessage !== '' ? $apiMessage : $e->getMessage();
            if ($status) $message = "[HTTP {$status}] {$message}";
            if (is_string($body) && $body !== '') $message .= " | Body: {$body}";
            throw new \RuntimeException("Gemini request falhou: {$message}", previous: $e);
        }

        $text = $response->json('candidates.0.content.parts.0.text');
        if (! is_string($text) || trim($text) === '') {
            throw new \RuntimeException('Gemini retornou uma resposta vazia.');
        }

        $decoded = json_decode($text, true);
        if (! is_array($decoded)) {
            throw new \RuntimeException('Gemini não retornou JSON válido.');
        }

        return $decoded;
    }
}
