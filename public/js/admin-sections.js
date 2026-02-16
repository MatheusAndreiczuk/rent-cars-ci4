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
            <select class="form-select" id="filtro-periodo-tipo">
                <option value="todos">Todos</option>
                <option value="hoje">Hoje</option>
                <option value="semana">Esta Semana</option>
                <option value="mes">Este Mês</option>
                <option value="ano_anterior">Ano Anterior</option>
                <option value="personalizado">Personalizado</option>
            </select>
        </div>
        <div id="filtro-datas-personalizadas" style="display:none;">
            <div class="mb-3">
                <label class="form-label fw-bold">Data Inicial</label>
                <input type="date" class="form-control" id="filtro-data-inicial">
            </div>
            <div class="mb-3">
                <label class="form-label fw-bold">Data Final</label>
                <input type="date" class="form-control" id="filtro-data-final">
            </div>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Ordenar por</label>
            <select class="form-select" id="filtro-ordenacao">
                <option value="id_desc">Mais recentes</option>
                <option value="id_asc">Mais antigas</option>
                <option value="devolucao_asc">Devolução mais próxima</option>
                <option value="devolucao_desc">Devolução mais distante</option>
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

    $('#filtro-periodo-tipo').on('change', function() {
        if ($(this).val() === 'personalizado') {
            $('#filtro-datas-personalizadas').show();
        } else {
            $('#filtro-datas-personalizadas').hide();
        }
    });

    $('#filtro-status-dashboard, #filtro-periodo-tipo, #filtro-ordenacao, #filtro-data-inicial, #filtro-data-final').on('change', function () {
        carregarDadosDashboard();
    });
}

