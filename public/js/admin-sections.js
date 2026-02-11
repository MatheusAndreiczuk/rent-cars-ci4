function renderAdminView(userData) {
    $('#nav-links').html(`
        <li class="nav-item"><a class="nav-link active" data-section="dashboard" href="#dashboard">Dashboard</a></li>
        <li class="nav-item"><a class="nav-link" data-section="veiculos" href="#veiculos">Veículos</a></li>
        <li class="nav-item"><a class="nav-link" data-section="categorias" href="#categorias">Categorias e Preços</a></li>
        <li class="nav-item"><a class="nav-link" data-section="usuarios" href="#usuarios">Usuários</a></li>
    `);

    $('#nav-links').on('click', '.nav-link', function (e) {
        e.preventDefault();
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        const section = $(this).data('section');
        renderAdminSection(section);
    });

    renderAdminSection('dashboard');
}

function renderAdminSection(section) {
    const sections = {
        'dashboard': renderDashboardSection,
        'veiculos': renderVeiculosSection,
        'categorias': renderCategoriasSection,
        'usuarios': renderUsuariosSection
    };

    if (sections[section]) {
        sections[section]();
    }
}

function renderDashboardSection() {
    $('#sidebar-content').html(`
        <div class="mb-3">
            <label class="form-label fw-bold">Status da Locação</label>
            <select class="form-select" id="filtro-status-dashboard">
                <option value="todos">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="reservado">Reservados</option>
                <option value="finalizado">Finalizados</option>
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Período</label>
            <select class="form-select" id="filtro-periodo">
                <option value="todos">Todos</option>
                <option value="hoje">Hoje</option>
                <option value="semana">Esta Semana</option>
                <option value="mes">Este Mês</option>
            </select>
        </div>
        <button class="btn btn-sm btn-outline-secondary w-100 mt-2" onclick="carregarDadosDashboard()">
            <i class="bi bi-arrow-clockwise"></i> Atualizar
        </button>
    `);

    $('#main-content').html(`
        <h2 class="mb-4">Painel Administrativo</h2>
        <div class="row" id="dashboard-cards"></div>
        <h4 class="mt-4 mb-3">Relatório de Locações</h4>
        <div class="table-responsive">
            <table class="table table-hover table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Veículo</th>
                        <th class="d-none d-md-table-cell">Retirada</th>
                        <th class="d-none d-md-table-cell">Devolução Prev.</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabela-dashboard-body"></tbody>
            </table>
        </div>
    `);

    carregarDadosDashboard();

    $('#filtro-status-dashboard, #filtro-periodo').on('change', function () {
        carregarDadosDashboard();
    });
}

function carregarDadosDashboard() {
    const filtroStatus = $('#filtro-status-dashboard').val() || 'todos';
    mostrarLoading('#tabela-dashboard-body', 7);

    $.ajax({
        url: API_URL + '/rentals',
        method: 'GET',
        success: function (response) {
            let locacoes = response.data || response;

            let countAtivos = 0;
            let countReservas = 0;
            let totalReceita = 0;

            locacoes.forEach(loc => {
                if (loc.status === 'ativo') countAtivos++;
                if (loc.status === 'reservado') countReservas++;
                totalReceita += parseFloat(loc.valor_total || loc.valor_previsto || 0);
            });

            $('#dashboard-cards').html(`
                ${cardMetrica('Locações Ativas', countAtivos, 'primary')}
                ${cardMetrica('Receita Total', 'R$ ' + totalReceita.toFixed(2), 'success')}
                ${cardMetrica('Reservas Pendentes', countReservas, 'warning')}
            `);

            let locacoesFiltradas = locacoes;
            if (filtroStatus !== 'todos') {
                locacoesFiltradas = locacoes.filter(loc => loc.status === filtroStatus);
            }

            if (locacoesFiltradas.length === 0) {
                mostrarVazio('#tabela-dashboard-body', 'Nenhuma locação encontrada com este filtro.', 7);
                return;
            }

            let htmlTabela = '';
            locacoesFiltradas.forEach(loc => {
                let valor = parseFloat(loc.valor_total || loc.valor_previsto || 0);
                htmlTabela += `
                    <tr>
                        <td>#${loc.id}</td>
                        <td>Veículo ${loc.veiculo_id}</td>
                        <td class="d-none d-md-table-cell">${formatarData(loc.data_retirada)}</td>
                        <td class="d-none d-md-table-cell">${formatarData(loc.data_devolucao_prevista)}</td>
                        <td>R$ ${valor.toFixed(2)}</td>
                        <td><span class="badge bg-${getCorStatus(loc.status)}">${loc.status.toUpperCase()}</span></td>
                        <td>${getBotoesAcaoLocacao(loc)}</td>
                    </tr>
                `;
            });

            $('#tabela-dashboard-body').html(htmlTabela);
        },
        error: function () {
            exibirErro('Erro ao carregar dados do dashboard.');
        }
    });
}

