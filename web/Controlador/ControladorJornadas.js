$(document).ready(function() {

    // Variables
    // ====================================================================== //
    var googleKey = sessionStorage.googleKey,
        colorBorde = $('#btn-jornadas').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.1)',
        sinColor = 'rgb(0, 0, 0, 0)',
        contenedor = $('#ventana').children('div[class="container-fluid"]'),
        calendario = contenedor.children('div.row').children('div.calendario'),
        fecha = calendario.children('input[name="fecha"]'),
        tbody = calendario.children('table').children('tbody'),
        jornadas = {
            'listaJornadas': [],
            'jornadaSeleccionada': null
        },
        edicion = false;
    
    // Funciones auxiliares
    // ====================================================================== //
    function alerta(titulo, mensaje) {
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-header').children('.modal-title').html(titulo);
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-body').html(mensaje);
        $('#activador-alerta').click();
    }
    
    function mostrar_calendario(a, m, tbody) {
        $.get('http://localhost:8080/ReForms_Provider/wr/jornada/infoMes/' + a + '/' + m, function(data, status) {
            if (status == 'success') {
                var primero = new Number(data.slice(0, data.indexOf('/'))),
                    maximo = new Number(data.slice(data.indexOf('/') + 1, data.length)),
                    semana, actual = 1, posicion = 0;
                    
                $.get('http://localhost:8080/ReForms_Provider/wr/jornada/contarJornadaPorMes/' + a + '/' + m, function(data, status) {
                    if (status == 'success') {
                        $.get('http://localhost:8080/ReForms_Provider/wr/jornada/buscarJornadaPorMes/' + a + '/' + m, function(data, status) {
                            if (status == 'success') {
                                alert(data.length);
                            } else {
                                alert('no llega nada');
                            }
                        }, 'json');
                    } else {
                        alert('fallo en proveedor');
                    }
                }, 'text');
                
                tbody.children('tr.semana').remove();
                semana = '<tr class="semana">';
                if (primero > 0) {
                    semana += '<td colspan="' + primero + '"></td>';
                    posicion = primero;
                }
                for (posicion; posicion < 7; posicion++) {
                    semana += '<td><div class="dia"><h5>' + actual + '</h5></div></td>';
                    actual++;
                }
                semana += '</tr>';
                if (maximo > 0) {
                    tbody.append(semana);
                }
                while (actual <= maximo) {
                    semana = '<tr class="semana">';
                    if ((actual + 6) <= maximo) {
                        for (posicion = 0; posicion < 7; posicion++) {
                            semana += '<td><div class="dia"><h5>' + actual + '</h5></div></td>';
                            actual++;
                        }
                        semana += '</tr>';
                        tbody.append(semana);
                    } else {
                        posicion = 0;
                        for (actual; actual <= maximo; actual++) {
                            semana += '<td><div class="dia"><h5>' + actual + '</h5></div></td>';
                            posicion++;
                        }
                        semana += '<td colspan="' + (7 - posicion) + '"></td>';
                        semana += '</tr>';
                        tbody.append(semana);
                    }    
                }
                tbody.find('.dia').css({'border-color':colorBorde, 'background-color':sinColor}).click(dia_click);
            } else {
                alert('fallo en proveedor');
            }
        }, 'text');
    }
    
    // Funciones controladoras para componentes
    // ====================================================================== //
    function dia_click() {
        alert($(this).text());
        $(this).css('border-width', '3px');
        $(this).parent('td').parent('tr').parent('tbody').find('.dia').not($(this)).css('border-width', '1px');
    }
    
    function fecha_change() {
        var fecha = $(this).val(),
            a = fecha.slice(0, fecha.indexOf('-')),
            m = fecha.slice(fecha.indexOf('-') + 1, fecha.lastIndexOf('-'));
        fecha = a + '-' + m + '-01';
        $(this).val(fecha);
        mostrar_calendario(a, m, tbody);
    }
    
    // Funciones para cargar paginas y definir su comportamiento
    // ====================================================================== //
    function cargar_jornada(responseTxt, statusTxt) {
        
    }
    
    // Cargar paginas y aplicar controles
    // ====================================================================== //
    var f = new Date(), y = f.getFullYear(), m = f.getMonth() + 1;
    fecha.val(y + (m < 10 ? '-0' + m : '-' + m) + '-01');
    fecha.change(fecha_change);
    mostrar_calendario(y, m, tbody);
    
    // Inicializacion de aspecto y colores
    // ====================================================================== //
    $("#ventana").css({'border-color':colorBorde, 'background-color':colorFondo});
    tbody.siblings('thead').children('tr').css("background-color", colorBorde);
});
