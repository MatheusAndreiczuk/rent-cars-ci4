function renderClientView(userData) {
    $('#nav-links').html(`
        <li class="nav-item"><a class="nav-link active" data-section="catalogo" href="#catalogo">Alugar Carro</a></li>
        <li class="nav-item"><a class="nav-link" data-section="minhas-reservas" href="#minhas-reservas">Minhas Reservas</a></li>
        <li class="nav-item"><a class="nav-link" data-section="meu-perfil" href="#meu-perfil">Meu Perfil</a></li>
    `);

    $('#nav-links').on('click', '.nav-link', function (e) {
        e.preventDefault();
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
        const section = $(this).data('section');
        renderClientSection(section);
    });

    renderClientSection('catalogo');
}

function renderClientSection(section) {
    if (section === 'catalogo') {
        renderCatalogoSection();
    } else if (section === 'minhas-reservas') {
        renderMinhasReservasSection();
    } else if (section === 'meu-perfil') {
        renderMeuPerfilSection();
    }
}

function renderCatalogoSection() {
    $('#sidebar-content').html(`
        <div class="mb-3">
            <label class="form-label fw-bold">Categoria</label>
            <select class="form-select" id="filtro-categoria-catalogo">
                <option value="">Todas</option>
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Data Retirada</label>
            <input type="date" class="form-control" id="filtro-data-retirada">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Data Devolução</label>
            <input type="date" class="form-control" id="filtro-data-devolucao">
        </div>
        <button class="btn btn-success w-100" id="btn-buscar-carros">
            <i class="bi bi-search"></i> Buscar Disponíveis
        </button>
    `);

    carregarCatalogo();
    carregarCategoriasParaCatalogo();

    $('#btn-buscar-carros').on('click', carregarCatalogo);
}

function carregarCategoriasParaCatalogo() {
    $.ajax({
        url: API_URL + '/categories',
        method: 'GET',
        success: function (response) {
            let categorias = response.data || response;
            let options = '<option value="">Todas</option>';
            categorias.forEach(cat => {
                options += `<option value="${cat.id}">${cat.nome}</option>`;
            });
            $('#filtro-categoria-catalogo').html(options);
        }
    });
}

function carregarCatalogo() {
    const categoriaFiltro = $('#filtro-categoria-catalogo').val();

    $('#main-content').html(`
        <h3 class="mb-4">Veículos Disponíveis</h3>
        <div class="row" id="grid-carros">
            <div class="col-12 text-center mt-5">
                <div class="spinner-border text-primary"></div>
                <p class="mt-2">Carregando veículos...</p>
            </div>
        </div>
    `);

    $.ajax({
        url: API_URL + '/vehicles',
        method: 'GET',
        success: function (response) {
            let carros = response.data || response;

            let disponiveis = carros.filter(c => c.status === 'disponivel');

            if (categoriaFiltro) {
                disponiveis = disponiveis.filter(c => c.id_categoria == categoriaFiltro);
            }

            if (disponiveis.length === 0) {
                $('#grid-carros').html(`
                    <div class="col-12">
                        <div class="alert alert-warning text-center">
                            <i class="bi bi-exclamation-triangle fs-1"></i>
                            <p class="mt-2">Que pena! Nenhum veículo disponível no momento com os filtros selecionados.</p>
                        </div>
                    </div>
                `);
                return;
            }

            let htmlGrid = '';
            disponiveis.forEach(carro => {
                htmlGrid += criarCardVeiculo(carro);
            });

            $('#grid-carros').html(htmlGrid);
            ativarBotoesReserva();
        },
        error: function () {
            $('#grid-carros').html(`
                <div class="col-12">
                    <div class="alert alert-danger">Erro ao carregar a frota.</div>
                </div>
            `);
        }
    });
}

