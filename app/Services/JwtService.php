<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;

class JwtService
{
    public function generateToken(User $user, ?int $ttlMinutes = null): string
    {
        $ttl = $ttlMinutes ?? (int) config('jwt.ttl', 60);
        $issuedAt = now();

        $header = $this->base64UrlEncode(json_encode([
            'typ' => 'JWT',
            'alg' => 'HS256',
        ]));

        $payload = $this->base64UrlEncode(json_encode([
            'iss' => config('app.url'),
            'sub' => $user->getKey(),
            'email' => $user->email,
            'iat' => $issuedAt->timestamp,
            'exp' => (clone $issuedAt)->addMinutes($ttl)->timestamp,
        ]));

        $signature = $this->sign("{$header}.{$payload}");

        return "{$header}.{$payload}.{$signature}";
    }

    /**
     * @return array<string, mixed>
     *
     * @throws AuthenticationException
     */
    public function decodeToken(string $token): array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            throw new AuthenticationException('Token malformado.');
        }

        [$header, $payload, $signature] = $parts;
        $expectedSignature = $this->sign("{$header}.{$payload}");

        if (! hash_equals($expectedSignature, $signature)) {
            throw new AuthenticationException('Assinatura inválida.');
        }

        $data = json_decode($this->base64UrlDecode($payload), true);

        if (! is_array($data) || empty($data['exp'])) {
            throw new AuthenticationException('Token inválido.');
        }

        if ($data['exp'] < now()->timestamp) {
            throw new AuthenticationException('Token expirado.');
        }

        return $data;
    }

    private function sign(string $message): string
    {
        return $this->base64UrlEncode(
            hash_hmac('sha256', $message, $this->secret(), true),
        );
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string
    {
        return base64_decode(strtr($value, '-_', '+/')) ?: '';
    }

    private function secret(): string
    {
        return config('jwt.secret', config('app.key'));
    }
}