function carregarDadosDashboard() {
    const filtroStatus = $('#filtro-status-dashboard').val() || 'todos';
    const filtroPeriodoTipo = $('#filtro-periodo-tipo').val() || 'todos';
    const ordenacao = $('#filtro-ordenacao').val() || 'id_desc';
    mostrarLoading('#tabela-dashboard-body', 7);

    $.when(
        $.ajax({ url: API_URL + '/rentals', method: 'GET' }),
        $.ajax({ url: API_URL + '/vehicles', method: 'GET' })
    ).done(function (locacoesRes, veiculosRes) {
        let locacoes = locacoesRes[0].data || locacoesRes[0];
        let veiculos = veiculosRes[0].data || veiculosRes[0];

        const veiculosMap = {};
        veiculos.forEach(v => {
            veiculosMap[v.id] = v;
        });

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
            ${cardMetrica('Receita Total', formatarMoeda(totalReceita), 'success')}
            ${cardMetrica('Reservas Pendentes', countReservas, 'warning')}
        `);

        let locacoesFiltradas = locacoes;
        
        if (filtroStatus !== 'todos') {
            locacoesFiltradas = locacoesFiltradas.filter(loc => loc.status === filtroStatus);
        }

        if (filtroPeriodoTipo !== 'todos') {
            const agora = new Date();
            let dataInicio, dataFim;

            if (filtroPeriodoTipo === 'hoje') {
                dataInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
                dataFim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59);
            } else if (filtroPeriodoTipo === 'semana') {
                const diaAtual = agora.getDay();
                dataInicio = new Date(agora);
                dataInicio.setDate(agora.getDate() - diaAtual);
                dataFim = new Date(dataInicio);
                dataFim.setDate(dataInicio.getDate() + 6);
            } else if (filtroPeriodoTipo === 'mes') {
                dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
                dataFim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
            } else if (filtroPeriodoTipo === 'ano_anterior') {
                dataInicio = new Date(agora.getFullYear() - 1, 0, 1);
                dataFim = new Date(agora.getFullYear() - 1, 11, 31);
            } else if (filtroPeriodoTipo === 'personalizado') {
                const dataInicialFiltro = $('#filtro-data-inicial').val();
                const dataFinalFiltro = $('#filtro-data-final').val();
                if (dataInicialFiltro && dataFinalFiltro) {
                    dataInicio = new Date(dataInicialFiltro);
                    dataFim = new Date(dataFinalFiltro);
                    dataFim.setHours(23, 59, 59);
                }
            }

            if (dataInicio && dataFim) {
                locacoesFiltradas = locacoesFiltradas.filter(loc => {
                    const dataRetirada = new Date(loc.data_retirada);
                    return dataRetirada >= dataInicio && dataRetirada <= dataFim;
                });
            }
        }

        if (ordenacao === 'id_desc') {
            locacoesFiltradas.sort((a, b) => b.id - a.id);
        } else if (ordenacao === 'id_asc') {
            locacoesFiltradas.sort((a, b) => a.id - b.id);
        } else if (ordenacao === 'devolucao_asc') {
            locacoesFiltradas.sort((a, b) => {
                const dataA = new Date(a.data_devolucao_prevista);
                const dataB = new Date(b.data_devolucao_prevista);
                return dataA - dataB;
            });
        } else if (ordenacao === 'devolucao_desc') {
            locacoesFiltradas.sort((a, b) => {
                const dataA = new Date(a.data_devolucao_prevista);
                const dataB = new Date(b.data_devolucao_prevista);
                return dataB - dataA;
            });
        }

        if (locacoesFiltradas.length === 0) {
            mostrarVazio('#tabela-dashboard-body', 'Nenhuma locação encontrada com este filtro.', 7);
            return;
        }

        let htmlTabela = '';
        locacoesFiltradas.forEach(loc => {
            let valor = parseFloat(loc.valor_total || loc.valor_previsto || 0);
            const veiculo = veiculosMap[loc.veiculo_id] || {};
            const nomeVeiculo = veiculo.modelo ? `${veiculo.marca} ${veiculo.modelo}` : `Veículo ${loc.veiculo_id}`;
            
            htmlTabela += `
                <tr>
                    <td>#${loc.id}</td>
                    <td>${nomeVeiculo}</td>
                    <td class="d-none d-md-table-cell">${formatarData(loc.data_retirada)}</td>
                    <td class="d-none d-md-table-cell">${formatarData(loc.data_devolucao_prevista)}</td>
                    <td class="fw-bold text-success">${formatarMoeda(valor)}</td>
                    <td><span class="badge bg-${getCorStatus(loc.status)}">${loc.status.toUpperCase()}</span></td>
                    <td>${getBotoesAcaoLocacao(loc)}</td>
                </tr>
            `;
        });

        $('#tabela-dashboard-body').html(htmlTabela);
    }).fail(function () {
        exibirErro('Erro ao carregar dados do dashboard.');
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
    if (veiculo.status === 'disponivel' || veiculo.status === 'manutencao') {
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
        <button class="btn btn-sm btn-success w-100 mt-2" onclick="abrirModalNovoUsuario()">
            <i class="bi bi-plus-circle"></i> Novo Usuário
        </button>
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

window.abrirModalNovoVeiculo = function () {
    const anoAtual = new Date().getFullYear();
    $.ajax({
        url: API_URL + '/categories',
        method: 'GET',
        success: function (response) {
            const categorias = response.data || response;
            let opcoesCategoria = '';
            categorias.forEach(cat => {
                opcoesCategoria += `<option value="${cat.id}">${cat.nome}</option>`;
            });

            Swal.fire({
                title: 'Novo Veículo',
                html: `
                    <div class="text-start">
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Marca *</label>
                                <input type="text" id="marca" class="form-control" placeholder="Ex: Toyota">
                            </div>
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Modelo *</label>
                                <input type="text" id="modelo" class="form-control" placeholder="Ex: Corolla">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Ano Fabricação *</label>
                                <input type="number" id="ano_fabricacao" class="form-control" min="1950" max="${anoAtual}">
                            </div>
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Ano Modelo *</label>
                                <input type="number" id="ano_modelo" class="form-control" min="1950" max="${anoAtual+1}">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Placa *</label>
                                <input type="text" id="placa" class="form-control" placeholder="ABC1234" maxlength="7">
                            </div>
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Cor *</label>
                                <input type="text" id="cor" class="form-control" placeholder="Ex: Branco">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label class="form-label">KM Atual *</label>
                                <input type="number" id="km_atual" class="form-control" min="0" value="0">
                            </div>
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Combustível *</label>
                                <select id="combustivel" class="form-select">
                                    <option value="flex">Flex</option>
                                    <option value="gasolina">Gasolina</option>
                                    <option value="etanol">Etanol</option>
                                    <option value="diesel">Diesel</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Categoria *</label>
                                <select id="id_categoria" class="form-select">
                                    ${opcoesCategoria}
                                </select>
                            </div>
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Status *</label>
                                <select id="status" class="form-select">
                                    <option value="disponivel">Disponível</option>
                                    <option value="manutencao">Manutenção</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `,
                width: '600px',
                showCancelButton: true,
                confirmButtonText: 'Cadastrar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    const dados = {
                        marca: document.getElementById('marca').value,
                        modelo: document.getElementById('modelo').value,
                        ano_fabricacao: document.getElementById('ano_fabricacao').value,
                        ano_modelo: document.getElementById('ano_modelo').value,
                        placa: document.getElementById('placa').value.toUpperCase(),
                        cor: document.getElementById('cor').value,
                        km_atual: document.getElementById('km_atual').value,
                        combustivel: document.getElementById('combustivel').value,
                        id_categoria: document.getElementById('id_categoria').value,
                        status: document.getElementById('status').value
                    };

                    if (!dados.marca || !dados.modelo || !dados.ano_fabricacao || !dados.ano_modelo || 
                        !dados.placa || !dados.cor) {
                        Swal.showValidationMessage('Preencha todos os campos obrigatórios');
                        return false;
                    }

                    if (dados.placa.length !== 7) {
                        Swal.showValidationMessage('A placa deve ter exatamente 7 caracteres');
                        return false;
                    }

                    return dados;
                }
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    $.ajax({
                        url: API_URL + '/vehicles',
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(result.value),
                        success: function (res) {
                            exibirSucesso('Veículo cadastrado com sucesso!');
                            carregarDadosVeiculos();
                        },
                        error: function (xhr) {
                            const msg = xhr.responseJSON?.message || 'Erro ao cadastrar veículo.';
                            exibirErro(msg);
                        }
                    });
                }
            });
        }
    });
};

window.editarVeiculo = function (id) {
    const anoAtual = new Date().getFullYear();
    $.when(
        $.ajax({ url: `${API_URL}/vehicles/${id}`, method: 'GET' }),
        $.ajax({ url: API_URL + '/categories', method: 'GET' })
    ).done(function (veiculoRes, categoriasRes) {
        const veiculo = veiculoRes[0].data || veiculoRes[0];
        const categorias = categoriasRes[0].data || categoriasRes[0];
        
        let opcoesCategoria = '';
        categorias.forEach(cat => {
            const selected = cat.id == veiculo.id_categoria ? 'selected' : '';
            opcoesCategoria += `<option value="${cat.id}" ${selected}>${cat.nome}</option>`;
        });

        Swal.fire({
            title: `Editar Veículo #${id}`,
            html: `
                <div class="text-start">
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <label class="form-label">Marca *</label>
                            <input type="text" id="marca" class="form-control" value="${veiculo.marca}">
                        </div>
                        <div class="col-md-6 mb-2">
                            <label class="form-label">Modelo *</label>
                            <input type="text" id="modelo" class="form-control" value="${veiculo.modelo}">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <label class="form-label">Ano Fabricação *</label>
                            <input type="number" id="ano_fabricacao" class="form-control" value="${veiculo.ano_fabricacao}" min="1950" max="${anoAtual}">
                        </div>
                        <div class="col-md-6 mb-2">
                            <label class="form-label">Ano Modelo *</label>
                            <input type="number" id="ano_modelo" class="form-control" value="${veiculo.ano_modelo}" min="1950" max="${anoAtual+1}">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <label class="form-label">Cor *</label>
                            <input type="text" id="cor" class="form-control" value="${veiculo.cor}">
                        </div>
                        <div class="col-md-6 mb-2">
                            <label class="form-label">KM Atual *</label>
                            <input type="number" id="km_atual" class="form-control" value="${veiculo.km_atual}">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <label class="form-label">Combustível *</label>
                            <select id="combustivel" class="form-select">
                                <option value="flex" ${veiculo.combustivel === 'flex' ? 'selected' : ''}>Flex</option>
                                <option value="gasolina" ${veiculo.combustivel === 'gasolina' ? 'selected' : ''}>Gasolina</option>
                                <option value="etanol" ${veiculo.combustivel === 'etanol' ? 'selected' : ''}>Etanol</option>
                                <option value="diesel" ${veiculo.combustivel === 'diesel' ? 'selected' : ''}>Diesel</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-2">
                            <label class="form-label">Categoria *</label>
                            <select id="id_categoria" class="form-select">
                                ${opcoesCategoria}
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <label class="form-label">Status *</label>
                            <select id="status" class="form-select">
                                <option value="disponivel" ${veiculo.status === 'disponivel' ? 'selected' : ''}>Disponível</option>
                                <option value="manutencao" ${veiculo.status === 'manutencao' ? 'selected' : ''}>Manutenção</option>
                            </select>
                        </div>
                    </div>
                    <small class="text-muted">Placa: ${veiculo.placa} (não editável)</small>
                </div>
            `,
            width: '600px',
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return {
                    marca: document.getElementById('marca').value,
                    modelo: document.getElementById('modelo').value,
                    ano_fabricacao: document.getElementById('ano_fabricacao').value,
                    ano_modelo: document.getElementById('ano_modelo').value,
                    cor: document.getElementById('cor').value,
                    km_atual: document.getElementById('km_atual').value,
                    combustivel: document.getElementById('combustivel').value,
                    id_categoria: document.getElementById('id_categoria').value,
                    status: document.getElementById('status').value
                };
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                $.ajax({
                    url: `${API_URL}/vehicles/${id}`,
                    method: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(result.value),
                    success: function (res) {
                        exibirSucesso('Veículo atualizado com sucesso!');
                        carregarDadosVeiculos();
                    },
                    error: function (xhr) {
                        const msg = xhr.responseJSON?.message || 'Erro ao atualizar veículo.';
                        exibirErro(msg);
                    }
                });
            }
        });
    }).fail(function () {
        exibirErro('Erro ao carregar dados do veículo.');
    });
};

