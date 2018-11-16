$(document).ready(function() {
    $('#contenido').load('Html/login.html', function(responseTxt, statusTxt) {
        if(statusTxt !== 'success') {
            alert('Error: no se pudo cargar login.html');
        }
    });
});
