$(document).ready(function() {

    // Variables
    // ====================================================================== //
    var colorBorde = $('#btn-siniestros').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.1)',
        sinColor = 'rgb(0, 0, 0, 0)',
        contenedor = $('#ventana').children('div[class="container-fluid"]');
    
    // Funciones auxiliares
    // ====================================================================== //
    function alerta(titulo, mensaje) {
        $('#alerta').find('.modal-title').html(titulo);
        $('#alerta').find('.modal-body').html(mensaje);
        $('#activador-alerta').click();
    }
    
    // Funciones controladoras para componentes
    // ====================================================================== //
    function cancelar_click() {
        $('#btn-siniestros').click();
    }
    
    // Funciones para cargar paginas y definir su comportamiento
    // ====================================================================== //
    function cargar_poliza(responseTxt, statusTxt) {
        if (statusTxt != 'success') {
            alerta('Error 404', 'no se pudo cargar poliza.html');
        }
    }
    
    // Cargar paginas y aplicar controles
    // ====================================================================== //
    contenedor.children('.poliza').children('.col-12').load('Html/poliza.html', cargar_poliza);
    contenedor.children('.botones').find('.btn-cancelar').click(cancelar_click);
    
    // Inicializacion de aspecto y colores
    // ====================================================================== //
    $('#ventana').css('border-color', colorBorde);
    $('#ventana').css('background-color', colorFondo);
    contenedor.children('.progreso').css({'border-color':colorBorde, 'background-color':colorFondo});
    contenedor.find('div.progress').css('border-color', colorBorde);
    contenedor.find('div.progress-bar').css('background-color', colorBorde).animate({width: '1%'}, 'fast');
    //contenedor.children('.registro').hide();
    //contenedor.children('.poliza').hide();
    contenedor.children('.aseguradora').hide().fadeIn();
    contenedor.children('.botones').find('.btn-aceptar').prop('disabled', true);
});