window.excluirVeiculo = function (id) {
    Swal.fire({
        title: 'Confirmar exclusão?',
        text: "Esta ação não poderá ser desfeita!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'rgb(255, 0, 0)',
        cancelButtonColor: 'rgb(0, 132, 255)',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `${API_URL}/vehicles/${id}`,
                method: 'DELETE',
                success: function (res) {
                    exibirSucesso('Veículo excluído com sucesso!');
                    carregarDadosVeiculos();
                },
                error: function (xhr) {
                    const msg = xhr.responseJSON?.message || 'Erro ao excluir veículo.';
                    exibirErro(msg);
                }
            });
        }
    });
};

window.abrirModalNovaCategoria = function () {
    Swal.fire({
        title: 'Nova Categoria',
        html: `
            <div class="text-start">
                <div class="mb-3">
                    <label class="form-label">Nome da Categoria *</label>
                    <input type="text" id="nome" class="form-control" placeholder="Ex: SUV">
                </div>
                <div class="mb-3">
                    <label class="form-label">Valor Diário (R$) *</label>
                    <input type="number" id="valor_diario" class="form-control" step="5" min="0" placeholder="Ex: 150.00">
                </div>
                <div class="mb-3">
                    <label class="form-label">Valor Semanal (R$) *</label>
                    <input type="number" id="valor_semanal" class="form-control" step="10" min="0" placeholder="Ex: 900.00">
                </div>
                <div class="mb-3">
                    <label class="form-label">Valor Mensal (R$) *</label>
                    <input type="number" id="valor_mensal" class="form-control" step="50" min="0" placeholder="Ex: 3000.00">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Cadastrar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const dados = {
                nome: document.getElementById('nome').value,
                valor_diario: document.getElementById('valor_diario').value,
                valor_semanal: document.getElementById('valor_semanal').value,
                valor_mensal: document.getElementById('valor_mensal').value
            };

            if (!dados.nome || !dados.valor_diario || !dados.valor_semanal || !dados.valor_mensal) {
                Swal.showValidationMessage('Preencha todos os campos');
                return false;
            }

            return dados;
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            $.ajax({
                url: API_URL + '/categories',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(result.value),
                success: function (res) {
                    exibirSucesso('Categoria cadastrada com sucesso!');
                    carregarDadosCategorias();
                },
                error: function (xhr) {
                    const msg = xhr.responseJSON?.message || 'Erro ao cadastrar categoria.';
                    exibirErro(msg);
                }
            });
        }
    });
};

window.editarCategoria = function (id) {
    $.ajax({
        url: `${API_URL}/categories/${id}`,
        method: 'GET',
        success: function (response) {
            const categoria = response.data || response;
            
            Swal.fire({
                title: 'Editar Categoria',
                html: `
                    <div class="text-start">
                        <div class="mb-3">
                            <label class="form-label">Nome da Categoria *</label>
                            <input type="text" id="nome" class="form-control" value="${categoria.nome}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Valor Diário (R$) *</label>
                            <input type="number" id="valor_diario" class="form-control" step="5" value="${categoria.valor_diario}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Valor Semanal (R$) *</label>
                            <input type="number" id="valor_semanal" class="form-control" step="10" value="${categoria.valor_semanal}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Valor Mensal (R$) *</label>
                            <input type="number" id="valor_mensal" class="form-control" step="25" value="${categoria.valor_mensal}">
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Salvar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    return {
                        nome: document.getElementById('nome').value,
                        valor_diario: document.getElementById('valor_diario').value,
                        valor_semanal: document.getElementById('valor_semanal').value,
                        valor_mensal: document.getElementById('valor_mensal').value
                    };
                }
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    $.ajax({
                        url: `${API_URL}/categories/${id}`,
                        method: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify(result.value),
                        success: function (res) {
                            exibirSucesso('Categoria atualizada com sucesso!');
                            carregarDadosCategorias();
                        },
                        error: function (xhr) {
                            const msg = xhr.responseJSON?.message || 'Erro ao atualizar categoria.';
                            exibirErro(msg);
                        }
                    });
                }
            });
        },
        error: function () {
            exibirErro('Erro ao carregar dados da categoria.');
        }
    });
};

