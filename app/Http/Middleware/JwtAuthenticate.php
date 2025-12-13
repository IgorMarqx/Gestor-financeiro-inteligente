<?php

namespace App\Http\Middleware;

use App\Services\AuthService;
use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JwtAuthenticate
{
    public function __construct(private readonly AuthService $authService) {}

    public function handle(Request $request, Closure $next)
    {
        $token = $this->extractToken($request);

        if (! $token) {
            return $this->unauthorized('Token não fornecido.');
        }

        try {
            $user = $this->authService->resolveUserFromToken($token);
        } catch (AuthenticationException $exception) {
            return $this->unauthorized($exception->getMessage());
        }

        Auth::setUser($user);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }

    private function extractToken(Request $request): ?string
    {
        if ($request->bearerToken()) {
            return $request->bearerToken();
        }

        return $request->input('token');
    }

    private function unauthorized(string $message): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], 401);
    }
}
