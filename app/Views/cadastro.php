<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro - Rent Cars Project</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</head>

<body class="bg-light d-flex align-items-center justify-content-center" style="min-height: 100vh; overflow-y: auto;">
    <div class="card shadow p-4" style="width: 600px;">
        <h3 class="text-center mb-4">Cadastre sua conta</h3>

        <small style="height: 1.5rem;"><p class="text-danger">Campos obrigatórios (*)</p></small>
        <form id="formCadastro">
            <div class="mb-3">
                <label>Nome</label><span class="text-danger"> *</span>
                <input type="text" id="nome" class="form-control" placeholder="Seu nome" required>
            </div>
            <div class="mb-3">
                <label>E-mail</label><span class="text-danger"> *</span>
                <input type="email" id="email" class="form-control" placeholder="exemplo@email.com" required>
            </div>
            <div class="row g-3 align-items-center mb-3">
                <div class="col-md-6">
                    <label>CPF</label><span class="text-danger"> *</span>
                    <input type="text" id="cpf" class="form-control" placeholder="Apenas números" required>
                </div>
                <div class="col-md-6">
                    <label>Senha</label><span class="text-danger"> *</span>
                    <input type="password" id="senha" class="form-control" placeholder="******" required>
                </div>
            </div>
            <div class="row g-3 align-items-center mb-3">
                <div class="col-md-6">
                    <label>Telefone</label><span class="text-danger"> *</span>
                    <input type="text" id="telefone" class="form-control" placeholder="Apenas números" required>
                </div>
                <div class="col-md-4">
                    <label>CEP</label><span class="text-danger"> *</span>
                    <input type="text" id="cep" class="form-control" placeholder="Apenas números" required>
                </div>
                <div class="col-md-2">
                    <label>Número</label><span class="text-danger"> *</span>
                    <input type="text" id="numero" class="form-control" required>
                </div>
            </div>
            <fieldset class="border rounded p-3 pt-4 position-relative" style="margin-top: 1.5rem;">
                <legend class="w-auto px-2" style="font-size: 1rem; position: absolute; top: -1.1rem; background: #fff; font-weight: 600;">
                    Informações da CNH
                </legend>
                <div class="row g-3 align-items-center">
                    <div class="col-md-5">
                        <label>Número da CNH</label><span class="text-danger"> *</span>
                        <input type="text" id="cnh_numero" class="form-control" placeholder="Apenas números" required>
                    </div>
                    <div class="col-md-4">
                        <label>Validade</label><span class="text-danger"> *</span>
                        <input type="date" id="cnh_validade" class="form-control" required>
                    </div>
                    <div class="col-md-3">
                        <label>Categoria</label><span class="text-danger"> *</span>
                        <select class="form-select" id="cnh_categoria" required>
                            <option selected>Selecione</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="AC">AC</option>
                            <option value="AD">AD</option>
                            <option value="AE">AE</option>
                        </select>
                    </div>
                </div>

            </fieldset>
            <button type="submit" class="btn btn-primary w-100 mt-3">Cadastrar</button>
        </form>
        <div class="mt-4 text-center">
            <p>Já tem conta? <br><small><a href="/login" style="text-decoration: none;">Faça login</a></small></p>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="/js/cadastro.js"></script>
</body>
</html>