function getBotoesAcaoLocacao(loc) {
    if (loc.status === 'reservado') {
        return `<button class="btn btn-sm btn-success" onclick="iniciarLocacao(${loc.id})">
            Iniciar
        </button>`;
    }
    if (loc.status === 'ativo') {
        return `<button class="btn btn-sm btn-dark" onclick="finalizarLocacao(${loc.id}, ${loc.km_inicial})">
            Devolver
        </button>`;
    }
    return '<small class="text-muted">-</small>';
}

function renderVeiculosSection() {
    $('#sidebar-content').html(`
        <div class="mb-3">
            <label class="form-label fw-bold">Status do Veículo</label>
            <select class="form-select" id="filtro-status-veiculo">
                <option value="todos">Todos</option>
                <option value="disponivel">Disponível</option>
                <option value="alugado">Alugado</option>
                <option value="manutencao">Manutenção</option>
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Categoria</label>
            <select class="form-select" id="filtro-categoria-veiculo">
                <option value="todos">Todas</option>
            </select>
        </div>
        <button class="btn btn-sm btn-success w-100 mt-2" onclick="abrirModalNovoVeiculo()">
            <i class="bi bi-plus-circle"></i> Novo Veículo
        </button>
    `);

    $('#main-content').html(`
        <h2 class="mb-4">Relatório de Veículos</h2>
        <div class="row" id="veiculo-cards"></div>
        <div class="table-responsive">
            <table class="table table-hover table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th class="d-none d-lg-table-cell">Ano</th>
                        <th class="d-none d-md-table-cell">Placa</th>
                        <th class="d-none d-lg-table-cell">Categoria</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabela-veiculos-body"></tbody>
            </table>
        </div>
    `);

    carregarDadosVeiculos();

    carregarCategoriasParaFiltro();

    $('#filtro-status-veiculo, #filtro-categoria-veiculo').on('change', function () {
        carregarDadosVeiculos();
    });
}

function carregarDadosVeiculos() {
    const filtroStatus = $('#filtro-status-veiculo').val() || 'todos';
    const filtroCategoria = $('#filtro-categoria-veiculo').val() || 'todos';
    console.log('Carregando veículos com filtros:', { filtroCategoria });
    
    mostrarLoading('#tabela-veiculos-body', 8);

    $.ajax({
        url: API_URL + '/vehicles',
        method: 'GET',
        success: function (response) {
            let veiculos = response.data || response;

            let veiculosFiltrados = veiculos;
            if (filtroStatus !== 'todos') {
                veiculosFiltrados = veiculosFiltrados.filter(v => v.status === filtroStatus);
            }
            if (filtroCategoria !== 'todos') {
                veiculosFiltrados = veiculosFiltrados.filter(v => v.id_categoria == filtroCategoria);
            }

            const alugados = veiculos.filter(v => v.status !== 'disponivel' && v.status !== 'manutencao').length;
            const disponiveis = veiculos.filter(v => v.status === 'disponivel').length;
            const manutencao = veiculos.filter(v => v.status === 'manutencao').length;

            $('#veiculo-cards').html(`
                ${cardMetrica('Alugados/Reservados', alugados, 'primary')}
                ${cardMetrica('Disponíveis', disponiveis, 'success')}
                ${cardMetrica('Em Manutenção', manutencao, 'warning')}
            `);

            if (veiculosFiltrados.length === 0) {
                mostrarVazio('#tabela-veiculos-body', 'Nenhum veículo encontrado com este filtro.', 8);
                return;
            }

            let htmlTabela = '';
            veiculosFiltrados.forEach(veiculo => {
                htmlTabela += `
                    <tr>
                        <td>#${veiculo.id}</td>
                        <td>${veiculo.marca}</td>
                        <td>${veiculo.modelo}</td>
                        <td class="d-none d-lg-table-cell">${veiculo.ano_modelo}</td>
                        <td class="d-none d-md-table-cell">${veiculo.placa}</td>
                        <td class="d-none d-lg-table-cell">${veiculo.categoria_nome || '-'}</td>
                        <td><span class="badge bg-${getCorStatus(veiculo.status)}">${veiculo.status.toUpperCase()}</span></td>
                        <td>${getBotoesAcaoVeiculo(veiculo)}</td>
                    </tr>
                `;
            });

            $('#tabela-veiculos-body').html(htmlTabela);
        },
        error: function () {
            exibirErro('Erro ao carregar dados dos veículos.');
        }
    });
}