window.excluirCategoria = function (id) {
    Swal.fire({
        title: 'Confirmar exclusão?',
        text: "Esta categoria será removida. Você não poderá criar uma nova com o mesmo nome.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'rgb(255, 0, 0)',
        cancelButtonColor: 'rgb(0, 132, 255)',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `${API_URL}/categories/${id}`,
                method: 'DELETE',
                success: function (res) {
                    exibirSucesso('Categoria excluída com sucesso!');
                    carregarDadosCategorias();
                },
                error: function (xhr) {
                    const msg = xhr.responseJSON?.message || 'Erro ao excluir categoria.';
                    exibirErro(msg);
                }
            });
        }
    });
};

window.verUsuario = function (id) {
    $.ajax({
        url: `${API_URL}/users/${id}`,
        method: 'GET',
        success: function (response) {
            const user = response.data || response;
            
            Swal.fire({
                title: 'Detalhes do Usuário',
                html: `
                    <div class="text-start">
                        <table class="table table-sm">
                            <tr><th>Nome:</th><td>${user.nome}</td></tr>
                            <tr><th>Email:</th><td>${user.email}</td></tr>
                            <tr><th>CPF:</th><td>${user.cpf || '-'}</td></tr>
                            <tr><th>Telefone:</th><td>${user.telefone || '-'}</td></tr>
                            <tr><th>Role:</th><td><span class="badge bg-primary">${user.role}</span></td></tr>
                            <tr><th>CNH Número:</th><td>${user.cnh_numero || '-'}</td></tr>
                            <tr><th>CNH Validade:</th><td>${formatarData(user.cnh_validade)}</td></tr>
                            <tr><th>CNH Categoria:</th><td>${user.cnh_categoria || '-'}</td></tr>
                            <tr><th>CEP:</th><td>${user.cep || '-'}</td></tr>
                            <tr><th>Número:</th><td>${user.numero || '-'}</td></tr>
                        </table>
                    </div>
                `,
                width: '500px',
                confirmButtonText: 'Fechar'
            });
        },
        error: function () {
            exibirErro('Erro ao carregar dados do usuário.');
        }
    });
};

