<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class OrcamentoBatchEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public int $userId, public string $batchId, public array $meses, public string $categoriaNome, public int $limite) {}

    public function broadcastOn()
    {
        return new Channel("users.{$this->userId}");
    }

    public function broadcastAs()
    {
        return 'orcamento.batch.finalizado';
    }

    public function broadcastWith()
    {
        return [
            'batch_id' => $this->batchId,
            'user_id' => $this->userId,
            'meses' => $this->meses,
            'categoria_nome' => $this->categoriaNome,
            'limite' => $this->limite,
        ];
    }
}
