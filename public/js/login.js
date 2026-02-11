$(document).ready(function() {
  
    const API_LOGIN = 'http://localhost:8080/login'; 

    $('#formLogin').submit(function(e) {
        e.preventDefault();

        const loginData = {
            email: $('#email').val(),
            senha: $('#senha').val()
        };

        $.ajax({
            url: API_LOGIN,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(loginData),
            success: function(response) {
                localStorage.setItem('user_token', response.token);
                
                localStorage.setItem('user_data', JSON.stringify(response.user));

                Swal.fire({
                    icon: 'success',
                    title: 'Login realizado!',
                    showConfirmButton: false,
                    timer: 1500,
                    heightAuto: false
                }).then(() => {
                    window.location.href = '/catalogo'; 
                });
            },
            error: function(xhr) {
                let msg = 'Erro ao conectar';
                if (xhr.responseJSON && xhr.responseJSON.messages) {
                    msg = xhr.responseJSON.messages.error || 'Credenciais inválidas';
                }
                $('#senha').val('');
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: msg,
                    heightAuto: false
                });
            }
        });
    });
});