function criarCardVeiculo(carro) {
    return `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card h-100 shadow-sm border-0">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 class="card-title mb-0">${carro.modelo}</h5>
                            <small class="text-muted">${carro.marca} - ${carro.ano_modelo}</small>
                        </div>
                        <span class="badge bg-info text-dark">${carro.categoria_nome}</span>
                    </div>
                    
                    <ul class="list-unstyled small mb-3">
                        <li><i class="bi bi-palette text-primary px-2"></i> ${carro.cor}</li>
                        <li><i class="bi bi-fuel-pump text-primary px-2"></i> ${carro.combustivel}</li>
                    </ul>
                    
                    <div class="border-top pt-2 mb-2">
                        <div class="row text-center">
                            <div class="col-4">
                                <small class="text-muted d-block">Diária</small>
                                <strong class="text-success">R$ ${parseFloat(carro.valor_diario).toFixed(0)}</strong>
                            </div>
                            <div class="col-4 border-start">
                                <small class="text-muted d-block">Semanal</small>
                                <strong class="text-success">R$ ${parseFloat(carro.valor_semanal).toFixed(0)}</strong>
                            </div>
                            <div class="col-4 border-start">
                                <small class="text-muted d-block">Mensal</small>
                                <strong class="text-success">R$ ${parseFloat(carro.valor_mensal).toFixed(0)}</strong>
                            </div>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary btn-sm w-100 btn-alugar mt-2" 
                        data-id="${carro.id}" 
                        data-modelo="${carro.modelo}"
                        data-preco="${carro.valor_diario}">
                        <i class="bi bi-calendar-check px-2"></i> Reservar Agora
                    </button>
                </div>
            </div>
        </div>
    `;
}