function getBotoesAcaoVeiculo(veiculo) {
    if (veiculo.status === 'disponivel') {
        return `
            <button class="btn btn-sm btn-primary" onclick="editarVeiculo(${veiculo.id})">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="excluirVeiculo(${veiculo.id})">
                <i class="bi bi-trash"></i>
            </button>
        `;
    }
    return '<small class="text-muted">Em uso</small>';
}

function renderCategoriasSection() {
    $('#sidebar-content').html(`
        <div class="alert alert-info">
            <i class="bi bi-info-circle"></i>
            <small>Gerencie as categorias e valores de locação.</small>
        </div>
        <button class="btn btn-sm btn-success w-100" onclick="abrirModalNovaCategoria()">
            <i class="bi bi-plus-circle"></i> Nova Categoria
        </button>
    `);

    $('#main-content').html(`
        <h2 class="mb-4">Relatório de Categorias</h2>
        <div class="table-responsive">
            <table class="table table-hover table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Nome da Categoria</th>
                        <th>Preço Diário</th>
                        <th class="d-none d-md-table-cell">Preço Semanal</th>
                        <th class="d-none d-lg-table-cell">Preço Mensal</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabela-categorias-body"></tbody>
            </table>
        </div>
    `);

    carregarDadosCategorias();
}

