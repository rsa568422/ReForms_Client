$(document).ready(function() {

    // Variables
    // ====================================================================== //
    var colorBorde = $('#btn-siniestros').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.1)',
        sinColor = 'rgb(0, 0, 0, 0)',
        contenedor = $('#ventana').children('div[class="container-fluid"]'),
        siniestro = JSON.parse(sessionStorage.siniestro),
        edicion = false;
    
    // Funciones auxiliares
    // ====================================================================== //
    function alerta(titulo, mensaje) {
        $('#alerta').find('.modal-title').html(titulo);
        $('#alerta').find('.modal-body').html(mensaje);
        $('#activador-alerta').click();
    }
    
    // Funciones controladoras para componentes
    // ====================================================================== //
    function volver_click() {
        $('#btn-siniestros').click();
    }
    
    function ocultable_click() {
        if (!edicion) {
            $(this).siblings('.ocultable-contenido').slideToggle();
            $(this).parent('.ocultable').siblings('.ocultable').children('.ocultable-contenido').slideUp()();
        }
    }
    
    // Funciones para cargar paginas y definir su comportamiento
    // ====================================================================== //
    function cargar_poliza(responseTxt, statusTxt) {
        if (statusTxt != 'success') {
            alerta('Error 404', 'no se pudo cargar algo.html');
            sessionStorage.removeItem('poliza');
        }
    }
    
    // Cargar paginas y aplicar controles
    // ====================================================================== //
    sessionStorage.removeItem('siniestro');
    sessionStorage.setItem('poliza', JSON.stringify(siniestro.poliza));
    contenedor.children('.siniestro').children('.ocultable-contenido').children('.poliza').children('.col-12').load('Html/poliza.html', cargar_poliza);
    contenedor.children('.volver').find('button[name="volver"]').css({'border-color':colorBorde, 'background-color':colorFondo}).click(volver_click);
    contenedor.children('.ocultable').children('.ocultable-titulo').click(ocultable_click);
    
    // Inicializacion de aspecto y colores
    // ====================================================================== //
    $('#ventana').css('border-color', colorBorde);
    $('#ventana').css('background-color', colorFondo);
    contenedor.children('.ocultable').css('border-color', colorBorde);
    contenedor.children('.ocultable').children('.ocultable-contenido').hide();
    contenedor.children('.siniestro').children('.ocultable-contenido').show();
});
