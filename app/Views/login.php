<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Login - Rent Cars Project</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</head>
<body class="bg-light d-flex align-items-center justify-content-center" style="height: 100vh;">

    <div class="card shadow p-4" style="width: 600px;">
        <h3 class="text-center mb-4">Acesse sua conta</h3>
        
        <form id="formLogin">
            <div class="mb-3">
                <label>E-mail</label>
                <input type="email" id="email" class="form-control" placeholder="exemplo@email.com" required>
            </div>
            <div class="mb-3">
                <label>Senha</label>
                <input type="password" id="senha" class="form-control" placeholder="******" required>
            </div>
            <button type="submit" class="btn btn-primary w-100">Entrar</button>
        </form>
        <div class="mt-4 text-center">
            <p>Não tem conta? <br><small><a href="/cadastro" style="text-decoration: none;">Cadastre-se</a></small></p>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="/js/login.js"></script> </body>
</html>