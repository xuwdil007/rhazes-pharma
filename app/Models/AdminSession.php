<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminSession extends Model
{
    protected $table = 'admin_sessions';

    public $timestamps = false;

    protected $fillable = ['token_hash', 'expires_at'];

    protected $casts = ['expires_at' => 'datetime'];
}
