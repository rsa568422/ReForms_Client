$(document).ready(function() {

    // Variables
    // ====================================================================== //
    var googleKey = sessionStorage.googleKey,
        colorBorde = $('#btn-jornadas').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.1)',
        colorJornada = colorBorde.substring(0, colorBorde.length - 1) + ', 0.5)',
        sinColor = 'rgb(0, 0, 0, 0)',
        seleccion_grup = {
            'jornadas': {
                'listaJornadas': [],
                'jornadaSeleccionada': null,
                'posicionSeleccionada': -1,
                'activosDisponibles': {
                    'operarios': [],
                    'vehiculos': []
                }
            },
            'grupos': {
                'listaGrupos': [],
                'infoGrupos': [],
                'grupoSeleccionado': null,
                'posicionSeleccionada': -1,
                'integrantes': {
                    'listaIntegrantes': [],
                    'conductor': null
                }
            },
            'grupo': {
                'listaIntegrantes': [],
                'conductor': null
            },
            'agenda': {
                'listaCitas': [],
                'citaSeleccionada': null,
                'posicionSeleccionada': -1
            }
        },
        seleccion_even = {
            'evento': null,
            'siniestros': {
                'listaSiniestros': [],
                'siniestroSeleccionado': null,
                'posicionSeleccionada': -1
            },
            'tareas': {
                'listaTareas': [],
                'tareaSeleccionada': null,
                'posicionSeleccionada': -1
            },
            'citas': {
                'listaCitas': [],
                'citaSeleccionada': null,
                'posicionSeleccionada': -1
            }
        },
        componentes = {
            'jornadas': {
                'div': $('#ventana').children('div.container-fluid').children('div.row').children('div.seleccion-grupo').children('div.jornadas'),
                'calendario': {
                    'fecha': null,
                    'tbody': null,
                    'nueva': null
                },
                'detalles': null
            },
            'jornada': {
                'div': $('#ventana').children('div.container-fluid').children('div.row').children('div.seleccion-grupo').children('div.jornada'),
                'select': null,
                'grupo': null,
                'agenda': {
                    'tbody': null,
                    'nueva': null,
                    'detalles': {
                        'div': null,
                        'cita': null,
                        'evento': null,
                        'tareas': null
                    }
                }
            },
            'siniestros': {
                'div': $('#ventana').children('div.container-fluid').children('div.row').children('div.seleccion-evento').children('div.siniestros'),
                'mapa': null,
                'tabla': {
                    'tbody': null,
                    'detalles': null
                }
            },
            'siniestro': {
                'div': $('#ventana').children('div.container-fluid').children('div.row').children('div.seleccion-evento').children('div.siniestro'),
                'resumen': {
                    'contactos': null,
                    'direccion': null
                },
                'tareas': {
                    'tbody': null,
                    'detalles': null
                },
                'citas': {
                    'tbody': null,
                    'detalles': null
                }
            }
        },
        espera_grupo = {
            'contador': 0,
            'conductor': false
        },
        edicion = false,
        edicion_grupo = false;
        
    // Funciones auxiliares
    // ====================================================================== //
    function alerta(titulo, mensaje) {
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-header').children('.modal-title').html(titulo);
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-body').html(mensaje);
        $('#activador-alerta').click();
    }
    
    function mostrar_calendario(primero, maximo) {
        var semana, actual = 1, posicion = 0;
        componentes.jornadas.calendario.tbody.children('tr.semana').remove();
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
            componentes.jornadas.calendario.tbody.append(semana);
        }
        while (actual <= maximo) {
            semana = '<tr class="semana">';
            if ((actual + 6) <= maximo) {
                for (posicion = 0; posicion < 7; posicion++) {
                    semana += '<td><div name="' + actual + '" class="dia"><h5>' + actual + '</h5></div></td>';
                    actual++;
                }
                semana += '</tr>';
                componentes.jornadas.calendario.tbody.append(semana);
            } else {
                posicion = 0;
                for (actual; actual <= maximo; actual++) {
                    semana += '<td><div name="' + actual + '" class="dia"><h5>' + actual + '</h5></div></td>';
                    posicion++;
                }
                semana += '<td colspan="' + (7 - posicion) + '"></td>';
                semana += '</tr>';
                componentes.jornadas.calendario.tbody.append(semana);
            }    
        }
        componentes.jornadas.calendario.tbody.find('.dia').css({'border-color':colorBorde, 'background-color':sinColor}).click(dia_click);
        if (seleccion_grup.jornadas.listaJornadas.length > 0) {
            var i, dia;
            for (i = 0; i < seleccion_grup.jornadas.listaJornadas.length; i++) {
                dia = (new Date(seleccion_grup.jornadas.listaJornadas[i].fecha)).getDate();
                componentes.jornadas.calendario.tbody.children('tr').children('td').children('div[name="' + dia + '"]').css('background-color', colorJornada).prop('i', i);
            }
        }
    }
    
    function actualizar_calendario(a, m, d) {
        $.get('http://localhost:8080/ReForms_Provider/wr/jornada/infoMes/' + a + '/' + m, function(data, status) {
            if (status == 'success') {
                var primero = new Number(data.slice(0, data.indexOf('/'))),
                    maximo = new Number(data.slice(data.indexOf('/') + 1, data.length)),
                    semana, actual = 1, posicion = 0;
                $.get('http://localhost:8080/ReForms_Provider/wr/jornada/contarJornadaPorMes/' + a + '/' + m, function(data, status) {
                    if (status == 'success') {
                        var n = Number(data);
                        seleccion_grup.jornadas.posicionSeleccionada = -1;
                        seleccion_grup.jornadas.jornadaSeleccionada = null;
                        componentes.jornadas.calendario.nueva.prop('disabled', true);
                        componentes.jornadas.detalles.hide();
                        if (n > 0) {
                            $.get('http://localhost:8080/ReForms_Provider/wr/jornada/buscarJornadaPorMes/' + a + '/' + m, function(data, status) {
                                if (status == 'success') {
                                    seleccion_grup.jornadas.listaJornadas = data;
                                    mostrar_calendario(primero, maximo);
                                    if (d != null && d > 0) {
                                        componentes.jornadas.calendario.tbody.children('tr.semana').children('td').children('div.dia[name="' + d + '"]').click();
                                    }
                                } else {
                                    alert('fallo en proveedor');
                                }
                            }, 'json');
                        } else {
                            seleccion_grup.jornadas.listaJornadas = [];
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
    
    function actualizar_tabla_grupos(listaGrupos, tbody) {
        tbody.children('tr.grupo').remove();
        if (listaGrupos.length > 0) {
            var i;
            for (i = 0; i < listaGrupos.length; i++) {
                tbody.append('<tr class="grupo"><td>' + listaGrupos[i].nombre + '</td><td>' + listaGrupos[i].zona + '</td></tr>');
            }
            tbody.children('tr.grupo').click(grupo_click);
        } else {
            tbody.append('<tr class="grupo"><td colspan="2"><h4>Sin grupos registrados</h4></td></tr>');
        }
    }
    
    function actualizar_tabla_integrantes(listaIntegrantes, conductor, tbody) {
        var i, icono, nombre;
        tbody.children('tr.integrante').remove();
        for (i = 0; i < listaIntegrantes.length; i++) {
            if (listaIntegrantes[i].operario.carnet) {
                if (listaIntegrantes[i].operario.id == conductor.conductor.id) {
                    icono = '<td class="icono seleccionado"><i class="material-icons">airline_seat_recline_extra</i></td>';
                } else {
                    icono = '<td class="icono"><i class="material-icons">airline_seat_recline_extra</i></td>';
                }
            } else {
                icono = '<td></td>';
            }
            nombre = listaIntegrantes[i].operario.trabajador.nombre;
            if (listaIntegrantes[i].operario.trabajador.apellido1 && listaIntegrantes[i].operario.trabajador.apellido1 != null && listaIntegrantes[i].operario.trabajador.apellido1 != '') {
                nombre += ' ' + listaIntegrantes[i].operario.trabajador.apellido1;
            }
            nombre = '<td class="nombre">' + nombre + '</td>';
            tbody.append('<tr class="integrante">' + icono + nombre + '</tr>');
        }
        tbody.children('tr.integrante').children('td.icono').not('td.seleccionado').children('i').css('color', colorJornada).hide();
        tbody.children('tr.integrante').children('td.seleccionado').children('i').css('color', colorBorde);
        tbody.children('tr.integrante').children('td.icono').children('i').click(icono_conductor_click);
    }
    
    function actualizar_tabla_citas(listaCitas, tbody) {
        tbody.children('tr.cita').remove();
        if (listaCitas.length > 0) {
            var i, cita;
            for (i = 0; i < listaCitas.length; i++) {
                cita = '<td>' + listaCitas[i].evento.descripcion + '</td>';
                cita += '<td>' + (listaCitas[i].hora > 9 ? listaCitas[i].hora : '0' + listaCitas[i].hora) + ':' + (listaCitas[i].minuto > 9 ? listaCitas[i].minuto : '0' + listaCitas[i].minuto) + '</td>';
                tbody.append('<tr class="cita">' + cita + '</tr>');
            }
            tbody.children('tr.cita').click(grupo_cita_click);
        } else {
            tbody.append('<tr class="cita"><td colspan="2"><h4>Sin citas registradas</h4></td></tr>');
        }
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
                seleccion_grup.jornadas.posicionSeleccionada = -1;
                seleccion_grup.jornadas.jornadaSeleccionada = null;
                componentes.jornadas.calendario.nueva.prop('disabled', true);
                componentes.jornadas.detalles.hide();
            } else {
                $(this).addClass('seleccionado');
                $(this).parent('td').parent('tr').parent('tbody').find('.dia').not($(this)).removeClass('seleccionado');
                if ($(this).prop('i') || $(this).prop('i') == 0) {
                    seleccion_grup.jornadas.posicionSeleccionada = Number($(this).prop('i'));
                    seleccion_grup.jornadas.jornadaSeleccionada = seleccion_grup.jornadas.listaJornadas[seleccion_grup.jornadas.posicionSeleccionada];
                    componentes.jornadas.calendario.nueva.prop('disabled', true);
                    componentes.jornadas.detalles.show();
                    componentes.jornadas.detalles.children('div.col-12').load('Html/jornada.html', cargar_jornada);
                } else {
                    seleccion_grup.jornadas.posicionSeleccionada = -1;
                    seleccion_grup.jornadas.jornadaSeleccionada = null;
                    componentes.jornadas.calendario.nueva.prop('disabled', false);
                    componentes.jornadas.detalles.hide();
                }
            }
        }
    }
    
    function jornada_editar_click() {
        var card = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card');
        edicion = true;
        componentes.jornadas.calendario.fecha.prop('disabled', true);
        card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('textarea.observaciones').prop('readonly', false).focus();
        $(this).hide();
        $(this).siblings('button.btn').not('button.btn-citas').show();
        $(this).siblings('button.btn-citas').hide();
        card.children('div.card-footer').slideUp();
    }
    
    function jornada_aceptar_click() {
        var card = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card'),
            observaciones = card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('textarea.observaciones'),
            temporal = new Jornada();
        temporal.id = seleccion_grup.jornadas.jornadaSeleccionada.id;
        temporal.gerente = seleccion_grup.jornadas.jornadaSeleccionada.gerente;
        temporal.fecha = seleccion_grup.jornadas.jornadaSeleccionada.fecha;
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
                seleccion_grup.jornadas.jornadaSeleccionada = temporal;
                seleccion_grup.jornadas.listaJornadas.splice(seleccion_grup.jornadas.posicionSeleccionada, 1, temporal);
                card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-cancelar').click();
            },
            error: function(jQxhr, textStatus, errorThrown){
                alerta('Error en proveedor', 'no ha sido posible actualizar la jornada');
            }
        });
    }
    
    function jornada_cancelar_click() {
        var card = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card');
        edicion = false;
        componentes.jornadas.calendario.fecha.prop('disabled', false);
        if (seleccion_grup.jornadas.jornadaSeleccionada.observaciones && seleccion_grup.jornadas.jornadaSeleccionada.observaciones != null && seleccion_grup.jornadas.jornadaSeleccionada.observaciones != '') {
            card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('textarea.observaciones').val(seleccion_grup.jornadas.jornadaSeleccionada.observaciones).prop('readonly', true);;
        } else {
            card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('textarea.observaciones').val('').prop('readonly', true);;
        }
        card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-editar').show();
        card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-aceptar').hide();
        card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-cancelar').hide();
        if (seleccion_grup.grupos.listaGrupos.length > 0) {
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-citas').show();
        } else {
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-citas').hide();
        }
        card.children('div.card-footer').slideDown();
    }
    
    function jornada_nueva_click() {
        edicion = true;
        componentes.jornadas.calendario.fecha.prop('disabled', true);
        componentes.jornadas.calendario.nueva.prop('disabled', true);
        componentes.jornadas.detalles.show();
        componentes.jornadas.detalles.children('div.col-12').load('Html/jornada.html', cargar_jornada_nueva);
    }
    
    function jornada_nueva_aceptar_click() {
        var observaciones = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('textarea.observaciones'),
            fecha = componentes.jornadas.calendario.fecha.val().slice(0, componentes.jornadas.calendario.fecha.val().lastIndexOf('-') + 1),
            dia = Number(componentes.jornadas.calendario.tbody.children('tr.semana').children('td').children('div.seleccionado').attr('name')),
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
                actualizar_calendario(fecha.slice(0, fecha.indexOf('-')), fecha.slice(fecha.indexOf('-') + 1, fecha.lastIndexOf('-')), dia);
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
        componentes.jornadas.calendario.fecha.prop('disabled', false);
        componentes.jornadas.calendario.nueva.prop('disabled', false);
        componentes.jornadas.detalles.hide();
    }
    
    function grupo_click() {
        if (!edicion) {
            var footer = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-footer'),
                tbody = footer.children('div.container-fluid').children('div.tabla').children('div.col-12').children('div.table-responsive-md').children('table.table').children('tbody'),
                grupo = footer.children('div.container-fluid').children('div.grupo');
            if (seleccion_grup.grupos.posicionSeleccionada == $(this).index()) {
                seleccion_grup.grupos.grupoSeleccionado = null;
                seleccion_grup.grupos.posicionSeleccionada = -1;
                seleccion_grup.grupos.integrantes.listaIntegrantes = [];
                seleccion_grup.grupos.integrantes.conductor = null;
                $(this).css('background-color', sinColor);
                grupo.hide();
            } else {
                seleccion_grup.grupos.posicionSeleccionada = $(this).index();
                seleccion_grup.grupos.grupoSeleccionado = seleccion_grup.grupos.listaGrupos[seleccion_grup.grupos.posicionSeleccionada];
                seleccion_grup.grupos.integrantes.listaIntegrantes = [];
                seleccion_grup.grupos.integrantes.conductor = null;
                tbody.children('tr.grupo').css('background-color', sinColor);
                $(this).css('background-color', colorFondo);
                grupo.children('div.col-12').load('Html/grupo.html', cargar_grupo);
                grupo.show();
            }
        }
    }
    
    function grupo_editar_click() {
        var card = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card'),
            editar = card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-editar'),
            nuevo = card.children('div.card-footer').children('div.container-fluid').children('div.tabla').children('div.col-12').children('div.table-responsive-md').children('button.btn-nuevo'),
            card_footer = card.children('div.card-footer').children('div.container-fluid').children('div.grupo').children('div.col-12').children('div.contenedor').children('div.card'),
            activos = card_footer.children('div.card-body').children('div.container-fluid').children('div.activos'),
            nuevo_operario = activos.children('div.integrantes').children('div.nuevo'),
            select_vehiculo = activos.children('div.vehiculo').children('select[name="grupo_vehiculo"]'),
            tbody = activos.children('div.integrantes').children('table').children('tbody'),
            observaciones = card_footer.children('div.card-body').children('div.container-fluid').children('div.observaciones').children('div.col-12').children('textarea'),
            botones = card_footer.children('div.card-body').children('div.container-fluid').children('div.botones');
        edicion = true;
        edicion_grupo = true;
        componentes.jornadas.calendario.fecha.prop('disabled', true);
        editar.prop('disabled', true);
        nuevo.prop('disabled', true);
        nuevo_operario.show();
        select_vehiculo.prop('disabled', false);
        observaciones.prop('readonly', false);
        tbody.children('tr.integrante').children('td.icono').children('i').show();
        botones.children('button.btn-editar').hide();
        botones.children('button.btn-aceptar').show();
        botones.children('button.btn-cancelar').show();
        card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-citas').hide();
    }
    
    function grupo_aceptar_click() {
        alert('grupo_aceptar_click()');
        $(this).siblings('button.btn-cancelar').click();
    }
    
    function grupo_cancelar_click() {
        var card = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card'),
            editar = card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-editar'),
            nuevo = card.children('div.card-footer').children('div.container-fluid').children('div.tabla').children('div.col-12').children('div.table-responsive-md').children('button.btn-nuevo'),
            card_footer = card.children('div.card-footer').children('div.container-fluid').children('div.grupo').children('div.col-12').children('div.contenedor').children('div.card'),
            activos = card_footer.children('div.card-body').children('div.container-fluid').children('div.activos'),
            nuevo_operario = activos.children('div.integrantes').children('div.nuevo'),
            select_operario = nuevo_operario.children('div.input-group').children('select[name="grupo_operario"]'),
            select_vehiculo = activos.children('div.vehiculo').children('select[name="grupo_vehiculo"]'),
            tbody = activos.children('div.integrantes').children('table').children('tbody'),
            observaciones = card_footer.children('div.card-body').children('div.container-fluid').children('div.observaciones').children('div.col-12').children('textarea'),
            botones = card_footer.children('div.card-body').children('div.container-fluid').children('div.botones');
        edicion = false;
        edicion_grupo = false;
        actualizar_tabla_integrantes(seleccion_grup.grupos.integrantes.listaIntegrantes, seleccion_grup.grupos.integrantes.conductor , tbody);
        select_operario.children('option').remove();
        if (seleccion_grup.jornadas.activosDisponibles.operarios.length > 0) {
            select_operario.append('<option value=-1>Seleccione operario...</option>');
            for (i = 0; i < seleccion_grup.jornadas.activosDisponibles.operarios.length; i++) {
                opcion = seleccion_grup.jornadas.activosDisponibles.operarios[i].trabajador.nombre;
                if (seleccion_grup.jornadas.activosDisponibles.operarios[i].trabajador.apellido1 && seleccion_grup.jornadas.activosDisponibles.operarios[i].trabajador.apellido1 != null && seleccion_grup.jornadas.activosDisponibles.operarios[i].trabajador.apellido1 != '') {
                    opcion += ' ' + seleccion_grup.jornadas.activosDisponibles.operarios[i].trabajador.apellido1;
                }
                select_operario.append('<option value=' + i + '>' + opcion + '</option>');
            }
        } else {
            select_operario.append('<option value=-1>Sin operarios disponibles...</option>');
        }
        componentes.jornadas.calendario.fecha.prop('disabled', false);
        editar.prop('disabled', false);
        nuevo.prop('disabled', false);
        select_operario.val(-1);
        select_vehiculo.prop('disabled', true).val(-1);
        observaciones.prop('readonly', true);
        if (seleccion_grup.grupos.grupoSeleccionado.observaciones && seleccion_grup.grupos.grupoSeleccionado.observaciones != null && seleccion_grup.grupos.grupoSeleccionado.observaciones != '') {
            observaciones.val(seleccion_grup.grupos.grupoSeleccionado.observaciones);
        } else {
            observaciones.val('');
        }
        nuevo_operario.hide();
        tbody.children('tr.integrante').children('td.icono').not('td.seleccionado').children('i').hide();
        botones.children('button.btn-editar').show();
        botones.children('button.btn-aceptar').hide();
        botones.children('button.btn-cancelar').hide();
        if (seleccion_grup.grupos.listaGrupos.length > 0) {
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-citas').show();
        } else {
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-citas').hide();
        }
    }
    
    function grupo_citas_click() {
        var cabecera = componentes.jornada.div.children('div.cabecera').children('div.container-fluid').children('div.row').children('div.col-12'),
            i, opcion, msgGerente = 'Generada por: ';
        cabecera.children('h4.fecha').text(generar_msgFecha(seleccion_grup.jornadas.jornadaSeleccionada.fecha));
        msgGerente += seleccion_grup.jornadas.jornadaSeleccionada.gerente.trabajador.nombre + ' ' + seleccion_grup.jornadas.jornadaSeleccionada.gerente.trabajador.apellido1;
        if (seleccion_grup.jornadas.jornadaSeleccionada.gerente.trabajador.apellido2) {
            msgGerente += ' ' + seleccion_grup.jornadas.jornadaSeleccionada.gerente.trabajador.apellido2;
        }
        cabecera.children('h5.gerente').text(msgGerente);
        componentes.jornada.select.children('option').remove();
        for (i = 0; i < seleccion_grup.grupos.listaGrupos.length; i++) {
            opcion = '<option value=' + i + '>' + seleccion_grup.grupos.infoGrupos[i].nombre + '</option>';
            componentes.jornada.select.append(opcion);
        }
        if (seleccion_grup.grupos.grupoSeleccionado != null && seleccion_grup.grupos.posicionSeleccionada != -1) {
            componentes.jornada.select.val(seleccion_grup.grupos.posicionSeleccionada);
        }
        componentes.jornada.select.change();
        componentes.jornadas.div.hide();
        componentes.jornada.div.show();
    }
    
    function grupo_nuevo_click() {
        var footer = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-footer'),
            grupo = footer.children('div.container-fluid').children('div.grupo');
        edicion = true;
        edicion_grupo = true;
        seleccion_grup.grupos.grupoSeleccionado = null;
        seleccion_grup.grupos.posicionSeleccionada = -1;
        seleccion_grup.grupos.integrantes.listaIntegrantes = [];
        seleccion_grup.grupos.integrantes.conductor = null;
        componentes.jornadas.calendario.fecha.prop('disabled', true);
        footer.children('div.container-fluid').children('div.tabla').children('div.col-12').children('div.table-responsive-md').children('button.btn-nuevo').prop('disabled', true);
        footer.siblings('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-editar').prop('disabled', true);
        componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-citas').hide();
        grupo.children('div.col-12').load('Html/grupo.html', cargar_grupo_nuevo);
        grupo.show();
    }
    
    function grupo_nuevo_aceptar_click() {
        var activos = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-footer').children('div.container-fluid').children('div.grupo').children('div.col-12').children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.activos'),
            grupoVehiculo = activos.children('div.vehiculo').children('select[name="grupo_vehiculo"]'),
            trs = activos.children('div.integrantes').children('table').children('tbody').children('tr.integrante'),
            observaciones = activos.siblings('div.observaciones').children('div.col-12').children('textarea'),
            conductor = seleccion_grup.jornadas.activosDisponibles.operarios[Number(trs.children('td.seleccionado').siblings('td.nombre').children('span.pos').text())],
            vehiculo = seleccion_grup.jornadas.activosDisponibles.vehiculos[grupoVehiculo.val()],
            i, g, pos;
        seleccion_grup.grupos.integrantes.listaIntegrantes = [];
        for (i = 0; i < trs.length; i++) {
            pos = Number(trs.eq(i).children('td.nombre').children('span.pos').text());
            seleccion_grup.grupos.integrantes.listaIntegrantes.push(seleccion_grup.jornadas.activosDisponibles.operarios[pos]);
        }
        seleccion_grup.grupos.integrantes.conductor = new Conductor();
        seleccion_grup.grupos.integrantes.conductor.conductor = conductor;
        seleccion_grup.grupos.integrantes.conductor.vehiculo = vehiculo;
        g = new Grupo();
        g.jornada = seleccion_grup.jornadas.jornadaSeleccionada;
        if (observaciones.val() != '') {
            g.observaciones = observaciones.val();
        }
        $.ajax({
            url: 'http://localhost:8080/ReForms_Provider/wr/grupo/agregarGrupo',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(g),
            processData: false,
            success: function(data, textStatus, jQxhr){
                var i, integrante;
                seleccion_grup.grupos.posicionSeleccionada = seleccion_grup.grupos.listaGrupos.length;
                seleccion_grup.grupos.listaGrupos.push(data);
                seleccion_grup.grupos.grupoSeleccionado = data;
                espera_grupo.contador = 0;
                espera_grupo.conductor = false;
                for (i = 0; i < seleccion_grup.grupos.integrantes.listaIntegrantes.length; i++) {
                    integrante = new Integrante();
                    integrante.grupo = seleccion_grup.grupos.grupoSeleccionado;
                    integrante.operario = seleccion_grup.grupos.integrantes.listaIntegrantes[i];
                    $.ajax({
                        url: 'http://localhost:8080/ReForms_Provider/wr/integrante/agregarIntegrante',
                        dataType: 'json',
                        type: 'post',
                        contentType: 'application/json;charset=UTF-8',
                        data: JSON.stringify(integrante),
                        processData: false,
                        success: function(data, textStatus, jQxhr){
                            espera_grupo.contador++;
                            if (espera_grupo.contador == seleccion_grup.grupos.integrantes.listaIntegrantes.length && espera_grupo.conductor) {
                                edicion = false;
                                edicion_grupo = false;
                                componentes.jornadas.calendario.fecha.prop('disabled', false);
                                componentes.jornadas.detalles.children('div.col-12').load('Html/jornada.html', cargar_jornada);
                            }
                        },
                        error: function(jQxhr, textStatus, errorThrown){
                            // no se ha registrado el integrante
                            alert('fallo en el proveedor - no se ha registrado el integrante');
                        }
                    });
                }
                seleccion_grup.grupos.integrantes.conductor.grupo = seleccion_grup.grupos.grupoSeleccionado;
                $.ajax({
                    url: 'http://localhost:8080/ReForms_Provider/wr/conductor/agregarConductor',
                    dataType: 'json',
                    type: 'post',
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify(seleccion_grup.grupos.integrantes.conductor),
                    processData: false,
                    success: function(data, textStatus, jQxhr){
                        espera_grupo.conductor = true;
                        if (espera_grupo.contador == seleccion_grup.grupos.integrantes.listaIntegrantes.length && espera_grupo.conductor) {
                            edicion = false;
                            edicion_grupo = false;
                            componentes.jornadas.calendario.fecha.prop('disabled', false);
                            componentes.jornadas.detalles.children('div.col-12').load('Html/jornada.html', cargar_jornada);
                        }
                    },
                    error: function(jQxhr, textStatus, errorThrown){
                        // no se ha registrado el conductor
                        alert('fallo en el proveedor - no se ha registrado el conductor');
                    }
                });
            },
            error: function(jQxhr, textStatus, errorThrown){
                // no se ha registrado el grupo
                alert('fallo en el proveedor - no se ha registrado el grupo');
            }
        });
    }
    
    function grupo_nuevo_cancelar_click() {
        var footer = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-footer'),
            grupo = footer.children('div.container-fluid').children('div.grupo');
        edicion = false;
        edicion_grupo = false;
        componentes.jornadas.calendario.fecha.prop('disabled', false);
        footer.children('div.container-fluid').children('div.tabla').children('div.col-12').children('div.table-responsive-md').children('button.btn-nuevo').prop('disabled', false);
        footer.siblings('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-editar').prop('disabled', false);
        if (seleccion_grup.grupos.listaGrupos.length > 0) {
            componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-citas').show();
        } else {
            componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-citas').hide();
        }
        grupo.hide();
    }
    
    function icono_conductor_click() {
        var activos = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-footer').children('div.container-fluid').children('div.grupo').children('div.col-12').children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.activos'),
            grupoVehiculo = activos.children('div.vehiculo').children('select[name="grupo_vehiculo"]'),
            tbody = activos.children('div.integrantes').children('table').children('tbody');
        if (edicion && edicion_grupo) {
            if ($(this).parent('td.icono').hasClass('seleccionado')) {
                $(this).css('color', colorJornada).parent('td.icono').removeClass('seleccionado');
            } else {
                tbody.children('tr.integrante').children('td.icono').children('i').css('color', colorJornada);
                tbody.children('tr.integrante').children('td.icono').removeClass('seleccionado');
                $(this).css('color', colorBorde).parent('td.icono').addClass('seleccionado');
            }
            grupoVehiculo.change();
        }
    }
    
    function grupo_operario_aceptar_click() {
        var activos = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-footer').children('div.container-fluid').children('div.grupo').children('div.col-12').children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.activos'),
            grupoOperario = activos.children('div.integrantes').children('div.nuevo').children('div.input-group').children('select[name="grupo_operario"]'),
            tbody = activos.children('div.integrantes').children('table').children('tbody'),
            icono, pos = grupoOperario.val();
        if (seleccion_grup.jornadas.activosDisponibles.operarios[pos].carnet) {
            icono = '<td class="icono"><i class="material-icons">airline_seat_recline_extra</i></td>';
        } else {
            icono = '<td></td>';
        }
        nombre = seleccion_grup.jornadas.activosDisponibles.operarios[pos].trabajador.nombre;
        if (seleccion_grup.jornadas.activosDisponibles.operarios[pos].trabajador.apellido1 && seleccion_grup.jornadas.activosDisponibles.operarios[pos].trabajador.apellido1 != null && seleccion_grup.jornadas.activosDisponibles.operarios[pos].trabajador.apellido1 != '') {
            nombre += ' ' + seleccion_grup.jornadas.activosDisponibles.operarios[pos].trabajador.apellido1;
        }
        nombre = '<td class="nombre">' + nombre + '<span class="pos">' + pos + '</span></td>';
        tbody.append('<tr class="integrante nuevo">' + icono + nombre + '</tr>');
        tbody.children('tr.nuevo:last-child').children('td.icono').css('color', colorJornada).children('i').click(icono_conductor_click);
        tbody.children('tr.nuevo:last-child').children('td.nombre').children('span.pos').hide();
        grupoOperario.children('option[value="' + pos + '"]').remove();
        if (grupoOperario.children('option').length == 1) {
            grupoOperario.children('option').remove();
            grupoOperario.append('<option value=-1>Sin operarios disponibles...</option>');
        }
        grupoOperario.val(-1).change();
    }
    
    function grupo_nuevo_operario_aceptar_click() {
        var activos = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-footer').children('div.container-fluid').children('div.grupo').children('div.col-12').children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.activos'),
            grupoOperario = activos.children('div.integrantes').children('div.nuevo').children('div.input-group').children('select[name="grupo_operario"]'),
            tbody = activos.children('div.integrantes').children('table').children('tbody'),
            icono, pos = grupoOperario.val();
        if (seleccion_grup.jornadas.activosDisponibles.operarios[pos].carnet) {
            icono = '<td class="icono"><i class="material-icons">airline_seat_recline_extra</i></td>';
        } else {
            icono = '<td></td>';
        }
        nombre = seleccion_grup.jornadas.activosDisponibles.operarios[pos].trabajador.nombre;
        if (seleccion_grup.jornadas.activosDisponibles.operarios[pos].trabajador.apellido1 && seleccion_grup.jornadas.activosDisponibles.operarios[pos].trabajador.apellido1 != null && seleccion_grup.jornadas.activosDisponibles.operarios[pos].trabajador.apellido1 != '') {
            nombre += ' ' + seleccion_grup.jornadas.activosDisponibles.operarios[pos].trabajador.apellido1;
        }
        nombre = '<td class="nombre">' + nombre + '<span class="pos">' + pos + '</span></td>';
        tbody.append('<tr class="integrante">' + icono + nombre + '</tr>');
        tbody.children('tr.integrante:last-child').children('td.icono').css('color', colorJornada).children('i').click(icono_conductor_click);
        tbody.children('tr.integrante:last-child').children('td.nombre').children('span.pos').hide();
        grupoOperario.children('option[value="' + pos + '"]').remove();
        if (grupoOperario.children('option').length == 1) {
            grupoOperario.children('option').remove();
            grupoOperario.append('<option value=-1>Sin operarios disponibles...</option>');
        }
        grupoOperario.val(-1).change();
    }
    
    function grupo_cita_click() {
        if (!edicion) {
            componentes.jornada.agenda.tbody.children('tr.cita').css('background-color', sinColor).removeClass('seleccionada');
            if ($(this).index() != seleccion_grup.agenda.posicionSeleccionada) {
                seleccion_grup.agenda.posicionSeleccionada = $(this).index();
                seleccion_grup.agenda.citaSeleccionada = seleccion_grup.agenda.listaCitas[seleccion_grup.agenda.posicionSeleccionada];
                $(this).css('background-color', colorFondo).addClass('seleccionada');
                alert('grupo_cita_click()\n\nFalta mostcitarar detalles de la cita');
                componentes.jornada.agenda.detalles.div.show();
                componentes.jornada.agenda.detalles.cita.show();
                componentes.jornada.agenda.detalles.evento.hide();
                componentes.jornada.agenda.detalles.tareas.hide();
            } else {
                seleccion_grup.agenda.posicionSeleccionada = -1;
                seleccion_grup.agenda.citaSeleccionada = null;
                componentes.jornada.agenda.detalles.div.hide();
            }
        }
    }
    
    function grupo_cita_nueva_click() {
        alert('grupo_cita_nueva_click()');
    }
    
    function jornada_volver_click() {
        if (seleccion_grup.grupos.posicionSeleccionada != componentes.jornada.select.val()) {
            componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-footer').children('div.container-fluid').children('div.tabla').children('div.col-12').children('div.table-responsive-md').children('table.table').children('tbody').children('tr.grupo').eq(componentes.jornada.select.val()).click();
        }
        componentes.jornadas.div.show();
        componentes.jornada.div.hide();
    }
    
    function fecha_change() {
        var fecha = $(this).val(),
            a = fecha.slice(0, fecha.indexOf('-')),
            m = fecha.slice(fecha.indexOf('-') + 1, fecha.lastIndexOf('-'));
        fecha = a + '-' + m + '-01';
        $(this).val(fecha);
        actualizar_calendario(a, m, null);
    }
    
    function grupo_operario_change() {
        $(this).siblings('div.input-group-append').children('button.btn-aceptar-sm').prop('disabled', $(this).val() < 0);
    }
    
    function grupo_vehiculo_change() {
        var activos = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-footer').children('div.container-fluid').children('div.grupo').children('div.col-12').children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.activos'),
            aceptar = activos.siblings('div.botones').children('button.btn-aceptar'),
            testConductor = activos.children('div.integrantes').children('table').children('tbody').children('tr.integrante').children('td.seleccionado').length > 0;
        aceptar.prop('disabled', !(testConductor && $(this).val() != -1));
    }
    
    function jornada_grupo_change() {
        componentes.jornada.grupo.load('Html/grupo.html', cargar_grupo_resumen);
    }
    
    // Funciones para cargar paginas y definir su comportamiento
    // ====================================================================== //
    function cargar_grupo(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var card = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-footer').children('div.container-fluid').children('div.grupo').children('div.col-12').children('div.contenedor').children('div.card'),
                nuevo = card.children('div.card-body').children('div.container-fluid').children('div.activos').children('div.integrantes').children('div.nuevo').children('div.input-group').children('div.input-group-append').children('button.btn-aceptar-sm');
            card.children('div.card-header').children('div.container-fluid').children('div.row').children('div.col-12').children('h4').html(seleccion_grup.grupos.infoGrupos[seleccion_grup.grupos.posicionSeleccionada].nombre);
            if (seleccion_grup.grupos.grupoSeleccionado.observaciones && seleccion_grup.grupos.grupoSeleccionado.observaciones != null && seleccion_grup.grupos.grupoSeleccionado.observaciones != '') {
                card.children('div.card-body').children('div.container-fluid').children('div.observaciones').children('div.col-12').children('textarea').val(seleccion_grup.grupos.grupoSeleccionado.observaciones);
            }
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-editar').css({'border-color':colorBorde, 'background-color':colorFondo}).click(grupo_editar_click);
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-aceptar').hide().click(grupo_aceptar_click);
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-cancelar').hide().click(grupo_cancelar_click);
            nuevo.prop('disabled', true).click(grupo_operario_aceptar_click);
            card.css('border-color', colorBorde);
            card.children('div.card-header').css('background-color', colorBorde);
            card.children('div.card-body').css('background-color', colorFondo);
            $.get('http://localhost:8080/ReForms_Provider/wr/integrante/obtenerIntegrantePorGrupo/' + seleccion_grup.grupos.grupoSeleccionado.id, respuesta_obtenerIntegrantePorGrupo, 'json');
        } else {
            alerta('Error 404', 'no se pudo cargar grupo.html');
        }
    }
    
    function cargar_grupo_nuevo(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var card = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-footer').children('div.container-fluid').children('div.grupo').children('div.col-12').children('div.contenedor').children('div.card'),
                select = card.children('div.card-body').children('div.container-fluid').children('div.activos').children('div.vehiculo').children('select[name="grupo_vehiculo"]'),
                nuevo = card.children('div.card-body').children('div.container-fluid').children('div.activos').children('div.integrantes').children('div.nuevo').children('div.input-group'),
                i, opcion;
            card.children('div.card-header').children('div.container-fluid').children('div.row').children('div.col-12').children('h4').html('Nuevo grupo');
            select.prop('disabled', false);
            card.children('div.card-body').children('div.container-fluid').children('div.observaciones').children('div.col-12').children('textarea').prop('readonly', false).focus();
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-editar').remove();
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-aceptar').prop('disabled', true).click(grupo_nuevo_aceptar_click);
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-cancelar').click(grupo_nuevo_cancelar_click);
            card.css('border-color', colorBorde);
            card.children('div.card-header').css('background-color', colorBorde);
            card.children('div.card-body').css('background-color', colorFondo);
            select.children('option').remove();
            if (seleccion_grup.jornadas.activosDisponibles.operarios.length > 0) {
                nuevo.children('select[name="grupo_operario"]').append('<option value=-1>Seleccione operario...</option>');
                for (i = 0; i < seleccion_grup.jornadas.activosDisponibles.operarios.length; i++) {
                    opcion = seleccion_grup.jornadas.activosDisponibles.operarios[i].trabajador.nombre;
                    if (seleccion_grup.jornadas.activosDisponibles.operarios[i].trabajador.apellido1 && seleccion_grup.jornadas.activosDisponibles.operarios[i].trabajador.apellido1 != null && seleccion_grup.jornadas.activosDisponibles.operarios[i].trabajador.apellido1 != '') {
                        opcion += ' ' + seleccion_grup.jornadas.activosDisponibles.operarios[i].trabajador.apellido1;
                    }
                    nuevo.children('select[name="grupo_operario"]').append('<option value=' + i + '>' + opcion + '</option>');
                }
            } else {
                nuevo.children('select[name="grupo_operario"]').append('<option value=-1>Sin operarios disponibles...</option>');
            }
            nuevo.children('select[name="grupo_operario"]').change(grupo_operario_change);
            nuevo.children('div.input-group-append').children('button.btn-aceptar-sm').click(grupo_nuevo_operario_aceptar_click);
            if (seleccion_grup.jornadas.activosDisponibles.vehiculos.length > 0) {
                select.append('<option value=-1>Seleccione vehiculo...</option>');
                for (i = 0; i < seleccion_grup.jornadas.activosDisponibles.vehiculos.length; i++) {
                    opcion = '[' + seleccion_grup.jornadas.activosDisponibles.vehiculos[i].matricula + ']';
                    if (seleccion_grup.jornadas.activosDisponibles.vehiculos[i].marca && seleccion_grup.jornadas.activosDisponibles.vehiculos[i].marca != null && seleccion_grup.jornadas.activosDisponibles.vehiculos[i].marca != '') {
                        opcion += ' ' + seleccion_grup.jornadas.activosDisponibles.vehiculos[i].marca;
                    }
                    if (seleccion_grup.jornadas.activosDisponibles.vehiculos[i].modelo && seleccion_grup.jornadas.activosDisponibles.vehiculos[i].modelo != null && seleccion_grup.jornadas.activosDisponibles.vehiculos[i].modelo != '') {
                        opcion += ' ' + seleccion_grup.jornadas.activosDisponibles.vehiculos[i].modelo;
                    }
                    select.append('<option value=' + i + '>' + opcion + '</option>');
                }
            } else {
                select.append('<option value=-1>Sin vehiculos disponibles...</option>');
            }
            select.change(grupo_vehiculo_change);
        } else {
            alerta('Error 404', 'no se pudo cargar grupo.html');
        }
    }
    
    function cargar_grupo_resumen(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var card = componentes.jornada.grupo.children('div.contenedor').children('div.card');
            card.children('div.card-body').children('div.container-fluid').children('div.activos').children('div.integrantes').children('div.nuevo').remove();
            card.children('div.card-body').children('div.container-fluid').children('div.botones').remove();
            card.children('div.card-header').children('div.container-fluid').children('div.row').children('div.col-12').children('h4').html(seleccion_grup.grupos.infoGrupos[componentes.jornada.select.val()].nombre);
            if (seleccion_grup.grupos.listaGrupos[componentes.jornada.select.val()].observaciones && seleccion_grup.grupos.listaGrupos[componentes.jornada.select.val()].observaciones != null && seleccion_grup.grupos.listaGrupos[componentes.jornada.select.val()].observaciones != '') {
                card.children('div.card-body').children('div.container-fluid').children('div.observaciones').children('div.col-12').children('textarea').val(seleccion_grup.grupos.listaGrupos[componentes.jornada.select.val()].observaciones);
            }
            $.get('http://localhost:8080/ReForms_Provider/wr/integrante/obtenerIntegrantePorGrupo/' + seleccion_grup.grupos.listaGrupos[componentes.jornada.select.val()].id, respuesta_obtenerIntegrantePorGrupo_resumen, 'json');
            $.get('http://localhost:8080/ReForms_Provider/wr/cita/obtenerCitaPorGrupo/' + seleccion_grup.grupos.listaGrupos[componentes.jornada.select.val()].id, respuesta_obtenerCitaPorGrupo_resumen, 'json');
            componentes.jornada.agenda.detalles.div.hide();
            card.css('border-color', colorBorde);
            card.children('div.card-header').css('background-color', colorBorde);
            card.children('div.card-body').css('background-color', colorFondo);
        } else {
            alerta('Error 404', 'no se pudo cargar grupo.html');
        }
    }
        
    function cargar_jornada(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var card = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card'),
                table = card.children('div.card-footer').children('div.container-fluid').children('div.tabla').children('div.col-12').children('div.table-responsive-md').children('table.table'),
                msgGerente = 'Generada por: ';
            card.children('div.card-header').children('div.container-fluid').children('div.row').children('div.col-12').children('h4.fecha').text(generar_msgFecha(seleccion_grup.jornadas.jornadaSeleccionada.fecha));
            msgGerente += seleccion_grup.jornadas.jornadaSeleccionada.gerente.trabajador.nombre + ' ' + seleccion_grup.jornadas.jornadaSeleccionada.gerente.trabajador.apellido1;
            if (seleccion_grup.jornadas.jornadaSeleccionada.gerente.trabajador.apellido2) {
                msgGerente += ' ' + seleccion_grup.jornadas.jornadaSeleccionada.gerente.trabajador.apellido2;
            }
            card.children('div.card-header').children('div.container-fluid').children('div.row').children('div.col-12').children('h5.gerente').text(msgGerente);
            if (seleccion_grup.jornadas.jornadaSeleccionada.observaciones && seleccion_grup.jornadas.jornadaSeleccionada.observaciones != null && seleccion_grup.jornadas.jornadaSeleccionada.observaciones != '') {
                card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('textarea.observaciones').val(seleccion_grup.jornadas.jornadaSeleccionada.observaciones);
            }
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-editar').css({'border-color':colorBorde, 'background-color':colorFondo}).click(jornada_editar_click);
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-aceptar').hide().click(jornada_aceptar_click);
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-cancelar').hide().click(jornada_cancelar_click);
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-citas').css({'border-color':colorBorde, 'background-color':colorFondo}).click(grupo_citas_click);
            table.siblings('button.btn-nuevo').css({'border-color':colorBorde, 'background-color':colorFondo}).click(grupo_nuevo_click);
            card.css('border-color', colorBorde);
            card.children('div').css('border-color', colorBorde);
            card.children('div.card-header').css('background-color', colorBorde);
            card.children('div').not('div.card-header').css('background-color', colorFondo);
            table.children('thead').css('background-color', colorBorde);
            $.get('http://localhost:8080/ReForms_Provider/wr/grupo/buscarGrupoPorJornada/' + seleccion_grup.jornadas.jornadaSeleccionada.id, respuesta_buscarGrupoPorJornada, 'json');
            $.get('http://localhost:8080/ReForms_Provider/wr/operario/obtenerOperarioDisponiblePorJornada/' + seleccion_grup.jornadas.jornadaSeleccionada.id, respuesta_obtenerOperarioDisponiblePorJornada, 'json');
            $.get('http://localhost:8080/ReForms_Provider/wr/vehiculo/obtenerVehiculoDisponiblePorJornada/' + seleccion_grup.jornadas.jornadaSeleccionada.id, respuesta_obtenerVehiculoDisponiblePorJornada, 'json');
            card.children('div.card-footer').children('div.container-fluid').children('div.grupo').hide();
        } else {
            alerta('Error 404', 'no se pudo cargar jornada.html');
            edicion = false;
            componentes.jornadas.calendario.fecha.prop('disabled', false);
            componentes.jornadas.calendario.nueva.prop('disabled', false);
            componentes.jornadas.detalles.hide();
        }
    }
    
    function cargar_jornada_nueva(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var card = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card'),
                fecha = componentes.jornadas.calendario.fecha.val().slice(0, componentes.jornadas.calendario.fecha.val().lastIndexOf('-') + 1),
                dia = Number(componentes.jornadas.calendario.tbody.children('tr.semana').children('td').children('div.seleccionado').attr('name')),
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
            card.children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-citas').remove();
            card.children('div.card-footer').remove();
            card.css('border-color', colorBorde);
            card.children('div').css('border-color', colorBorde);
            card.children('div.card-header').css('background-color', colorBorde);
            card.children('div').not('div.card-header').css('background-color', colorFondo);
            $.get('http://localhost:8080/ReForms_Provider/wr/operario/obtenerOperarioDisponiblePorJornada/' + -1, respuesta_obtenerOperarioDisponiblePorJornada, 'json');
            $.get('http://localhost:8080/ReForms_Provider/wr/vehiculo/obtenerVehiculoDisponiblePorJornada/' + -1, respuesta_obtenerVehiculoDisponiblePorJornada, 'json');
        } else {
            alerta('Error 404', 'no se pudo cargar jornada.html');
            edicion = false;
            componentes.jornadas.calendario.fecha.prop('disabled', false);
            componentes.jornadas.calendario.nueva.prop('disabled', false);
            componentes.jornadas.detalles.hide();
        }
    }
    
    function respuesta_buscarGrupoPorJornada(data, status) {
        if (status == 'success') {
            seleccion_grup.grupos.listaGrupos = data;
            seleccion_grup.grupos.grupoSeleccionado = null;
            seleccion_grup.grupos.posicionSeleccionada = -1;
            seleccion_grup.grupos.integrantes.listaIntegrantes = [];
            seleccion_grup.grupos.integrantes.conductor = null;
            if (seleccion_grup.grupos.listaGrupos.length > 0) {
                componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-citas').show();
            } else {
                componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.botones').children('button.btn-citas').hide();
            }
            $.get('http://localhost:8080/ReForms_Provider/wr/grupo/obtenerInfoGrupoPorJornada/' + seleccion_grup.jornadas.jornadaSeleccionada.id, respuesta_obtenerInfoGrupoPorJornada, 'text');
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerInfoGrupoPorJornada(data, status) {
        var tbody = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-footer').children('div.container-fluid').children('div.tabla').children('div.col-12').children('div.table-responsive-md').children('table.table').children('tbody');
        if (status == 'success') {
            seleccion_grup.grupos.infoGrupos = JSON.parse(data);
            actualizar_tabla_grupos(seleccion_grup.grupos.infoGrupos, tbody);
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerOperarioDisponiblePorJornada(data, status) {
        if (status == 'success') {
            seleccion_grup.jornadas.activosDisponibles.operarios = data;
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerVehiculoDisponiblePorJornada(data, status) {
        if (status == 'success') {
            seleccion_grup.jornadas.activosDisponibles.vehiculos = data;
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerIntegrantePorGrupo(data, status) {
        if (status == 'success') {
            seleccion_grup.grupos.integrantes.listaIntegrantes = data;
            $.get('http://localhost:8080/ReForms_Provider/wr/conductor/obtenerConductorPorGrupo/' + seleccion_grup.grupos.grupoSeleccionado.id, function(data2, status) {
                if (status == 'success') {
                    var card = componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-footer').children('div.container-fluid').children('div.grupo').children('div.col-12').children('div.contenedor').children('div.card'),
                        table = card.children('div.card-body').children('div.container-fluid').children('div.activos').children('div.integrantes').children('table'),
                        nuevo = card.children('div.card-body').children('div.container-fluid').children('div.activos').children('div.integrantes').children('div.nuevo'),
                        select_operario = nuevo.children('div.input-group').children('select[name="grupo_operario"]'),
                        select_vehiculo = card.children('div.card-body').children('div.container-fluid').children('div.activos').children('div.vehiculo').children('select[name="grupo_vehiculo"]'),
                        i, opcion;
                    seleccion_grup.grupos.integrantes.conductor = data2[0];
                    actualizar_tabla_integrantes(seleccion_grup.grupos.integrantes.listaIntegrantes, seleccion_grup.grupos.integrantes.conductor , table.children('tbody'));
                    select_operario.children('option').remove();
                    if (seleccion_grup.jornadas.activosDisponibles.operarios.length > 0) {
                        select_operario.append('<option value=-1>Seleccione operario...</option>');
                        for (i = 0; i < seleccion_grup.jornadas.activosDisponibles.operarios.length; i++) {
                            opcion = seleccion_grup.jornadas.activosDisponibles.operarios[i].trabajador.nombre;
                            if (seleccion_grup.jornadas.activosDisponibles.operarios[i].trabajador.apellido1 && seleccion_grup.jornadas.activosDisponibles.operarios[i].trabajador.apellido1 != null && seleccion_grup.jornadas.activosDisponibles.operarios[i].trabajador.apellido1 != '') {
                                opcion += ' ' + seleccion_grup.jornadas.activosDisponibles.operarios[i].trabajador.apellido1;
                            }
                            select_operario.append('<option value=' + i + '>' + opcion + '</option>');
                        }
                    } else {
                        select_operario.append('<option value=-1>Sin operarios disponibles...</option>');
                    }
                    nuevo.children('div.input-group').children('div.input-group-append').children('button.btn-aceptar-sm').prop('disabled', true);
                    select_operario.change(grupo_operario_change);
                    select_vehiculo.children('option').remove();
                    opcion = '[' + seleccion_grup.grupos.integrantes.conductor.vehiculo.matricula + ']';
                    if (seleccion_grup.grupos.integrantes.conductor.vehiculo.marca && seleccion_grup.grupos.integrantes.conductor.vehiculo.marca != null && seleccion_grup.grupos.integrantes.conductor.vehiculo.marca != '') {
                        opcion += ' ' + seleccion_grup.grupos.integrantes.conductor.vehiculo.marca;
                    }
                    if (seleccion_grup.grupos.integrantes.conductor.vehiculo.modelo && seleccion_grup.grupos.integrantes.conductor.vehiculo.modelo != null && seleccion_grup.grupos.integrantes.conductor.vehiculo.modelo != '') {
                        opcion += ' ' + seleccion_grup.grupos.integrantes.conductor.vehiculo.modelo;
                    }
                    select_vehiculo.append('<option value=-1>' + opcion + '</option>');
                    if (seleccion_grup.jornadas.activosDisponibles.vehiculos.length > 0) {
                        for (i = 0; i < seleccion_grup.jornadas.activosDisponibles.vehiculos.length; i++) {
                            opcion = '[' + seleccion_grup.jornadas.activosDisponibles.vehiculos[i].matricula + ']';
                            if (seleccion_grup.jornadas.activosDisponibles.vehiculos[i].marca && seleccion_grup.jornadas.activosDisponibles.vehiculos[i].marca != null && seleccion_grup.jornadas.activosDisponibles.vehiculos[i].marca != '') {
                                opcion += ' ' + seleccion_grup.jornadas.activosDisponibles.vehiculos[i].marca;
                            }
                            if (seleccion_grup.jornadas.activosDisponibles.vehiculos[i].modelo && seleccion_grup.jornadas.activosDisponibles.vehiculos[i].modelo != null && seleccion_grup.jornadas.activosDisponibles.vehiculos[i].modelo != '') {
                                opcion += ' ' + seleccion_grup.jornadas.activosDisponibles.vehiculos[i].modelo;
                            }
                            select_vehiculo.append('<option value=' + i + '>' + opcion + '</option>');
                        }
                    } else {
                        select_vehiculo.append('<option value=-2>Sin vehiculos disponibles...</option>');
                    }
                    nuevo.hide();
                } else {
                    alert('fallo en el proveedor');
                }
            }, 'json');
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerIntegrantePorGrupo_resumen(data, status) {
        if (status == 'success') {
            seleccion_grup.grupo.listaIntegrantes = data;
            $.get('http://localhost:8080/ReForms_Provider/wr/conductor/obtenerConductorPorGrupo/' + seleccion_grup.grupos.listaGrupos[componentes.jornada.select.val()].id, function(data2, status) {
                if (status == 'success') {
                    var activos = componentes.jornada.grupo.children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.activos'),
                        tbody = activos.children('div.integrantes').children('table').children('tbody'),
                        select_vehiculo = activos.children('div.vehiculo').children('select[name="grupo_vehiculo"]'),
                        opcion;
                    seleccion_grup.grupo.conductor = data2[0];
                    actualizar_tabla_integrantes(seleccion_grup.grupo.listaIntegrantes, seleccion_grup.grupo.conductor , tbody);
                    opcion = '[' + seleccion_grup.grupo.conductor.vehiculo.matricula + ']';
                    if (seleccion_grup.grupo.conductor.vehiculo.marca && seleccion_grup.grupo.conductor.vehiculo.marca != null && seleccion_grup.grupo.conductor.vehiculo.marca != '') {
                        opcion += ' ' + seleccion_grup.grupo.conductor.vehiculo.marca;
                    }
                    if (seleccion_grup.grupo.conductor.vehiculo.modelo && seleccion_grup.grupo.conductor.vehiculo.modelo != null && seleccion_grup.grupo.conductor.vehiculo.modelo != '') {
                        opcion += ' ' + seleccion_grup.grupo.conductor.vehiculo.modelo;
                    }
                    select_vehiculo.append('<option value=-1>' + opcion + '</option>');
                } else {
                    alert('fallo en el proveedor');
                }
            }, 'json');
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerCitaPorGrupo_resumen(data, status) {
        if (status == 'success') {
            seleccion_grup.agenda.listaCitas = data;
            seleccion_grup.agenda.posicionSeleccionada = -1;
            seleccion_grup.agenda.citaSeleccionada = null;
            actualizar_tabla_citas(seleccion_grup.agenda.listaCitas, componentes.jornada.agenda.tbody);
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    // Cargar paginas y aplicar controles
    // ====================================================================== //
    componentes.jornadas.calendario.fecha = componentes.jornadas.div.children('div.calendario').children('div.col-12').children('input.fecha');
    componentes.jornadas.calendario.tbody = componentes.jornadas.div.children('div.calendario').children('div.col-12').children('table').children('tbody');
    componentes.jornadas.calendario.nueva = componentes.jornadas.div.children('div.calendario').children('div.col-12').children('button.btn-nuevo');
    componentes.jornadas.detalles = componentes.jornadas.div.children('div.detalles');
    componentes.jornada.select = componentes.jornada.div.children('div.seleccion').children('select[name="grupo_actual"]');
    componentes.jornada.grupo = componentes.jornada.div.children('div.grupo');
    componentes.jornada.agenda.tbody = componentes.jornada.div.children('div.agenda').children('div.col-12').children('div.tabla').children('div.col-12').children('div.table-responsive-md').children('table.table').children('tbody');
    componentes.jornada.agenda.nueva = componentes.jornada.div.children('div.agenda').children('div.col-12').children('div.tabla').children('div.col-12').children('div.table-responsive-md').children('button.btn-nuevo');
    componentes.jornada.agenda.detalles.div = componentes.jornada.div.children('div.agenda').children('div.col-12').children('div.detalles');
    componentes.jornada.agenda.detalles.cita = componentes.jornada.agenda.detalles.div.children('div.cita');
    componentes.jornada.agenda.detalles.evento = componentes.jornada.agenda.detalles.div.children('div.extra').children('div.evento');
    componentes.jornada.agenda.detalles.tareas = componentes.jornada.agenda.detalles.div.children('div.extra').children('div.tareas');
    componentes.siniestros.mapa = componentes.siniestros.div.children('div.mapa');
    componentes.siniestros.tabla.tbody = componentes.siniestros.div.children('div.tabla');
    componentes.siniestros.tabla.detalles = componentes.siniestros.div.children('div.tabla');
    componentes.siniestro.resumen.contactos = componentes.siniestro.div.children('div.resumen').children('div.contactos');
    componentes.siniestro.resumen.direccion = componentes.siniestro.div.children('div.resumen').children('div.direccion');
    componentes.siniestro.tareas.tbody = componentes.siniestro.div.children('div.tareas').children('div.tabla');
    componentes.siniestro.tareas.detalles = componentes.siniestro.div.children('div.tareas').children('div.detalles');
    componentes.siniestro.citas.tbody = componentes.siniestro.div.children('div.citas').children('div.tabla');
    componentes.siniestro.citas.detalles = componentes.siniestro.div.children('div.citas').children('div.detalles');
    if (sessionStorage.evento && sessionStorage.evento != null && sessionStorage.evento != '') {
        // parte en la que entramos desde el siniestro
        seleccion_even.evento = JSON.parse(sessionStorage.evento);
        sessionStorage.removeItem('evento');
    } else {
        // parte en la que entramos desde la pestaña jornadas
    }
    var f = new Date(), y = f.getFullYear(), m = f.getMonth() + 1;
    componentes.jornadas.calendario.fecha.val(y + (m < 10 ? '-0' + m : '-' + m) + '-01');
    componentes.jornadas.calendario.fecha.change(fecha_change);
    componentes.jornadas.calendario.nueva.click(jornada_nueva_click);
    componentes.jornada.agenda.nueva.click(grupo_cita_nueva_click);
    componentes.jornada.div.children('div.botones').children('button.btn-volver').click(jornada_volver_click);
    actualizar_calendario(y, m, null);
    
    // Inicializacion de aspecto y colores
    // ====================================================================== //
    $("#ventana").css({'border-color':colorBorde, 'background-color':colorFondo});
    componentes.jornadas.calendario.tbody.siblings('thead').children('tr').css("background-color", colorBorde);
    componentes.jornadas.calendario.nueva.css({'border-color':colorBorde, 'background-color':colorFondo});
    componentes.jornada.agenda.tbody.siblings('thead').children('tr').css("background-color", colorBorde);
    componentes.jornada.agenda.nueva.css({'border-color':colorBorde, 'background-color':colorFondo});
    componentes.jornada.div.children('div.cabecera').css('background-color', colorBorde);
    componentes.jornada.div.children('div.botones').children('button.btn-volver').css({'border-color':colorBorde, 'background-color':colorFondo});
    componentes.jornada.select.change(jornada_grupo_change);
    componentes.jornadas.detalles.hide();
    componentes.jornada.div.hide();
    if (seleccion_even.evento == null) {
        componentes.siniestro.div.hide();
    } else {
        componentes.siniestros.div.hide();
    }
});
