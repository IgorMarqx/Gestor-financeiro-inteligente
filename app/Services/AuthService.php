<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(
        private readonly UserRepository $users,
        private readonly JwtService $jwt,
    ) {}

    /**
     * @return array{user: User, token: string}
     *
     * @throws AuthenticationException
     */
    public function attemptLogin(string $email, string $password, bool $remember = false): array
    {
        $user = $this->users->findByEmail($email);

        if (! $user || ! Hash::check($password, $user->password)) {
            throw new AuthenticationException('Credenciais inválidas.');
        }

        Auth::guard('web')->login($user, $remember);

        return [
            'user' => $user,
            'token' => $this->jwt->generateToken($user),
        ];
    }

    /**
     * @throws AuthenticationException
     */
    public function resolveUserFromToken(string $token): User
    {
        $payload = $this->jwt->decodeToken($token);

        $userId = (int) ($payload['sub'] ?? 0);
        $user = $userId > 0 ? $this->users->findById($userId) : null;

        if (! $user) {
            throw new AuthenticationException('Usuário não encontrado para o token informado.');
        }

        return $user;
    }
}
