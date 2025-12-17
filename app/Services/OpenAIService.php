<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class OpenAIService
{
    /**
     * @param  array<int, array{role:'system'|'user'|'assistant', text:string}>  $messages
     */
    public function generateText(array $messages): string
    {
        $response = $this->request([
            'model' => $this->model(),
            'input' => $this->toInputMessages($messages),
        ]);

        $text = $response['output_text'] ?? null;
        if (! is_string($text) || trim($text) === '') {
            throw new \RuntimeException('OpenAI retornou uma resposta vazia.');
        }

        return $text;
    }

    /**
     * @param  array<int, array{role:'system'|'user'|'assistant', text:string}>  $messages
     * @param  array<string, mixed>  $schema
     * @return array<string, mixed>
     */
    public function generateJsonSchema(array $messages, array $schema, string $name = 'response'): array
    {
        $response = $this->request([
            'model' => $this->model(),
            'input' => $this->toInputMessages($messages),
            'text' => [
                'format' => [
                    'type' => 'json_schema',
                    'name' => $name,
                    'schema' => $schema,
                    'strict' => true,
                ],
            ],
        ]);

        $text = $response['output_text'] ?? null;
        if (! is_string($text) || trim($text) === '') {
            throw new \RuntimeException('OpenAI não retornou JSON.');
        }

        $decoded = json_decode($text, true);
        if (! is_array($decoded)) {
            throw new \RuntimeException('OpenAI retornou JSON inválido.');
        }

        return $decoded;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function request(array $payload): array
    {
        $apiKey = (string) config('services.openai.key');
        $baseUrl = (string) config('services.openai.base_url', 'https://api.openai.com/v1');

        if ($apiKey === '') {
            throw new \RuntimeException('OPENAI_API_KEY não configurada.');
        }

        try {
            /** @var array<string, mixed> $json */
            $json = Http::withToken($apiKey)
                ->acceptJson()
                ->contentType('application/json')
                ->timeout(30)
                ->retry(1, 250)
                ->post(rtrim($baseUrl, '/') . '/responses', $payload)
                ->throw()
                ->json();
        } catch (RequestException $e) {
            $status = $e->response?->status();
            $body = $e->response?->body();
            $apiMessage = $e->response?->json('error.message');
            $message = is_string($apiMessage) && $apiMessage !== '' ? $apiMessage : $e->getMessage();
            if ($status) $message = "[HTTP {$status}] {$message}";
            if (is_string($body) && $body !== '') $message .= " | Body: {$body}";
            throw new \RuntimeException("OpenAI request falhou: {$message}", previous: $e);
        }

        return $json;
    }

    private function model(): string
    {
        $model = (string) config('services.openai.model', 'gpt-5-nano');
        if (trim($model) === '') throw new \RuntimeException('OPENAI_MODEL não configurado.');
        return $model;
    }

    /**
     * @param  array<int, array{role:'system'|'user'|'assistant', text:string}>  $messages
     * @return array<int, array{role:string, content:string}>
     */
    private function toInputMessages(array $messages): array
    {
        return array_map(
            fn(array $m) => [
                'role' => $m['role'],
                'content' => (string) $m['text'],
            ],
            $messages,
        );
    }
}
