$(document).ready(function() {
    
    // Variables
    // ====================================================================== //
    var color, u = JSON.parse(sessionStorage.usuario);
    
    if (u[1] == 'operador') {
        if (u[0].gerente == 0) {
            $('#btn-aseguradoras').remove();
            $('#btn-activos').remove();
        }
    } else if (u[1] == 'operario') {
        alert('operario');
        btn_logout_click();
    } else {
        alert('desconocido');
        btn_logout_click();
    }
    
    // Funciones auxiliares
    // ====================================================================== //
    function paginaNoEncontrada(nombre) {
        $('#contenido').html('<h1>Error 404: no se encuentra la pagina ' + nombre + '</h1>');
    }
    
    // Funciones controladoras para componentes
    // ====================================================================== //
    function btn_siniestros_click() {
        $('#contenido').load('Html/siniestros.html', cargar_siniestros);
    }
    
    function btn_jornadas_click() {
        $('#contenido').load('Html/jornadas.html',cargar_jornadas);
    }
    
    function btn_aseguradoras_click() {
        $('#contenido').load('Html/aseguradoras.html', cargar_aseguradoras);
    }
    
    function btn_activos_click() {
        $('#contenido').load('Html/activos.html', cargar_activos);
    }
    
    function btn_configuracion_click() {
        $('#contenido').load('Html/configuracion.html', cargar_configuracion);
    }
    
    function btn_logout_click() {
        localStorage.removeItem('usuario');
        $('#barra').html('');
        $('#contenido').load('Html/login.html', cargar_login);
    }
    
    // Funciones para cargar paginas y definir su comportamiento
    // ====================================================================== //
    function cargar_siniestros(responseTxt, statusTxt) {
        if(statusTxt !== 'success') {
            paginaNoEncontrada('siniestros.html');
        }
    }
    
    function cargar_jornadas(responseTxt, statusTxt) {
        if(statusTxt !== 'success') {
            paginaNoEncontrada('jornadas.html');
        }
    }
    
    function cargar_aseguradoras(responseTxt, statusTxt) {
        if(statusTxt !== 'success') {
            paginaNoEncontrada('aseguradoras.html');
        }
    }
    
    function cargar_activos(responseTxt, statusTxt) {
        if(statusTxt !== 'success') {
            paginaNoEncontrada('activos.html');
        }
    }
    
    function cargar_configuracion(responseTxt, statusTxt) {
        if(statusTxt !== 'success') {
            paginaNoEncontrada('configuracion.html');
        }
    }
    
    function cargar_login(responseTxt, statusTxt) {
        if(statusTxt !== 'success') {
            paginaNoEncontrada('login.html');
        }
    }
    
    // Cargar paginas y aplicar controles
    // ====================================================================== //
    $('#btn-siniestros').click(btn_siniestros_click);
    $('#btn-jornadas').click(btn_jornadas_click);
    $('#btn-aseguradoras').click(btn_aseguradoras_click);
    $('#btn-activos').click(btn_activos_click);
    $('#btn-configuracion').click(btn_configuracion_click);
    $('#btn-logout').click(btn_logout_click);
    
    // Inicializacion de aspecto y colores
    // ====================================================================== //
    color = localStorage.colorSiniestros ? localStorage.colorSiniestros : 'rgb(60, 179, 113)';
    $('#btn-siniestros').css('background-color', color);
    color = localStorage.colorJornadas ? localStorage.colorJornadas : 'rgb(255, 165, 0)';
    $('#btn-jornadas').css('background-color', color);
    color = localStorage.colorAseguradoras ? localStorage.colorAseguradoras : 'rgb(238, 130, 238)';
    $('#btn-aseguradoras').css('background-color', color);
    color = localStorage.colorActivos ? localStorage.colorActivos : 'rgb(30, 144, 255)';
    $('#btn-activos').css('background-color', color);
    $('#btn-configuracion').css('background-color', 'rgb(160, 160, 160)');
    $('#btn-logout').css('background-color', 'rgb(255, 99, 71)');
    $('#barra').show();
});
