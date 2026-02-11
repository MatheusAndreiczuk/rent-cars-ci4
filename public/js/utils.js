const API_URL = 'http://localhost:8080';

function formatarData(dataIso) {
    if (!dataIso) return '-';
    return new Date(dataIso).toLocaleDateString('pt-BR');
}

function getCorStatus(status) {
    const cores = {
        'ativo': 'primary',
        'reservado': 'warning',
        'finalizado': 'success',
        'disponivel': 'success',
        'alugado': 'danger',
        'manutencao': 'secondary'
    };
    return cores[status] || 'secondary';
}

function exibirErro(mensagem = 'Erro ao carregar dados.') {
    Swal.fire({
        icon: 'error',
        title: 'Ops!',
        text: mensagem
    });
}

function exibirSucesso(mensagem = 'Operação realizada com sucesso!') {
    Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: mensagem,
        timer: 2000
    });
}

function configurarAjax() {
    const token = localStorage.getItem('user_token');
    if (token) {
        $.ajaxSetup({
            headers: { 'Authorization': 'Bearer ' + token }
        });
    }
}

function verificarAutenticacao() {
    const token = localStorage.getItem('user_token');
    const userData = JSON.parse(localStorage.getItem('user_data'));
    
    if (!token || !userData) {
        window.location.href = '/login';
        return null;
    }
    
    return { token, userData };
}

function mostrarLoading(seletor, colspan = 7) {
    $(seletor).html(`
        <tr>
            <td colspan="${colspan}" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                <p class="mt-2 text-muted">Carregando dados...</p>
            </td>
        </tr>
    `);
}

function mostrarVazio(seletor, mensagem = 'Nenhum registro encontrado.', colspan = 7) {
    $(seletor).html(`
        <tr>
            <td colspan="${colspan}" class="text-center text-muted py-4">
                <i class="bi bi-inbox fs-1"></i>
                <p class="mt-2">${mensagem}</p>
            </td>
        </tr>
    `);
}

function cardMetrica(titulo, valor, cor = 'primary') {
    return `
        <div class="col-md-4 mb-3">
            <div class="card text-white bg-${cor} h-100">
                <div class="card-body">
                    <h5 class="card-title">${titulo}</h5>
                    <p class="card-text fs-2">${valor}</p>
                </div>
            </div>
        </div>
    `;
}

function logout() {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
}
