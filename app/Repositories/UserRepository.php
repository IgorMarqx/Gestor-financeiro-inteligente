<?php

namespace App\Repositories;

use App\Models\User;
class UserRepository
{
    public function findByEmail(string $email): ?User
    {
        return User::query()
            ->where('email', $email)
            ->first();
    }

    public function findById(int $id): ?User
    {
        return User::query()->find($id);
    }

    public function createUserByFamily(array $payload)
    {
        return User::query()->create([
            'name' => $payload['nome'] ?? '',
            'email' => $payload['email'],
            'cpf' => $payload['cpf'] ?? null,
            'telefone' => $payload['telefone'] ?? null,
            'password' => $payload['senha'],
        ]);
    }
}
