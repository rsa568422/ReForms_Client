$(document).ready(function() {

    // Variables
    // ====================================================================== //
    var googleKey = sessionStorage.googleKey,
        colorBorde = $('#btn-jornadas').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.1)',
        sinColor = 'rgb(0, 0, 0, 0)',
        contenedor = $('#ventana').children('div[class="container-fluid"]'),
        jornadas = {
            'listaJornadas': [],
            'jornadaSeleccionada': null
        },
        calendario = {
            'fechaSeleccionada': null
        },
        validacion = null,
        edicion = false;
    
    // Funciones auxiliares
    // ====================================================================== //
    function alerta(titulo, mensaje) {
        $('#alerta').find('.modal-title').html(titulo);
        $('#alerta').find('.modal-body').html(mensaje);
        $('#activador-alerta').click();
    }
    
    function mostrar_calendario(a, m, calendario) {
        var i, fecha = new Date(a, m);
    }
    
    function testValidacion(v) {
        var x, test = true;
        for (x in v) {
            if (typeof v[x] == 'object') {
                test &= testValidacion(v[x]);
            } else {
                test &= v[x];
            }
        }
        return test;
    }
    
    // Funciones controladoras para componentes
    // ====================================================================== //
    function ocultable_click() {
        if (!edicion) {
            $(this).siblings('.ocultable-contenido').slideToggle();
            $(this).parent('.ocultable').siblings('.ocultable').children('.ocultable-contenido').slideUp()();
        }
    }
    
    // Funciones para cargar paginas y definir su comportamiento
    // ====================================================================== //
    function cargar_jornada(responseTxt, statusTxt) {
        
    }
    
    // Cargar paginas y aplicar controles
    // ====================================================================== //
    contenedor.children('.ocultable').children('.ocultable-titulo').click(ocultable_click);
    
    // Inicializacion de aspecto y colores
    // ====================================================================== //
    $("#ventana").css("border-color", colorBorde);
    $("#ventana").css("background-color", colorFondo);
    contenedor.children('.cerrados').children('.ocultable-contenido').hide();
    calendario.fechaSeleccionada = new Date();
    calendario.fechaSeleccionada.setHours(0);
    calendario.fechaSeleccionada.setMinutes(0);
    calendario.fechaSeleccionada.setSeconds(0);
    calendario.fechaSeleccionada.setMilliseconds(0);
    mostrar_calendario(calendario.fechaSeleccionada.getFullYear(), calendario.fechaSeleccionada.getMonth());
});
