<?php

namespace App\Services;

use App\Models\Familia;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class FamiliaService
{
    public function __construct(private readonly UserRepository $userRepository) {}

    public function getByUser(User $user): ?Familia
    {
        $familiaId = $user->familiaVinculadaId();
        if (!$familiaId) {
            return null;
        }

        return Familia::query()
            ->with(['membros:id,name,email'])
            ->find($familiaId);
    }

    /**
     * @param  array{nome:string}  $payload
     */
    public function create(User $user, array $payload): Familia
    {
        $hasFamilia = $user->familias()->wherePivot('vinculo', true)->exists();
        if ($hasFamilia) {
            abort(422, 'Você já possui uma família.');
        }

        return DB::transaction(function () use ($user, $payload) {
            $familia = Familia::query()->create([
                'nome' => $payload['nome'],
                'criado_por_user_id' => $user->id,
            ]);

            $familia->membros()->attach($user->id, ['vinculo' => true]);

            return $familia->load('membros:id,name,email');
        });
    }

    /**
     * @param  array{nome:string}  $payload
     */
    public function update(User $user, array $payload): ?Familia
    {
        $familiaId = $user->familiaVinculadaId();
        if (!$familiaId) {
            return null;
        }

        $familia = Familia::query()->find($familiaId);
        if (!$familia) {
            return null;
        }

        $familia->fill(['nome' => $payload['nome']]);
        $familia->save();

        return $familia->load('membros:id,name,email');
    }

    public function delete(User $user): bool
    {
        $familiaId = $user->familiaVinculadaId();
        if (!$familiaId) {
            return false;
        }

        DB::transaction(function () use ($familiaId) {
            DB::table('familia_user')->where('familia_id', $familiaId)->delete();
            Familia::query()->whereKey($familiaId)->delete();
        });

        return true;
    }

    /**
     * @param  array{nome?:string|null,email:string,cpf?:string|null,telefone?:string|null,senha?:string|null}  $payload
     */
    public function addMember(User $user, array $payload): array
    {
        $familiaId = $user->familiaVinculadaId();
        if (!$familiaId) {
            abort(422, 'Crie uma família antes de adicionar membros.');
        }

        $member = $this->userRepository->findByEmail($payload['email']);

        if (!$member) {
            $payload['senha'] = $this->resolvePassword($payload['email'], $payload['cpf'] ?? '', $payload['telefone'] ?? '', $payload['senha'] ?? '');
            $payload['nome'] = trim((string) ($payload['nome'] ?? ''));
            if ($payload['nome'] === '') {
                $payload['nome'] = $this->buildNameFromEmail($payload['email']);
            }
            $member = $this->userRepository->createUserByFamily($payload);
        }

        $alreadyLinkedToOther = $member->familias()
            ->wherePivot('vinculo', true)
            ->where('familia_id', '!=', $familiaId)
            ->exists();
        if ($alreadyLinkedToOther) {
            abort(422, 'Este usuário já pertence a outra família.');
        }

        $existingMember = $member->familias()->where('familia_id', $familiaId)->first();
        if ($existingMember) {
            if ($existingMember->pivot->vinculo) {
                abort(422, 'Este usuário já é membro da família.');
            }
            $member->familias()->updateExistingPivot($familiaId, ['vinculo' => true]);
        } else {
            $member->familias()->attach($familiaId, ['vinculo' => true]);
        }

        return ['message' => 'Membro adicionado com sucesso.'];
    }

    private function buildNameFromEmail(string $email): string
    {
        $localPart = Str::of($email)->before('@')->replace(['.', '-', '_'], ' ')->title()->toString();
        return $localPart !== '' ? $localPart : $email;
    }

    private function resolvePassword(string $email, string $cpf, string $telefone, string $senha): string
    {
        if (trim($senha) !== '') {
            return $senha;
        }

        $emailPart = substr($email, 0, 4);
        $cpfDigits = preg_replace('/\D/', '', $cpf) ?? '';
        $telefoneDigits = preg_replace('/\D/', '', $telefone) ?? '';
        $cpfPart = substr($cpfDigits, 0, 3);
        $telefonePart = substr($telefoneDigits, 0, 2);

        return $emailPart   . $cpfPart . $telefonePart;
    }

    public function removeMember(User $user, int $memberId): bool
    {
        $familiaId = $user->familiaVinculadaId();
        if (!$familiaId) {
            return false;
        }

        $member = User::query()->whereKey($memberId)->first();
        if (!$member) {
            return false;
        }

        $existingMember = $member->familias()->where('familia_id', $familiaId)->first();
        if (!$existingMember) {
            return false;
        }

        $member->familias()->updateExistingPivot($familiaId, ['vinculo' => false]);

        return true;
    }
}