window.editarUsuario = function (id) {
    $.ajax({
        url: `${API_URL}/users/${id}`,
        method: 'GET',
        success: function (response) {
            const user = response.data || response;
            
            Swal.fire({
                title: 'Editar Usuário',
                html: `
                    <div class="text-start">
                        <div class="row">
                            <div class="col-12 mb-2">
                                <label class="form-label">Nome *</label>
                                <input type="text" id="nome" class="form-control" value="${user.nome}">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Email (não editável)</label>
                                <input type="email" id="email" class="form-control" value="${user.email}" readonly disabled>
                            </div>
                            <div class="col-md-6 mb-2">
                                <label class="form-label">CPF *</label>
                                <input type="text" id="cpf" class="form-control" value="${user.cpf || ''}">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Telefone *</label>
                                <input type="text" id="telefone" class="form-control" value="${user.telefone || ''}">
                            </div>
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Role *</label>
                                <select id="role" class="form-select">
                                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                    <option value="client" ${user.role === 'client' ? 'selected' : ''}>Cliente</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label class="form-label">CNH Número *</label>
                                <input type="text" id="cnh_numero" class="form-control" value="${user.cnh_numero || ''}">
                            </div>
                            <div class="col-md-6 mb-2">
                                <label class="form-label">CNH Categoria *</label>
                                <select class="form-select" id="cnh_categoria" required>
                                    <option value="" ${!user.cnh_categoria ? 'selected' : ''}>Selecione</option>
                                    <option value="A" ${user.cnh_categoria === 'A' ? 'selected' : ''}>A</option>
                                    <option value="B" ${user.cnh_categoria === 'B' ? 'selected' : ''}>B</option>
                                    <option value="AB" ${user.cnh_categoria === 'AB' ? 'selected' : ''}>AB</option>
                                    <option value="AC" ${user.cnh_categoria === 'AC' ? 'selected' : ''}>AC</option>
                                    <option value="AD" ${user.cnh_categoria === 'AD' ? 'selected' : ''}>AD</option>
                                    <option value="AE" ${user.cnh_categoria === 'AE' ? 'selected' : ''}>AE</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label class="form-label">CNH Validade *</label>
                                <input type="date" id="cnh_validade" class="form-control" value="${user.cnh_validade || ''}">
                            </div>
                            <div class="col-md-6 mb-2">
                                <label class="form-label">CEP *</label>
                                <input type="text" id="cep" class="form-control" value="${user.cep || ''}">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12 mb-2">
                                <label class="form-label">Número *</label>
                                <input type="text" id="numero" class="form-control" value="${user.numero || ''}">
                            </div>
                        </div>
                    </div>
                `,
                width: '600px',
                showCancelButton: true,
                confirmButtonText: 'Salvar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    const dados = {
                        nome: document.getElementById('nome').value,
                        cpf: document.getElementById('cpf').value,
                        telefone: document.getElementById('telefone').value,
                        role: document.getElementById('role').value,
                        cnh_numero: document.getElementById('cnh_numero').value,
                        cnh_categoria: document.getElementById('cnh_categoria').value,
                        cnh_validade: document.getElementById('cnh_validade').value,
                        cep: document.getElementById('cep').value,
                        numero: document.getElementById('numero').value
                    };

                    return dados;
                }
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    $.ajax({
                        url: `${API_URL}/users/${id}`,
                        method: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify(result.value),
                        success: function (res) {
                            exibirSucesso('Usuário atualizado com sucesso!');
                            carregarDadosUsuarios();
                        },
                        error: function (xhr) {
                            const msg = xhr.responseJSON?.message || 'Erro ao atualizar usuário.';
                            exibirErro(msg);
                        }
                    });
                }
            });
        },
        error: function () {
            exibirErro('Erro ao carregar dados do usuário.');
        }
    });
};

