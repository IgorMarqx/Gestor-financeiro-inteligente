<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends ApiController
{
    public function __construct(private readonly AuthService $authService) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        try {
            $result = $this->authService->attemptLogin(
                email: $credentials['email'],
                password: $credentials['password'],
                remember: (bool) ($credentials['remember'] ?? false),
            );
        } catch (AuthenticationException $exception) {
            return $this->apiError('Credenciais inválidas.', [
                'email' => ['Email ou senha incorretos.'],
                'password' => ['Email ou senha incorretos.'],
            ], 401);
        }

        $request->session()->regenerate();

        return $this->apiSuccess([
            'token' => $result['token'],
            'user' => $result['user'],
        ], 'Login realizado com sucesso.');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->apiSuccess(['user' => $request->user()], 'OK');
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->apiSuccess(null, 'Sessão encerrada.');
    }
}
