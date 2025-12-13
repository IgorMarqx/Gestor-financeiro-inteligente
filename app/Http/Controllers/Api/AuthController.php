<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\AuthService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
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
            return response()->json([
                'message' => 'Credenciais inválidas.',
                'errors' => [
                    'email' => ['Email ou senha incorretos.'],
                    'password' => ['Email ou senha incorretos.'],
                ],
            ], 401);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login realizado com sucesso.',
            'token' => $result['token'],
            'user' => $result['user'],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Sessão encerrada.',
        ]);
    }
}