window.excluirUsuario = function (id) {
    Swal.fire({
        title: 'Confirmar exclusão?',
        text: "Este usuário será removido permanentemente! Você não poderá criar outro com o mesmo email e/ou CPF e/ou CNH.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'rgb(255, 0, 0)',
        cancelButtonColor: 'rgb(0, 132, 255)',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `${API_URL}/users/${id}`,
                method: 'DELETE',
                success: function (res) {
                    exibirSucesso('Usuário excluído com sucesso!');
                    carregarDadosUsuarios();
                },
                error: function (xhr) {
                    const msg = xhr.responseJSON?.message || 'Erro ao excluir usuário.';
                    exibirErro(msg);
                }
            });
        }
    });
};

window.abrirModalNovoUsuario = function () {
    Swal.fire({
        title: 'Novo Usuário',
        html: `
            <div class="text-start">
                <div class="row">
                    <div class="col-12 mb-2">
                        <label class="form-label">Nome <span class="text-danger"> *</span></label>
                        <input type="text" id="nome" class="form-control" placeholder="Nome completo">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-2">
                        <label class="form-label">Email <span class="text-danger"> *</span></label>
                        <input type="email" id="email" class="form-control" placeholder="email@exemplo.com">
                    </div>
                    <div class="col-md-6 mb-2">
                        <label class="form-label">Senha <span class="text-danger"> *</span></label>
                        <input type="password" id="senha" class="form-control" placeholder="Mínimo 6 caracteres">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-2">
                        <label class="form-label">CPF <span class="text-danger"> *</span></label>
                        <input type="text" id="cpf" class="form-control" placeholder="Apenas números">
                    </div>
                    <div class="col-md-6 mb-2">
                        <label class="form-label">Telefone <span class="text-danger"> *</span></label>
                        <input type="text" id="telefone" class="form-control" placeholder="Apenas números">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-2">
                        <label class="form-label">Role <span class="text-danger"> *</span></label>
                        <select id="role" class="form-select">
                            <option value="client">Cliente</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div class="col-md-6 mb-2">
                        <label class="form-label">CNH Número <span class="text-danger"> *</span></label>
                        <input type="text" id="cnh_numero" class="form-control" placeholder="Apenas números">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-2">
                        <label class="form-label">CNH Categoria <span class="text-danger"> *</span></label>
                        <select class="form-select" id="cnh_categoria" required>
                            <option value="">Selecione</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="AC">AC</option>
                            <option value="AD">AD</option>
                            <option value="AE">AE</option>
                        </select>
                    </div>
                    <div class="col-md-6 mb-2">
                        <label class="form-label">CNH Validade <span class="text-danger"> *</span></label>
                        <input type="date" id="cnh_validade" class="form-control">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-2">
                        <label class="form-label">CEP <span class="text-danger"> *</span></label>
                        <input type="text" id="cep" class="form-control" placeholder="Apenas números">
                    </div>
                    <div class="col-md-6 mb-2">
                        <label class="form-label">Número <span class="text-danger"> *</span></label>
                        <input type="text" id="numero" class="form-control" placeholder="Número">
                    </div>
                </div>
                <small class="text-muted"><p class="text-danger">Campos obrigatórios (*)</p></small>
            </div>
        `,
        width: '700px',
        showCancelButton: true,
        confirmButtonText: 'Cadastrar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const dados = {
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                senha: document.getElementById('senha').value,
                cpf: document.getElementById('cpf').value,
                telefone: document.getElementById('telefone').value,
                role: document.getElementById('role').value,
                cnh_numero: document.getElementById('cnh_numero').value,
                cnh_categoria: document.getElementById('cnh_categoria').value,
                cnh_validade: document.getElementById('cnh_validade').value,
                cep: document.getElementById('cep').value,
                numero: document.getElementById('numero').value
            };

            if (!dados.nome || !dados.email || !dados.senha || !dados.cpf || !dados.telefone || !dados.cnh_numero || !dados.cnh_categoria || !dados.cnh_validade || !dados.cep || !dados.numero) {
                Swal.showValidationMessage('Preencha todos os campos obrigatórios');
                return false;
            }

            if (dados.senha.length < 6) {
                Swal.showValidationMessage('A senha deve ter no mínimo 6 caracteres');
                return false;
            }

            return dados;
        }
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            $.ajax({
                url: API_URL + '/cadastro',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(result.value),
                success: function (res) {
                    exibirSucesso('Usuário cadastrado com sucesso!');
                    carregarDadosUsuarios();
                },
                error: function (xhr) {
                    const msg = xhr.responseJSON?.message || 'Erro ao cadastrar usuário.';
                    exibirErro(msg);
                }
            });
        }
    });
};
