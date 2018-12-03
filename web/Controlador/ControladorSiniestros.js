$(document).ready(function() {

    // Variables
    // ====================================================================== //
    var googleKey = sessionStorage.googleKey,
        colorBorde = $('#btn-siniestros').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.1)',
        sinColor = 'rgb(0, 0, 0, 0)',
        contenedor = $('#ventana').children('div[class="container-fluid"]'),
        aseguradoras = {
            'listaAseguradoras': [],
            'aseguradoraSeleccionada': null,
            'siniestroSeleccionado': null
        },
        abiertos = {
            'listaSiniestros': [],
            'siniestroSeleccionado': null
        },
        cerrados = {
            'listaSiniestros': [],
            'siniestroSeleccionado': null
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
    
    function telefono_valido(telefonoStr) {
        return /^\d{9}$/.test(telefonoStr);
    }
    
    function dni_valido(dniStr) {
        var patronN = /^\d{8}[a-zA-Z]$/,
            patronE = /^[a-zA-Z]\d{7}[a-zA-Z]$/;
        return patronN.test(dniStr) || patronE.test(dniStr);
    }
    
    function cp_valido(cpStr) {
        var patron = /^\d{5}$/;
        return patron.test(cpStr);
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
    function cargar_abiertos_cabecera(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            alert('cargar_abiertos_cabecera(responseTxt, statusTxt)');
        } else {
            alerta('Error 404', 'no se pudo cargar abiertos.html');
        }
    }
    
    function cargar_abiertos(responseTxt, statusTxt) {
        var contenedor = $(this).children('.container-fluid');
        if (statusTxt == 'success') {
            alert('cargar_abiertos(responseTxt, statusTxt)');
            contenedor.children('.buscador').children('.col-12').load('Html/abiertos.html', cargar_abiertos_cabecera);
        } else {
            alerta('Error 404', 'no se pudo cargar buscador.html');
        }
    }
    
    function cargar_cerrados_cabecera(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            alert('cargar_cerrados_cabecera(responseTxt, statusTxt)');
        } else {
            alerta('Error 404', 'no se pudo cargar cerrados.html');
        }
    }
    
    function cargar_cerrados(responseTxt, statusTxt) {
        var contenedor = $(this).children('.container-fluid');
        if (statusTxt == 'success') {
            alert('cargar_cerrados(responseTxt, statusTxt)');
            contenedor.children('.buscador').children('.col-12').load('Html/cerrados.html', cargar_cerrados_cabecera);
        } else {
            alerta('Error 404', 'no se pudo cargar buscador.html');
        }
    }
    
    // Cargar paginas y aplicar controles
    // ====================================================================== //
    contenedor.children('.ocultable').children('.ocultable-titulo').click(ocultable_click);
    $('#abiertos').load('Html/buscador.html', cargar_abiertos);
    $('#cerrados').load('Html/buscador.html', cargar_cerrados);
    
    // Inicializacion de aspecto y colores
    // ====================================================================== //
    $("#ventana").css("border-color", colorBorde);
    $("#ventana").css("background-color", colorFondo);
    contenedor.children('.cerrados').children('.ocultable-contenido').hide();
});