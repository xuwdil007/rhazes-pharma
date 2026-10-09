<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminCredential extends Model
{
    protected $table = 'admin_credentials';

    public $timestamps = false;

    protected $fillable = ['id', 'login', 'password_salt', 'password_hash'];
}
