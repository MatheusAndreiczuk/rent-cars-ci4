$(document).ready(function () {
    const auth = verificarAutenticacao();
    if (!auth) return;

    const { token, userData } = auth;

    configurarAjax();

    $('#user-name').text(`Olá, ${userData.nome} (${userData.role})`);

    if (userData.role === 'admin') {
        renderAdminView(userData);
    } else {
        renderClientView(userData);
    }

    $('#btn-logout').on('click', logout);
});