function carregarDadosCategorias() {
    mostrarLoading('#tabela-categorias-body', 5);

    $.ajax({
        url: API_URL + '/categories',
        method: 'GET',
        success: function (response) {
            let categorias = response.data || response;

            if (categorias.length === 0) {
                mostrarVazio('#tabela-categorias-body', 'Nenhuma categoria cadastrada.', 5);
                return;
            }

            let htmlTabela = '';
            categorias.forEach(categoria => {
                htmlTabela += `
                    <tr>
                        <td class="fw-bold">${categoria.nome}</td>
                        <td class="text-success fw-bold">R$ ${parseFloat(categoria.valor_diario).toFixed(2)}</td>
                        <td class="d-none d-md-table-cell">R$ ${parseFloat(categoria.valor_semanal).toFixed(2)}</td>
                        <td class="d-none d-lg-table-cell">R$ ${parseFloat(categoria.valor_mensal).toFixed(2)}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editarCategoria('${categoria.id}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="excluirCategoria('${categoria.id}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });

            $('#tabela-categorias-body').html(htmlTabela);
        },
        error: function () {
            exibirErro('Erro ao carregar categorias.');
        }
    });
}

function renderUsuariosSection() {
    $('#sidebar-content').html(`
        <div class="mb-3">
            <label class="form-label fw-bold">Tipo de Usuário</label>
            <select class="form-select" id="filtro-role-usuario">
                <option value="todos">Todos</option>
                <option value="admin">Administradores</option>
                <option value="client">Clientes</option>
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Buscar</label>
            <input type="text" class="form-control" id="busca-usuario" placeholder="Nome ou email...">
        </div>
    `);

    $('#main-content').html(`
        <h2 class="mb-4">Tabela de Usuários</h2>
        <div class="table-responsive">
            <table class="table table-hover table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th class="d-none d-md-table-cell">CPF</th>
                        <th class="d-none d-lg-table-cell">Telefone</th>
                        <th class="d-none d-lg-table-cell">CNH</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabela-usuarios-body"></tbody>
            </table>
        </div>
    `);

    carregarDadosUsuarios();

    $('#filtro-role-usuario').on('change', carregarDadosUsuarios);
    $('#busca-usuario').on('keyup', debounce(carregarDadosUsuarios, 500));
}

function carregarDadosUsuarios() {
    const filtroRole = $('#filtro-role-usuario').val() || 'todos';
    const busca = $('#busca-usuario').val().toLowerCase();
    
    mostrarLoading('#tabela-usuarios-body', 6);

    $.ajax({
        url: API_URL + '/users',
        method: 'GET',
        success: function (response) {
            let usuarios = response.data || response;

            let usuariosFiltrados = usuarios;
            if (filtroRole !== 'todos') {
                usuariosFiltrados = usuariosFiltrados.filter(u => u.role === filtroRole);
            }
            if (busca) {
                usuariosFiltrados = usuariosFiltrados.filter(u => 
                    u.nome.toLowerCase().includes(busca) || 
                    u.email.toLowerCase().includes(busca)
                );
            }

            if (usuariosFiltrados.length === 0) {
                mostrarVazio('#tabela-usuarios-body', 'Nenhum usuário encontrado.', 6);
                return;
            }

            let htmlTabela = '';
            usuariosFiltrados.forEach(usuario => {
                htmlTabela += `
                    <tr>
                        <td class="fw-bold">${usuario.nome}</td>
                        <td>${usuario.email}</td>
                        <td class="d-none d-md-table-cell">${usuario.cpf || '-'}</td>
                        <td class="d-none d-lg-table-cell">${usuario.telefone || '-'}</td>
                        <td class="d-none d-lg-table-cell">${usuario.cnh_categoria || '-'}</td>
                        <td>
                            <button class="btn btn-sm btn-info text-white" onclick="verUsuario('${usuario.id}')">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="editarUsuario('${usuario.id}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="excluirUsuario('${usuario.id}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });

            $('#tabela-usuarios-body').html(htmlTabela);
        },
        error: function () {
            exibirErro('Erro ao carregar usuários.');
        }
    });
}

function carregarCategoriasParaFiltro() {
    $.ajax({
        url: API_URL + '/categories',
        method: 'GET',
        success: function (response) {
            let categorias = response.data || response;
            let options = '<option value="todos">Todas</option>';
            categorias.forEach(cat => {
                options += `<option value="${cat.id}">${cat.nome}</option>`;
            });
            $('#filtro-categoria-veiculo').html(options);
        }
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

window.iniciarLocacao = function (id) {
    Swal.fire({
        title: 'Confirmar retirada do veículo?',
        text: "Isso mudará o status do aluguel para ATIVO.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim, confirmar!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `${API_URL}/rentals/${id}/start`,
                method: 'PUT',
                success: function (res) {
                    exibirSucesso(res.message || 'Locação iniciada!');
                    carregarDadosDashboard();
                },
                error: function () {
                    exibirErro('Não foi possível iniciar a locação.');
                }
            });
        }
    });
};

window.finalizarLocacao = function (id, kmInicial) {
    Swal.fire({
        title: 'Finalizar locação',
        html: `
            <p>Informe a quilometragem final do veículo:</p>
            <input type="number" id="km-final" class="form-control" placeholder="KM final" min="${kmInicial}" step="1">
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim, finalizar!',
        preConfirm: () => {
            const kmFinal = document.getElementById('km-final').value;
            if (!kmFinal || isNaN(kmFinal) || Number(kmFinal) < kmInicial) {
                Swal.showValidationMessage('Informe a quilometragem final corretamente.');
                return false;
            }
            return kmFinal;
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            $.ajax({
                url: `${API_URL}/rentals/${id}/finish`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ km_final: result.value }),
                success: function (res) {
                    exibirSucesso(res.message || 'Locação finalizada!');
                    carregarDadosDashboard();
                },
                error: function () {
                    exibirErro('Não foi possível finalizar a locação.');
                }
            });
        }
    });
};

window.editarVeiculo = (id) => Swal.fire('Teste de modal', `Editar veículo #${id}`, 'info');
window.excluirVeiculo = (id) => Swal.fire('Teste de modal', `Excluir veículo #${id}`, 'info');
window.editarCategoria = (id) => Swal.fire('Teste de modal', `Editar categoria ${id}`, 'info');
window.excluirCategoria = (id) => Swal.fire('Teste de modal', `Excluir categoria ${id}`, 'info');
window.verUsuario = (id) => Swal.fire('Teste de modal', `Ver usuário ${id}`, 'info');
window.editarUsuario = (id) => Swal.fire('Teste de modal', `Editar usuário ${id}`, 'info');
window.excluirUsuario = (id) => Swal.fire('Teste de modal', `Excluir usuário ${id}`, 'info');
window.abrirModalNovoVeiculo = () => Swal.fire('Teste de modal', 'Modal de novo veículo', 'info');
window.abrirModalNovaCategoria = () => Swal.fire('Teste de modal', 'Modal de nova categoria', 'info');
