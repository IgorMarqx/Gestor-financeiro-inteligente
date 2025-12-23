<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WebController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('dashboard');
    }

    public function gastosIndex()
    {
        return Inertia::render('gastos/index');
    }

    public function categoriasIndex()
    {
        return Inertia::render('categorias-gastos/index');
    }

    public function chatIndex()
    {
        return Inertia::render('chat/index');
    }

    public function familiaIndex()
    {
        return Inertia::render('familia/index');
    }
}