function ativarBotoesReserva() {
    $('.btn-alugar').off('click').on('click', function () {
        const id = $(this).data('id');
        const modelo = $(this).data('modelo');
        const preco = $(this).data('preco');

        Swal.fire({
            title: `Reservar ${modelo}?`,
            html: `
                <p>Valor: <strong>R$ ${preco}/dia</strong></p>
                <div class="text-start mt-3">
                    <label class="form-label">Data de Retirada</label>
                    <input type="date" id="data-retirada" class="form-control mb-2">
                    <label class="form-label">Data de Devolução</label>
                    <input type="date" id="data-devolucao" class="form-control">
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmar Reserva',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const dataRetirada = document.getElementById('data-retirada').value;
                const dataDevolucao = document.getElementById('data-devolucao').value;

                if (!dataRetirada || !dataDevolucao) {
                    Swal.showValidationMessage('Por favor, preencha todas as datas');
                    return false;
                }

                if (dataRetirada >= dataDevolucao) {
                    Swal.showValidationMessage('A data de devolução deve ser posterior à de retirada');
                    return false;
                }

                return { dataRetirada, dataDevolucao };
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                criarReserva(id, result.value.dataRetirada, result.value.dataDevolucao);
            }
        });
    });
}

function criarReserva(veiculoId, dataRetirada, dataDevolucao) {
    $.ajax({
        url: API_URL + '/rentals',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            veiculo_id: veiculoId,
            data_retirada: dataRetirada,
            data_devolucao_prevista: dataDevolucao
        }),
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Reserva Confirmada!',
                text: 'Sua reserva foi realizada com sucesso.',
                confirmButtonText: 'Ver Minhas Reservas'
            }).then(() => {
                renderClientSection('minhas-reservas');
                $('.nav-link').removeClass('active');
                $('.nav-link[data-section="minhas-reservas"]').addClass('active');
            });
        },
        error: function (xhr) {
            const msg = xhr.responseJSON?.message || 'Erro ao criar reserva.';
            exibirErro(msg);
        }
    });
}

function renderMinhasReservasSection() {
    $('#sidebar-content').html(`
        <div class="mb-3">
            <label class="form-label fw-bold">Status</label>
            <select class="form-select" id="filtro-status-reserva">
                <option value="todos">Todos</option>
                <option value="reservado">Reservado</option>
                <option value="ativo">Em Locação</option>
                <option value="finalizado">Finalizado</option>
            </select>
        </div>
        <button class="btn btn-sm btn-outline-secondary w-100 mt-2" onclick="renderMinhasReservasSection()">
            <i class="bi bi-arrow-clockwise"></i> Atualizar
        </button>
    `);

    $('#main-content').html(`
        <h3 class="mb-4">Minhas Reservas</h3>
        <div class="table-responsive">
            <table class="table table-hover table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Veículo</th>
                        <th class="d-none d-md-table-cell">Retirada</th>
                        <th class="d-none d-md-table-cell">Devolução</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="tabela-minhas-reservas-body"></tbody>
            </table>
        </div>
    `);

    carregarMinhasReservas();

    $('#filtro-status-reserva').on('change', carregarMinhasReservas);
}

function carregarMinhasReservas() {
    const filtroStatus = $('#filtro-status-reserva').val() || 'todos';
    mostrarLoading('#tabela-minhas-reservas-body', 7);

    $.when(
        $.ajax({ url: API_URL + '/rentals/my', method: 'GET' }),
        $.ajax({ url: API_URL + '/vehicles', method: 'GET' })
    ).done(function (reservasRes, veiculosRes) {
        let reservas = reservasRes[0].data || reservasRes[0];
        let veiculos = veiculosRes[0].data || veiculosRes[0];

        const veiculosMap = {};
        veiculos.forEach(v => {
            veiculosMap[v.id] = v;
        });

        if (filtroStatus !== 'todos') {
            reservas = reservas.filter(r => r.status === filtroStatus);
        }

        if (reservas.length === 0) {
            mostrarVazio('#tabela-minhas-reservas-body', 'Você ainda não possui reservas.', 7);
            return;
        }

        let htmlTabela = '';
        reservas.forEach(reserva => {
            const valor = parseFloat(reserva.valor_total || reserva.valor_previsto || 0);
            const veiculo = veiculosMap[reserva.veiculo_id] || {};
            const nomeVeiculo = veiculo.modelo ? `${veiculo.marca} ${veiculo.modelo}` : `Veículo ${reserva.veiculo_id}`;

            let acoes = '-';
            if (reserva.status === 'reservado') {
                acoes = `<button class="btn btn-sm btn-danger" onclick="cancelarReserva(${reserva.id}, '${reserva.data_retirada}')">
                    <i class="bi bi-x-circle"></i> Cancelar
                </button>`;
            }

            htmlTabela += `
                <tr>
                    <td>#${reserva.id}</td>
                    <td>${nomeVeiculo}</td>
                    <td class="d-none d-md-table-cell">${formatarData(reserva.data_retirada)}</td>
                    <td class="d-none d-md-table-cell">${formatarData(reserva.data_devolucao_prevista)}</td>
                    <td class="fw-bold">R$ ${valor.toFixed(2)}</td>
                    <td><span class="badge bg-${getCorStatus(reserva.status)}">${reserva.status.toUpperCase()}</span></td>
                    <td>${acoes}</td>
                </tr>
            `;
        });

        $('#tabela-minhas-reservas-body').html(htmlTabela);
    }).fail(function () {
        exibirErro('Erro ao carregar suas reservas.');
    });
}

window.cancelarReserva = function (id, dataRetirada) {
    const agora = new Date();
    const retirada = new Date(dataRetirada);
    const diferencaHoras = (retirada - agora) / (1000 * 60 * 60);

    if (diferencaHoras < 24) {
        Swal.fire({
            icon: 'warning',
            title: 'Atenção!',
            text: 'Não é possível cancelar reservas com menos de 24 horas de antecedência.'
        });
        return;
    }

    Swal.fire({
        title: 'Cancelar Reserva?',
        text: 'Tem certeza que deseja cancelar esta reserva? É necessário cancelar com pelo menos 24 horas de antecedência.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim, cancelar',
        cancelButtonText: 'Não',
        confirmButtonColor: 'rgb(255, 0, 0)'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `${API_URL}/rentals/${id}/cancel`,
                method: 'PUT',
                success: function (response) {
                    exibirSucesso('Reserva cancelada com sucesso!');
                    carregarMinhasReservas();
                },
                error: function (xhr) {
                    const msg = xhr.responseJSON?.message || 'Erro ao cancelar reserva.';
                    exibirErro(msg);
                }
            });
        }
    });
};

function renderMeuPerfilSection() {
    $('#sidebar-content').html(`
        <div class="mb-3">
            <h6 class="fw-bold">Ações do Perfil</h6>
            <button class="btn btn-primary btn-sm w-100 mb-2" onclick="editarMeuPerfil()">
                <i class="bi bi-pencil"></i> Editar Perfil
            </button>
            <button class="btn btn-danger btn-sm w-100" onclick="excluirMinhaConta()">
                <i class="bi bi-trash"></i> Excluir Conta
            </button>
        </div>
    `);

    $('#main-content').html(`
        <h3 class="mb-4">Meu Perfil</h3>
        <div id="perfil-content">
            <div class="text-center mt-5">
                <div class="spinner-border text-primary"></div>
                <p class="mt-2">Carregando perfil...</p>
            </div>
        </div>
    `);

    carregarMeuPerfil();
}

function carregarMeuPerfil() {
    const userData = JSON.parse(localStorage.getItem('user_data'));
    const userId = userData.id;

    $.ajax({
        url: `${API_URL}/users/${userId}`,
        method: 'GET',
        success: function (response) {
            const perfil = response.data || response;

            $('#perfil-content').html(`
                <div class="card shadow-sm">
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="text-muted small">Nome</label>
                                <p class="fw-bold">${perfil.nome}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="text-muted small">Email (não editável)</label>
                                <p class="fw-bold">${perfil.email}</p>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="text-muted small">CPF</label>
                                <p class="fw-bold">${perfil.cpf}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="text-muted small">Telefone</label>
                                <p class="fw-bold">${perfil.telefone || '-'}</p>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="text-muted small">CNH Número</label>
                                <p class="fw-bold">${perfil.cnh_numero || '-'}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="text-muted small">CNH Categoria</label>
                                <p class="fw-bold">${perfil.cnh_categoria || '-'}</p>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="text-muted small">CNH Validade</label>
                                <p class="fw-bold">${formatarData(perfil.cnh_validade) || '-'}</p>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="text-muted small">CEP</label>
                                <p class="fw-bold">${perfil.cep || '-'}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="text-muted small">Número</label>
                                <p class="fw-bold">${perfil.numero || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        },
        error: function () {
            exibirErro('Erro ao carregar perfil.');
        }
    });
}

window.editarMeuPerfil = function () {
    const userData = JSON.parse(localStorage.getItem('user_data'));
    const userId = userData.id;

    $.ajax({
        url: `${API_URL}/users/${userId}`,
        method: 'GET',
        success: function (response) {
            const perfil = response.data || response;

            Swal.fire({
                title: 'Editar Meu Perfil',
                html: `
                    <div class="text-start">
                        <div class="row">
                            <div class="col-12 mb-2">
                                <label class="form-label">Nome *</label>
                                <input type="text" id="nome" class="form-control" value="${perfil.nome}">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Email (não editável)</label>
                                <input type="email" class="form-control" value="${perfil.email}" readonly disabled>
                            </div>
                            <div class="col-md-6 mb-2">
                                <label class="form-label">CPF *</label>
                                <input type="text" id="cpf" class="form-control" value="${perfil.cpf || ''}">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Telefone *</label>
                                <input type="text" id="telefone" class="form-control" value="${perfil.telefone || ''}">
                            </div>
                            <div class="col-md-6 mb-2">
                                <label class="form-label">CNH Número *</label>
                                <input type="text" id="cnh_numero" class="form-control" value="${perfil.cnh_numero || ''}">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label class="form-label">CNH Categoria *</label>
                                <select class="form-select" id="cnh_categoria" required>
                                    <option selected>${perfil.cnh_categoria || 'Selecione'}</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="AB">AB</option>
                                    <option value="AC">AC</option>
                                    <option value="AD">AD</option>
                                    <option value="AE">AE</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-2">
                                <label class="form-label">CNH Validade *</label>
                                <input type="date" id="cnh_validade" class="form-control" value="${perfil.cnh_validade || ''}">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label class="form-label">CEP *</label>
                                <input type="text" id="cep" class="form-control" value="${perfil.cep || ''}">
                            </div>
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Número *</label>
                                <input type="text" id="numero" class="form-control" value="${perfil.numero || ''}">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label class="form-label">Nova Senha (opcional)</label>
                                <input type="password" id="senha" class="form-control" placeholder="Deixe vazio para não alterar">
                            </div>
                        </div>
                        <small class="text-muted">Nota: Email não pode ser alterado. Deixe a senha vazia para mantê-la.</small>
                    </div>
                `,
                width: '700px',
                showCancelButton: true,
                confirmButtonText: 'Salvar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    const dados = {
                        nome: document.getElementById('nome').value,
                        cpf: document.getElementById('cpf').value,
                        telefone: document.getElementById('telefone').value,
                        role: 'client',
                        cnh_numero: document.getElementById('cnh_numero').value,
                        cnh_categoria: document.getElementById('cnh_categoria').value,
                        cnh_validade: document.getElementById('cnh_validade').value,
                        cep: document.getElementById('cep').value,
                        numero: document.getElementById('numero').value
                    };

                    const senha = document.getElementById('senha').value;
                    if (senha && senha.trim() !== '') {
                        dados.senha = senha;
                    }

                    return dados;
                }
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    $.ajax({
                        url: `${API_URL}/users/${userId}`,
                        method: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify(result.value),
                        success: function (response) {
                            exibirSucesso('Perfil atualizado com sucesso!');
                            carregarMeuPerfil();
                        },
                        error: function (xhr) {
                            const msg = xhr.responseJSON?.message || 'Erro ao atualizar perfil.';
                            exibirErro(msg);
                        }
                    });
                }
            });
        },
        error: function () {
            exibirErro('Erro ao carregar perfil para edição.');
        }
    });
};

