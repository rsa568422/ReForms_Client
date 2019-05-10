$(document).ready(function() {

    // Variables
    // ====================================================================== //
    var googleKey = sessionStorage.googleKey,
        colorBorde = $('#btn-jornadas').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.1)',
        colorJornada = colorBorde.substring(0, colorBorde.length - 1) + ', 0.5)',
        sinColor = 'rgb(0, 0, 0, 0)',
        jornadas = {
            'listaJornadas': [],
            'jornadaSeleccionada': null,
            'posicionSeleccionada': -1
        },
        grupos = {
            'listaGrupos': [],
            'grupoSeleccionado': null,
            'posicionSeleccionado': -1
        }
        componentes = {
            'contenedor': $('#ventana').children('div[class="container-fluid"]'),
            'calendario': {
                'fecha': $('#ventana').children('div[class="container-fluid"]').children('div.row').children('div.calendario').children('input[name="fecha"]'),
                'tbody': $('#ventana').children('div[class="container-fluid"]').children('div.row').children('div.calendario').children('table').children('tbody'),
                'nueva': $('#ventana').children('div[class="container-fluid"]').children('div.row').children('div.calendario').children('button[name="nueva"]')
            },
            'jornada': $('#ventana').children('div[class="container-fluid"]').children('div.row').children('div.jornada')
        },
        edicion = false;
        
    // Funciones auxiliares
    // ====================================================================== //
    function alerta(titulo, mensaje) {
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-header').children('.modal-title').html(titulo);
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-body').html(mensaje);
        $('#activador-alerta').click();
    }
    
    function mostrar_calendario(primero, maximo) {
        var semana, actual = 1, posicion = 0;
        componentes.calendario.tbody.children('tr.semana').remove();
        semana = '<tr class="semana">';
        if (primero > 0) {
            semana += '<td colspan="' + primero + '"></td>';
            posicion = primero;
        }
        for (posicion; posicion < 7; posicion++) {
            semana += '<td><div name="' + actual + '" class="dia"><h5>' + actual + '</h5></div></td>';
            actual++;
        }
        semana += '</tr>';
        if (maximo > 0) {
            componentes.calendario.tbody.append(semana);
        }
        while (actual <= maximo) {
            semana = '<tr class="semana">';
            if ((actual + 6) <= maximo) {
                for (posicion = 0; posicion < 7; posicion++) {
                    semana += '<td><div name="' + actual + '" class="dia"><h5>' + actual + '</h5></div></td>';
                    actual++;
                }
                semana += '</tr>';
                componentes.calendario.tbody.append(semana);
            } else {
                posicion = 0;
                for (actual; actual <= maximo; actual++) {
                    semana += '<td><div name="' + actual + '" class="dia"><h5>' + actual + '</h5></div></td>';
                    posicion++;
                }
                semana += '<td colspan="' + (7 - posicion) + '"></td>';
                semana += '</tr>';
                componentes.calendario.tbody.append(semana);
            }    
        }
        componentes.calendario.tbody.find('.dia').css({'border-color':colorBorde, 'background-color':sinColor}).click(dia_click);
        if (jornadas.listaJornadas.length > 0) {
            var i, dia;
            for (i = 0; i < jornadas.listaJornadas.length; i++) {
                dia = (new Date(jornadas.listaJornadas[i].fecha)).getDate();
                componentes.calendario.tbody.children('tr').children('td').children('div[name="' + dia + '"]').css('background-color', colorJornada).prop('i', i);
            }
        }
    }
    
    function actualizar_calendario(a, m, d, tbody) {
        $.get('http://localhost:8080/ReForms_Provider/wr/jornada/infoMes/' + a + '/' + m, function(data, status) {
            if (status == 'success') {
                var primero = new Number(data.slice(0, data.indexOf('/'))),
                    maximo = new Number(data.slice(data.indexOf('/') + 1, data.length)),
                    semana, actual = 1, posicion = 0;
                $.get('http://localhost:8080/ReForms_Provider/wr/jornada/contarJornadaPorMes/' + a + '/' + m, function(data, status) {
                    if (status == 'success') {
                        var n = Number(data);
                        jornadas.posicionSeleccionada = -1;
                        jornadas.jornadaSeleccionada = null;
                        componentes.calendario.nueva.prop('disabled', true);
                        componentes.jornada.hide();
                        if (n > 0) {
                            $.get('http://localhost:8080/ReForms_Provider/wr/jornada/buscarJornadaPorMes/' + a + '/' + m, function(data, status) {
                                if (status == 'success') {
                                    jornadas.listaJornadas = data;
                                    mostrar_calendario(primero, maximo);
                                    if (d != null && d > 0) {
                                        componentes.calendario.tbody.children('tr.semana').children('td').children('div.dia[name="' + d + '"]').click();
                                    }
                                } else {
                                    alert('fallo en proveedor');
                                }
                            }, 'json');
                        } else {
                            jornadas.listaJornadas = [];
                            mostrar_calendario(primero, maximo);
                        }
                    } else {
                        alert('fallo en proveedor');
                    }
                }, 'text');
            } else {
                alert('fallo en proveedor');
            }
        }, 'text');
    }
    
    function generar_msgFecha(fecha) {
        var f, y, m, d, msgFecha = 'Jornada del ';
        if (fecha.indexOf('T') > 0) {
            f = fecha.slice(0, fecha.indexOf('T'));
        } else {
            f = fecha;
        }
        y = f.slice(0, f.indexOf('-'));
        m = f.slice(f.indexOf('-') + 1, fecha.lastIndexOf('-'));
        d = f.slice(fecha.lastIndexOf('-') + 1, fecha.length);
        f = new Date(y, m - 1, d);
        switch (f.getDay()) {
            case 0: msgFecha += 'Domingo '; break;
            case 1: msgFecha += 'Lunes '; break;
            case 2: msgFecha += 'Martes '; break;
            case 3: msgFecha += 'Miercoles '; break;
            case 4: msgFecha += 'Jueves '; break;
            case 5: msgFecha += 'Viernes '; break;
            case 6: msgFecha += 'Sabado '; break;
        }
        msgFecha += f.getDate() + ' de ';
        switch (f.getMonth()) {
            case 0: msgFecha += 'Enero de '; break;
            case 1: msgFecha += 'Febrero de '; break;
            case 2: msgFecha += 'Marzo de '; break;
            case 3: msgFecha += 'Abril de '; break;
            case 4: msgFecha += 'Mayo de '; break;
            case 5: msgFecha += 'Junio de '; break;
            case 6: msgFecha += 'Julio de '; break;
            case 7: msgFecha += 'Agosto de '; break;
            case 8: msgFecha += 'Septiembre de '; break;
            case 9: msgFecha += 'Octubre de '; break;
            case 10: msgFecha += 'Noviembre de '; break;
            case 11: msgFecha += 'Diciembre de '; break;
        }
        return msgFecha + f.getFullYear();
    }
    
    // Funciones controladoras para componentes
    // ====================================================================== //
    function dia_click() {
        if (!edicion) {
            if ($(this).hasClass('seleccionado')) {
                $(this).removeClass('seleccionado');
                jornadas.posicionSeleccionada = -1;
                jornadas.jornadaSeleccionada = null;
                componentes.calendario.nueva.prop('disabled', true);
                componentes.jornada.hide();
            } else {
                $(this).addClass('seleccionado');
                $(this).parent('td').parent('tr').parent('tbody').find('.dia').not($(this)).removeClass('seleccionado');
                if ($(this).prop('i') || $(this).prop('i') == 0) {
                    jornadas.posicionSeleccionada = Number($(this).prop('i'));
                    jornadas.jornadaSeleccionada = jornadas.listaJornadas[jornadas.posicionSeleccionada];
                    componentes.calendario.nueva.prop('disabled', true);
                    componentes.jornada.show();
                    componentes.jornada.load('Html/jornada.html', cargar_jornada);
                } else {
                    jornadas.posicionSeleccionada = -1;
                    jornadas.jornadaSeleccionada = null;
                    componentes.calendario.nueva.prop('disabled', false);
                    componentes.jornada.hide();
                }
            }
        }
    }
    
    function jornada_editar_click() {
        var card = componentes.jornada.children('div.contenedor').children('div.card');
        edicion = true;
        componentes.calendario.fecha.prop('disabled', true);
        card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('textarea.observaciones').prop('readonly', false).focus();
        $(this).hide();
        $(this).siblings('button.btn').show();
        card.children('div.card-footer').slideUp();
    }
    
    function jornada_aceptar_click() {
        var card = componentes.jornada.children('div.contenedor').children('div.card'),
            observaciones = card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('textarea.observaciones'),
            temporal = new Jornada();
        temporal.id = jornadas.jornadaSeleccionada.id;
        temporal.gerente = jornadas.jornadaSeleccionada.gerente;
        temporal.fecha = jornadas.jornadaSeleccionada.fecha;
        if (observaciones.val() != '') {
            temporal.observaciones = observaciones.val();
        }
        $.ajax({
            url: 'http://localhost:8080/ReForms_Provider/wr/jornada/actualizarJornada/' + temporal.id,
            dataType: 'json',
            type: 'put',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(temporal),
            processData: false,
            success: function(data, textStatus, jQxhr){
                jornadas.jornadaSeleccionada = temporal;
                jornadas.listaJornadas.splice(jornadas.posicionSeleccionada, 1, temporal);
                card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-cancelar').click();
            },
            error: function(jQxhr, textStatus, errorThrown){
                alerta('Error en proveedor', 'no ha sido posible actualizar la jornada');
            }
        });
    }
    
    function jornada_cancelar_click() {
        var card = componentes.jornada.children('div.contenedor').children('div.card');
        edicion = false;
        componentes.calendario.fecha.prop('disabled', false);
        if (jornadas.jornadaSeleccionada.observaciones && jornadas.jornadaSeleccionada.observaciones != null && jornadas.jornadaSeleccionada.observaciones != '') {
            card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('textarea.observaciones').val(jornadas.jornadaSeleccionada.observaciones).prop('readonly', true);;
        } else {
            card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('textarea.observaciones').val('').prop('readonly', true);;
        }
        card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-editar').show();
        card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-aceptar').hide();
        card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-cancelar').hide();
        card.children('div.card-footer').slideDown();
    }
    
    function jornada_nueva_click() {
        edicion = true;
        componentes.calendario.fecha.prop('disabled', true);
        componentes.calendario.nueva.prop('disabled', true);
        componentes.jornada.show();
        componentes.jornada.load('Html/jornada.html', cargar_jornada_nueva);
    }
    
    function jornada_nueva_aceptar_click() {
        var observaciones = componentes.jornada.children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('textarea.observaciones'),
            fecha = componentes.calendario.fecha.val().slice(0, componentes.calendario.fecha.val().lastIndexOf('-') + 1),
            dia = Number(componentes.calendario.tbody.children('tr.semana').children('td').children('div.seleccionado').attr('name')),
            operador = JSON.parse(sessionStorage.usuario),
            j = new Jornada();
        fecha += dia < 10 ? '0' + dia : dia;
        j.gerente = operador[0];
        j.fecha = new Date(fecha);
        if (observaciones.val() != '') {
            j.observaciones = observaciones.val();
        }
        $.ajax({
            url: 'http://localhost:8080/ReForms_Provider/wr/jornada/registrarJornada',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(j),
            processData: false,
            success: function(data, textStatus, jQxhr){
                actualizar_calendario(fecha.slice(0, fecha.indexOf('-')), fecha.slice(fecha.indexOf('-') + 1, fecha.lastIndexOf('-')), dia, componentes.calendario.tbody);
            },
            error: function(jQxhr, textStatus, errorThrown){
                // no se ha registrado la jornada
                alert('fallo en el proveedor');
            }
        });
        
        $(this).siblings('button.btn-cancelar').click();
    }
    
    function jornada_nueva_cancelar_click() {
        edicion = false;
        componentes.calendario.fecha.prop('disabled', false);
        componentes.calendario.nueva.prop('disabled', false);
        componentes.jornada.hide();
    }
    
    function fecha_change() {
        var fecha = $(this).val(),
            a = fecha.slice(0, fecha.indexOf('-')),
            m = fecha.slice(fecha.indexOf('-') + 1, fecha.lastIndexOf('-'));
        fecha = a + '-' + m + '-01';
        $(this).val(fecha);
        actualizar_calendario(a, m, null, componentes.calendario.tbody);
    }
    
    // Funciones para cargar paginas y definir su comportamiento
    // ====================================================================== //
    function cargar_jornada(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var card = componentes.jornada.children('div.contenedor').children('div.card'),
                msgGerente = 'Generada por: ';
            card.children('div.card-header').children('div.container-fluid').children('div.row').children('div.col-12').children('h4.fecha').text(generar_msgFecha(jornadas.jornadaSeleccionada.fecha));
            msgGerente += jornadas.jornadaSeleccionada.gerente.trabajador.nombre + ' ' + jornadas.jornadaSeleccionada.gerente.trabajador.apellido1;
            if (jornadas.jornadaSeleccionada.gerente.trabajador.apellido2) {
                msgGerente += ' ' + jornadas.jornadaSeleccionada.gerente.trabajador.apellido2;
            }
            card.children('div.card-header').children('div.container-fluid').children('div.row').children('div.col-12').children('h5.gerente').text(msgGerente);
            if (jornadas.jornadaSeleccionada.observaciones && jornadas.jornadaSeleccionada.observaciones != null && jornadas.jornadaSeleccionada.observaciones != '') {
                card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('textarea.observaciones').val(jornadas.jornadaSeleccionada.observaciones);
            }
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-editar').css({'border-color':colorBorde, 'background-color':colorFondo}).click(jornada_editar_click);
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-aceptar').hide().click(jornada_aceptar_click);
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-cancelar').hide().click(jornada_cancelar_click);
            card.css('border-color', colorBorde);
            card.children('div').css('border-color', colorBorde);
            card.children('div.card-header').css('background-color', colorBorde);
            card.children('div').not('div.card-header').css('background-color', colorFondo);
        } else {
            alerta('Error 404', 'no se pudo cargar jornada.html');
            edicion = false;
            componentes.calendario.fecha.prop('disabled', false);
            componentes.calendario.nueva.prop('disabled', false);
            componentes.jornada.hide();
        }
    }
    
    function cargar_jornada_nueva(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var card = componentes.jornada.children('div.contenedor').children('div.card'),
                fecha = componentes.calendario.fecha.val().slice(0, componentes.calendario.fecha.val().lastIndexOf('-') + 1),
                dia = Number(componentes.calendario.tbody.children('tr.semana').children('td').children('div.seleccionado').attr('name')),
                msgGerente = 'Generada por: ',
                operador = JSON.parse(sessionStorage.usuario);
            fecha += dia < 10 ? '0' + dia : dia;
            card.children('div.card-header').children('div.container-fluid').children('div.row').children('div.col-12').children('h4.fecha').text(generar_msgFecha(fecha));
            msgGerente += operador[0].trabajador.nombre + ' ' + operador[0].trabajador.apellido1;
            if (operador[0].trabajador.apellido2) {
                msgGerente += ' ' + operador[0].trabajador.apellido2;
            }
            card.children('div.card-header').children('div.container-fluid').children('div.row').children('div.col-12').children('h5.gerente').text(msgGerente);
            card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('textarea.observaciones').prop('readonly', false);
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-aceptar').click(jornada_nueva_aceptar_click);
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-cancelar').click(jornada_nueva_cancelar_click);
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-editar').remove();
            card.children('div.card-footer').remove();
            card.css('border-color', colorBorde);
            card.children('div').css('border-color', colorBorde);
            card.children('div.card-header').css('background-color', colorBorde);
            card.children('div').not('div.card-header').css('background-color', colorFondo);
        } else {
            alerta('Error 404', 'no se pudo cargar jornada.html');
            edicion = false;
            componentes.calendario.fecha.prop('disabled', false);
            componentes.calendario.nueva.prop('disabled', false);
            componentes.jornada.hide();
        }
    }
    
    // Cargar paginas y aplicar controles
    // ====================================================================== //
    var f = new Date(), y = f.getFullYear(), m = f.getMonth() + 1;
    componentes.calendario.fecha.val(y + (m < 10 ? '-0' + m : '-' + m) + '-01');
    componentes.calendario.fecha.change(fecha_change);
    componentes.calendario.nueva.click(jornada_nueva_click);
    actualizar_calendario(y, m, null, componentes.calendario.tbody);
    
    // Inicializacion de aspecto y colores
    // ====================================================================== //
    $("#ventana").css({'border-color':colorBorde, 'background-color':colorFondo});
    componentes.calendario.tbody.siblings('thead').children('tr').css("background-color", colorBorde);
    componentes.calendario.nueva.css({'border-color':colorBorde, 'background-color':colorFondo});
    componentes.jornada.hide();
});
