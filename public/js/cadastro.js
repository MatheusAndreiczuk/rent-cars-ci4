$(document).ready(function () {

    const API_CADASTRO = 'http://localhost:8080/cadastro';

    $('#formCadastro').submit(function (e) {
        e.preventDefault();

        const cadastroData = {
            nome: $('#nome').val(),
            email: $('#email').val(),
            senha: $('#senha').val(),
            cpf: $('#cpf').val(),
            telefone: $('#telefone').val(),
            cep: $('#cep').val(),
            numero: $('#numero').val(),
            cnh_numero: $('#cnh_numero').val(),
            cnh_validade: $('#cnh_validade').val(),
            cnh_categoria: $('#cnh_categoria').val(),
            role: 'client'
        }

        $.ajax({
            url: API_CADASTRO,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(cadastroData),
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Cadastro realizado! Faça login para continuar.',
                    heightAuto: false
                }).then(() => {
                    window.location.href = '/login';
                });
            },
            error:
                function (xhr) {
                    let msg = 'Erro ao conectar';
                    if (xhr.responseJSON && xhr.responseJSON.messages) {
                        msg = xhr.responseJSON.messages.error || 'Erro no cadastro';
                    }
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: msg,
                        heightAuto: false
                    });
                }
        })
    });
})