window.excluirMinhaConta = function () {
    const userData = JSON.parse(localStorage.getItem('user_data'));
    const userId = userData.id;
    Swal.fire({
        title: 'Excluir Conta?',
        html: `
            <p class="text-danger fw-bold">ATENÇÃO: Esta ação é irreversível!</p>
            <p>Ao excluir sua conta:</p>
            <ul class="text-start">
                <li>Você não poderá criar outra conta com o mesmo email</li>
                <li>Você não poderá criar outra conta com o mesmo CPF</li>
                <li>Você não poderá criar outra conta com o mesmo número de CNH</li>
                <li>Todos os seus dados serão removidos do sistema</li>
            </ul>
            <p class="fw-bold">Tem certeza que deseja continuar?</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir minha conta',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: 'rgb(255, 0, 0)'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `${API_URL}/users/${userId}`,
                method: 'DELETE',
                success: function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Conta Excluída',
                        text: 'Sua conta foi excluída com sucesso. Você será redirecionado para a página de login.',
                        timer: 3000
                    }).then(() => {
                        localStorage.removeItem('user_token');
                        localStorage.removeItem('user_data');
                        window.location.href = '/login';
                    });
                },
                error: function (xhr) {
                    const msg = xhr.responseJSON?.message || 'Erro ao excluir conta.';
                    exibirErro(msg);
                }
            });
        }
    });
};
