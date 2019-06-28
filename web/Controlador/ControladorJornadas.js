$(document).ready(function() {

    // Variables
    // ====================================================================== //
    var googleKey = sessionStorage.googleKey,
        colorBorde = $('#btn-jornadas').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.2)',
        colorJornada = colorBorde.substring(0, colorBorde.length - 1) + ', 0.5)',
        colorBordeSiniestro = $('#btn-siniestros').css('background-color'),
        colorFondoSiniestro = colorBordeSiniestro.substring(0, colorBordeSiniestro.length - 1) + ', 0.2)',
        colorTextoNeutro = 'rgb(33, 37, 41)',
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
            'siniestros': {
                'listaSiniestros': [],
                'siniestroSeleccionado': null,
                'posicionSeleccionada': -1,
                'agenda': {
                    'cliente': null,
                    'contactos': [],
                    'peritos': [],
                    'grupos': []
                }
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
        relacionar = {
            'llamada': null,
            'agenda': {
                'cliente': null,
                'contactos': [],
                'peritos': [],
                'grupos': []
            }
        },
        componentes = {
            'jornadas': {
                'div': $('#ventana').children('div.container-fluid').children('div.seleccion').children('div.seleccion-grupo').children('div.jornadas'),
                'calendario': {
                    'fecha': null,
                    'tbody': null,
                    'nueva': null
                },
                'detalles': null
            },
            'jornada': {
                'div': $('#ventana').children('div.container-fluid').children('div.seleccion').children('div.seleccion-grupo').children('div.jornada'),
                'select': null,
                'grupo': null,
                'agenda': {
                    'tbody': null,
                    'detalles': null
                }
            },
            'siniestros': {
                'div': $('#ventana').children('div.container-fluid').children('div.seleccion').children('div.seleccion-evento').children('div.siniestros'),
                'mapa': null,
                'tabla': {
                    'tbody': null,
                    'detalles': null
                }
            },
            'siniestro': {
                'div': $('#ventana').children('div.container-fluid').children('div.seleccion').children('div.seleccion-evento').children('div.siniestro'),
                'resumen': {
                    'cabecera': {
                        'siniestro': null,
                        'poliza': null,
                        'fecha': null,
                        'estado': null,
                        'consultar': null
                    },
                    'contactos': null,
                    'direccion': null
                },
                'tareas': {
                    'tbody': null,
                    'tarea': null
                },
                'citas': {
                    'tbody': null,
                    'cita': null
                },
                'botones': null
            },
            'relacionar': {
                'div': $('#ventana').children('div.container-fluid').children('div.relacionar'),
                'iconoGrupo': null,
                'iconoEvento': null,
                'cita': null
            },
            'cardActual': null
        },
        espera_grupo = {
            'contador': 0,
            'conductor': false
        },
        edicion = false,
        edicion_grupo = false,
        edicion_llamada = false;
        
    // Funciones auxiliares
    // ====================================================================== //
    function alerta(titulo, mensaje) {
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-header').children('.modal-title').html(titulo);
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-body').html(mensaje);
        $('#activador-alerta').click();
    }
    
    function telefono_valido(telefonoStr) {
        return /^[69]\d{8}$/.test(telefonoStr);
    }
    
    function generarMapaSiniestro(lat, long) {
        var funcion = '<script>function cargarMapaSiniestro() { var propiedades = { center: new google.maps.LatLng(' + lat + ', ' + long + '), zoom: 18 }, mapa = new google.maps.Map(document.getElementById("googleMapSiniestro"), propiedades), marcador = new google.maps.Marker({position: propiedades.center}); marcador.setMap(mapa); }</script>',
            script = '<script src="https://maps.googleapis.com/maps/api/js?key=' + googleKey + '&callback=cargarMapaSiniestro"></script>',
            mapa  = '<div id="googleMapSiniestro" style="width:100%;height:400px;"></div>';
        return '<div class="mapaGoogle">' + funcion + script + mapa + '</div>';
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
    
    function generar_icono_llamada(tipo) {
        var salida;
        switch (tipo) {
            case 0: salida = '<i class="material-icons llamada-saliente">call_made</i>'; break;
            case 1: salida = '<i class="material-icons llamada-entrante">call_received</i>'; break;
            case 2: salida = '<i class="material-icons llamada-saliente-perdida">call_missed_outgoing</i>'; break;
            case 3: salida = '<i class="material-icons llamada-entrante-perdida">call_missed</i>'; break;
        }
        return salida;
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
    
    function mostrar_siniestro(siniestro) {
        var aux = new Date (siniestro.fechaRegistro.slice(0, siniestro.fechaRegistro.indexOf('T')));
        componentes.siniestro.resumen.cabecera.siniestro.html(siniestro.numero);
        componentes.siniestro.resumen.cabecera.poliza.html(siniestro.poliza.numero);
        aux = (aux.getDate() > 9 ? aux.getDate() : '0' + aux.getDate()) + '/' + (aux.getMonth() > 8 ? (aux.getMonth() + 1) : '0' + (aux.getMonth() + 1)) + '/' + aux.getFullYear();
        componentes.siniestro.resumen.cabecera.fecha.html(aux);
        switch (siniestro.estado) {
            case 0: componentes.siniestro.resumen.cabecera.estado.html('pendiente'); break;
            case 1: componentes.siniestro.resumen.cabecera.estado.html('en proceso'); break;
            case 2: componentes.siniestro.resumen.cabecera.estado.html('finalizado'); break;
            case 3: componentes.siniestro.resumen.cabecera.estado.html('parcialmente finalizado'); break;
            case 4: componentes.siniestro.resumen.cabecera.estado.html('cerrado'); break;
            case 5: componentes.siniestro.resumen.cabecera.estado.html('devuleto'); break;
            case 6: componentes.siniestro.resumen.cabecera.estado.html('facturado'); break;
            case 7: componentes.siniestro.resumen.cabecera.estado.html('cobrado'); break;
        }
        aux = siniestro.poliza.cliente.nombre + ' ' + siniestro.poliza.cliente.apellido1;
        if (siniestro.poliza.cliente.apellido2 && siniestro.poliza.cliente.apellido2 != null && siniestro.poliza.cliente.apellido2 != '') {
            aux += ' ' + siniestro.poliza.cliente.apellido2;
        }
        aux += ' (' + siniestro.poliza.cliente.telefono1;
        if (siniestro.poliza.cliente.telefono2 && siniestro.poliza.cliente.telefono2 != null && siniestro.poliza.cliente.telefono2 != '') {
            aux += '/' + siniestro.poliza.cliente.telefono2;
        }
        aux += ')';
        componentes.siniestro.resumen.contactos.children('div.cliente').children('ul').children('li').remove();
        componentes.siniestro.resumen.contactos.children('div.cliente').children('ul').append('<li>' + aux + '</li>');
        $.get('http://localhost:8080/ReForms_Provider/wr/contacto/obtenerContactos/' + siniestro.id, respuesta_obtenerContactos, 'json');
        $.get('http://localhost:8080/ReForms_Provider/wr/cita/obtenerCitas/' + siniestro.id, respuesta_obtenerCitas, 'json');
        $.get('http://localhost:8080/ReForms_Provider/wr/tarea/obtenerTareas/' + siniestro.id, respuesta_obtenerTareas, 'json');
        aux = siniestro.poliza.propiedad.direccion + ' ' + siniestro.poliza.propiedad.numero + ', ';
        if (siniestro.poliza.propiedad.piso && siniestro.poliza.propiedad.piso != null && siniestro.poliza.propiedad.piso != '') {
            aux += siniestro.poliza.propiedad.piso + ', ';
        }
        aux += siniestro.poliza.propiedad.localidad.nombre + ' [' + siniestro.poliza.propiedad.localidad.cp + ']';
        componentes.siniestro.resumen.direccion.children('p').html(aux);
        componentes.siniestro.resumen.direccion.children('div.mapa').children('div.mapaGoogle').remove();
        componentes.siniestro.resumen.direccion.children('div.mapa').append(generarMapaSiniestro(siniestro.poliza.propiedad.geolat, siniestro.poliza.propiedad.geolong));
        componentes.siniestro.tareas.tarea.hide();
        componentes.siniestro.citas.cita.hide();
    }
    
    function mostrar_agenda(agenda, select) {
        var i, texto;
        select.children('option').remove();
        if (agenda != null) {
            select.append('<option value="-2">Cliente:</option>');
            texto = '[' + agenda.cliente.telefono1;
            if (agenda.cliente.telefono2 && agenda.cliente.telefono2 != null && agenda.cliente.telefono2 != '') {
                texto += '/' + agenda.cliente.telefono2;
            }
            texto += '] ' + agenda.cliente.nombre + agenda.cliente.apellido1;
            select.append('<option value="cliente" selected>' + texto + '</option>');
            select.append('<option value="-2"></option>');
            if (agenda.contactos.length > 0) {
                select.append('<option value="-2">Contactos:</option>');
                for (i = 0; i < agenda.contactos.length; i++) {
                    texto = '[' + agenda.contactos[i].telefono1;
                    if (agenda.contactos[i].telefono2 && agenda.contactos[i].telefono2 != null && agenda.contactos[i].telefono2 != '') {
                        texto += '/' + agenda.contactos[i].telefono2;
                    }
                    texto += ']';
                    if (agenda.contactos[i].nombre && agenda.contactos[i].nombre != null && agenda.contactos[i].nombre != '') {
                        texto += ' ' + agenda.contactos[i].nombre;
                    }
                    if (agenda.contactos[i].apellido1 && agenda.contactos[i].apellido1 != null && agenda.contactos[i].apellido1 != '') {
                        texto += ' ' + agenda.contactos[i].apellido1;
                    }
                    select.append('<option value="contacto[' + i + ']">' + texto + '</option>');
                }
                select.append('<option value="-2"></option>');
            }
            select.append('<option value="-2">Peritos:</option>');
            for (i = 0; i < agenda.peritos.length; i++) {
                texto = '[' + agenda.peritos[i].telefono1;
                if (agenda.peritos[i].telefono2 && agenda.peritos[i].telefono2 != null && agenda.peritos[i].telefono2 != '') {
                    texto += '/' + agenda.peritos[i].telefono2;
                }
                texto += '] ' + agenda.peritos[i].nombre + ' ' + agenda.peritos[i].apellido1;
                select.append('<option value="perito[' + i + ']">' + texto + '</option>');
            }
            select.append('<option value="-2"></option>');
            if (agenda.grupos.length > 0) {
                select.append('<option value="-2">Grupos:</option>');
                var fecha, nombre;
                for (i = 0; i < agenda.grupos.length; i++) {
                    fecha = agenda.grupos[i].observaciones.slice(1, agenda.grupos[i].observaciones.indexOf(']'));
                    fecha = new Date (new Number(fecha));
                    nombre = agenda.grupos[i].observaciones.slice(agenda.grupos[i].observaciones.indexOf(']') + 2, agenda.grupos[i].observaciones.length);
                    texto = '[Jor. ' + (fecha.getDate() > 9 ? fecha.getDate() : '0' + fecha.getDate()) + '/' + (fecha.getMonth() > 8 ? fecha.getMonth() + 1 : '0' + (fecha.getMonth() + 1)) + '/' + fecha.getFullYear() + '] ' + nombre;
                    select.append('<option value="grupo[' + i + ']">' + texto + '</option>');
                }
                select.append('<option value="-2"></option>');
            }
            select.append('<option value="-1">Nuevo contacto...</option>');
        } else {
            select.append('<option value="-2">ERROR!!!</option>');
        }
    }
    
    function mostrar_cita(cita, card, origen) {
        var siniestro = cita.evento.descripcion.slice(1, cita.evento.descripcion.indexOf(']')),
            direccion = cita.evento.descripcion.slice(cita.evento.descripcion.indexOf(']') + 1, cita.evento.descripcion.length),
            jornada = cita.grupo.observaciones.slice(1, cita.grupo.observaciones.indexOf(']')),
            grupo = cita.grupo.observaciones.slice(cita.grupo.observaciones.indexOf(']') + 1, cita.grupo.observaciones.length),
            hora = (cita.hora > 9 ? cita.hora : '0' + cita.hora) + ':' + (cita.minuto > 9 ? cita.minuto : '0' + cita.minuto);
        componentes.cardActual = card;
        jornada = new Date(new Number(jornada));
        jornada = (jornada.getDate() > 9 ? jornada.getDate() : '0' + jornada.getDate()) + '/' + (jornada.getMonth() > 8 ? (jornada.getMonth() + 1) : '0' + (jornada.getMonth() + 1)) + '/' + jornada.getFullYear();
        card.children('div.card-header').children('div.row').children('div.siniestro').children('h4').children('span').html(siniestro);
        card.children('div.card-header').children('div.row').children('div.fecha').children('h4').children('span').html(jornada);
        card.children('div.card-body').children('div.direccion').children('div.col-12').children('span').html(direccion);
        card.children('div.card-body').children('div.grupo').children('div.col-12').children('div.input-group').children('div.input-group-prepend').children('span.dia').html(jornada);
        card.children('div.card-body').children('div.grupo').children('div.col-12').children('div.input-group').children('div.input-group-prepend').children('span.hora').html(hora);
        card.children('div.card-body').children('div.grupo').children('div.col-12').children('div.input-group').children('span.nombre').html(grupo);
        $.get('http://localhost:8080/ReForms_Provider/wr/tareascita/obtenerTareasPorCita/' + cita.id, respuesta_obtenerTareasPorCita, 'json');
        if (origen === 'grupo') {
            card.css({'background-color':sinColor, 'border-color':colorBorde});
            card.children('div.card-header').css({'background-color':colorBorde, 'border-color':colorBorde});
            card.children('div.card-body').css({'background-color':sinColor, 'border-color':colorBorde});
            card.children('div.card-body').children('div.row').children('div.col-12').children('div.tabla').children('table.table').children('thead').children('tr').children('th').css('background-color', colorBorde);
        } else if (origen === 'siniestro') {
            card.css({'background-color':sinColor, 'border-color':colorBordeSiniestro});
            card.children('div.card-header').css({'background-color':colorBordeSiniestro, 'border-color':colorBordeSiniestro});
            card.children('div.card-body').css({'background-color':sinColor, 'border-color':colorBordeSiniestro});
            card.children('div.card-body').children('div.row').children('div.col-12').children('div.tabla').children('table.table').children('thead').children('tr').children('th').css('background-color', colorBordeSiniestro);
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
    
    function actualizar_tabla_agenda(listaCitas, tbody) {
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
            tbody.append('<tr class="sin-resultados cita"><td colspan="2"><h4>Sin citas registradas</h4></td></tr>');
        }
    }
    
    function actualizar_tabla_tareas(listaTareas, tbody) {
        tbody.children('tr.tarea').remove();
        if (listaTareas.length > 0) {
            var i, tarea, und;
            for (i = 0; i < listaTareas.length; i++) {
                alert(JSON.stringify(listaTareas[i]));
                switch (listaTareas[i].trabajo.medida) {
                    case 0: und = ' uds.'; break;
                    case 1: und = ' m'; break;
                    case 2: und = ' m<sup>2</sup>'; break;
                    case 3: und = ' m<sup>3</sup>'; break;
                    case 4: und = ' h'; break;
                    case 5: und = ' km'; break;
                    default: und = ''; break;
                }
                tarea = '<td>' + listaTareas[i].trabajo.codigo + '</td><td>' + listaTareas[i].trabajo.descripcion + '</td><td>' + listaTareas[i].cantidad + und + '</td>';
                tbody.append('<tr class="tarea">' + tarea + '</tr>');
            }
            tbody.children('tr.tarea').click(siniestro_tarea_click);
        } else {
            tbody.append('<tr class="sin-resultados tarea"><td colspan="3"><h4>Sin tareas registradas</h4></td></tr>');
        }
    }
    
    function actualizar_tabla_citas(listaCitas, tbody) {
        tbody.children('tr.cita').remove();
        if (listaCitas.length > 0) {
            var i, cita, jornada, grupo;
            for (i = 0; i < listaCitas.length; i++) {
                jornada = listaCitas[i].grupo.observaciones.slice(1, listaCitas[i].grupo.observaciones.indexOf(']'));
                jornada = new Date(new Number(jornada));
                jornada = 'Jor. ' + (jornada.getDate() > 9 ? jornada.getDate() : '0' + jornada.getDate()) + '/' + (jornada.getMonth() > 8 ? (jornada.getMonth() + 1) : '0' + (jornada.getMonth() + 1)) + '/' + jornada.getFullYear();
                grupo = listaCitas[i].grupo.observaciones.slice(listaCitas[i].grupo.observaciones.indexOf(']') + 1, listaCitas[i].grupo.observaciones.length);
                cita = '<td>' + jornada + '</td><td>' + grupo + '</td>';
                cita += '<td>' + (listaCitas[i].hora > 9 ? listaCitas[i].hora : '0' + listaCitas[i].hora) + ':' + (listaCitas[i].minuto > 9 ? listaCitas[i].minuto : '0' + listaCitas[i].minuto) + '</td>';
                tbody.append('<tr class="cita">' + cita + '</tr>');
            }
            tbody.children('tr.cita').click(siniestro_cita_click);
        } else {
            tbody.append('<tr class="sin-resultados cita"><td colspan="3"><h4>Sin citas registradas</h4></td></tr>');
        }
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
        componentes.relacionar.iconoGrupo.html('check_circle');
        if (relacionar.llamada != null) {
            componentes.relacionar.cita.children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.cita').children('div.col-12').children('div.boton').children('div.input-group').children('button.btn-nuevo').prop('disabled', false);
        }
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
                componentes.jornada.agenda.detalles.load('Html/cita.html', cargar_cita_grupo);
                componentes.jornada.agenda.detalles.show();
            } else {
                seleccion_grup.agenda.posicionSeleccionada = -1;
                seleccion_grup.agenda.citaSeleccionada = null;
                componentes.jornada.agenda.detalles.hide();
                componentes.cardActual = null;
            }
        }
    }
    
    function jornada_volver_click() {
        if (seleccion_grup.grupos.posicionSeleccionada != componentes.jornada.select.val()) {
            componentes.jornadas.detalles.children('div.col-12').children('div.contenedor').children('div.card').children('div.card-footer').children('div.container-fluid').children('div.tabla').children('div.col-12').children('div.table-responsive-md').children('table.table').children('tbody').children('tr.grupo').eq(componentes.jornada.select.val()).click();
        }
        componentes.relacionar.iconoGrupo.html('help');
        if (relacionar.llamada != null) {
            componentes.relacionar.cita.children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.cita').children('div.col-12').children('div.boton').children('div.input-group').children('button.btn-nuevo').prop('disabled', true);
        }
        componentes.jornadas.div.show();
        componentes.jornada.div.hide();
    }
    
    function siniestro_consultar_click() {
        sessionStorage.setItem('siniestro', JSON.stringify(seleccion_even.siniestros.siniestroSeleccionado));
        $('#contenido').load('Html/siniestro.html', function(responseTxt, statusTxt) {
            if (statusTxt != 'success') {
                alerta('Error 404', 'no se pudo cargar siniestro.html');
                sessionStorage.removeItem('siniestro');
            }
        });
    }
    
    function siniestro_volver_click() {
        alert('siniestro_volver_siniestros_click()');
        componentes.siniestro.div.hide();
        componentes.siniestros.div.show();
    }
    
    function siniestro_tarea_click() {
        if (!edicion) {
            if (seleccion_even.tareas.posicionSeleccionada == $(this).index()) {
                seleccion_even.tareas.tareaSeleccionada = null;
                seleccion_even.tareas.posicionSeleccionada = -1;
                $(this).css('background-color', sinColor);
                componentes.siniestro.tareas.tarea.hide();
            } else {
                seleccion_even.tareas.posicionSeleccionada = $(this).index();
                seleccion_even.tareas.tareaSeleccionada = seleccion_even.tareas.listaTareas[seleccion_even.tareas.posicionSeleccionada];
                componentes.siniestro.tareas.tbody.children('tr.tarea').css('background-color', sinColor);
                $(this).css('background-color', colorFondoSiniestro);
                componentes.siniestro.tareas.tarea.load('Html/tarea.html', cargar_tarea_siniestro);
                componentes.siniestro.tareas.tarea.show();
            }
        }
    }
    
    function siniestro_cita_click() {
        if (!edicion) {
            if (seleccion_even.citas.posicionSeleccionada == $(this).index()) {
                seleccion_even.citas.citaSeleccionada = null;
                seleccion_even.citas.posicionSeleccionada = -1;
                $(this).css('background-color', sinColor);
                componentes.siniestro.citas.cita.hide();
                componentes.cardActual = null;
            } else {
                seleccion_even.citas.posicionSeleccionada = $(this).index();
                seleccion_even.citas.citaSeleccionada = seleccion_even.citas.listaCitas[seleccion_even.citas.posicionSeleccionada];
                componentes.siniestro.citas.tbody.children('tr.cita').css('background-color', sinColor);
                $(this).css('background-color', colorFondoSiniestro);
                componentes.siniestro.citas.cita.load('Html/cita.html', cargar_cita_siniestro);
                componentes.siniestro.citas.cita.show();
            }
        }
    }
    
    function llamada_agregar_click() {
        var card = componentes.relacionar.cita.children('div.contenedor').children('div.card'),
            select = card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.nueva').children('div.seleccion').children('div.col-6').children('select.telefonos');
        edicion_llamada = true;
        mostrar_agenda(relacionar.agenda, select);
        card.children('div.card-header').children('div.fecha').children('input').prop('disabled', true);
        card.children('div.card-body').children('div.container-fluid').children('div.descripcion').children('div.col-12').children('textarea').prop('disabled', true);
        card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.boton, div.detalles').hide();
        card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.nueva').show();
        card.children('div.card-footer').children('div.container-fluid').children('div.botones').children('div.col-12').children('button').prop('disabled', true);
    }
    
    function cita_agregar_click() {
        alert('cita_agregar_click()');
        // copiar de ControladorSiniestro.js
    }
    
    function icono_agregar_click() {
        if (!$(this).parent('div.input-group-prepend').siblings('button.btn-nuevo').prop('disabled')) {
            $(this).parent('div.input-group-prepend').siblings('button.btn-nuevo').click();
        }
    }
    
    function evento_aceptar_click(){
        alert('evento_aceptar_click()');
    }
    
    function llamada_aceptar_click() {
        var card = componentes.relacionar.cita.children('div.contenedor').children('div.card'),
            llamada = card.children('div.card-body').children('div.container-fluid').children('div.llamada'),
            telefonos = llamada.children('div.col-12').children('div.nueva').children('div.seleccion').children('div.col-6').children('select.telefonos'),
            tipo = llamada.children('div.col-12').children('div.nueva').children('div.seleccion').children('div.col-6').children('div.input-group').children('select.tipos'),
            detalles = llamada.children('div.col-12').children('div.detalles'),
            textoTelefono = '', textoNombre = '';
        relacionar.llamada.id = null;
        relacionar.llamada.tipo = Number.parseInt(tipo.val());
        relacionar.llamada.cliente = null;
        relacionar.llamada.contacto = null;
        relacionar.llamada.perito = null;
        relacionar.llamada.grupo = null;
        if (telefonos.val() == 'cliente') {
            relacionar.llamada.cliente = relacionar.agenda.cliente;
        } else if (telefonos.val() == -1) {
            var conacto = card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.nueva').children('div.contacto').children('div.col-12'),
                nombre = conacto.children('div.nombre').children('div.col-12').children('div.form-group').children('input[name="llamada_contacto_nombre"]'),
                apellido1 = conacto.children('div.apellidos').children('div.col-12').children('div.form-group').children('div.input-group').children('input[name="llamada_contacto_apellido1"]'),
                apellido2 = conacto.children('div.apellidos').children('div.col-12').children('div.form-group').children('div.input-group').children('input[name="llamada_contacto_apellido2"]'),
                telefono1 = conacto.children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input[name="llamada_contacto_telefono1"]'),
                telefono2 = conacto.children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input[name="llamada_contacto_telefono2"]');
            relacionar.llamada.contacto = new Contacto();
            relacionar.llamada.contacto.telefono1 = telefono1.val();
            if (nombre.val() != '') {
                relacionar.llamada.contacto.nombre = nombre.val();
            }
            if (apellido1.val() != '') {
                relacionar.llamada.contacto.apellido1 = apellido1.val();
            }
            if (nombre.val() != '') {
                relacionar.llamada.contacto.apellido2 = apellido2.val();
            }
            if (nombre.val() != '') {
                relacionar.llamada.contacto.telefono2 = telefono2.val();
            }
        } else {
            var t = telefonos.val().slice(0, telefonos.val().indexOf('[')),
                i = Number.parseInt(telefonos.val().slice(telefonos.val().indexOf('[') + 1, telefonos.val().length - 1));
            switch (t) {
                case 'contacto': relacionar.llamada.contacto = relacionar.agenda.contactos[i]; break;
                case 'perito': relacionar.llamada.perito = relacionar.agenda.peritos[i]; break;
                case 'grupo': relacionar.llamada.grupo = relacionar.agenda.grupos[i]; break;
            }
        }
        if (relacionar.llamada.cliente && relacionar.llamada.cliente != null) {
            textoNombre = relacionar.llamada.cliente.nombre + ' ' + relacionar.llamada.cliente.apellido1;
            if (relacionar.llamada.cliente.apellido2 && relacionar.llamada.cliente.apellido2 != null && relacionar.llamada.cliente.apellido2 != '') {
                textoNombre += ' ' + relacionar.llamada.cliente.apellido2;
            }
            textoTelefono = relacionar.llamada.cliente.telefono1;
            if (relacionar.llamada.cliente.telefono2 && relacionar.llamada.cliente.telefono2 != null && relacionar.llamada.cliente.telefono2 != '') {
                textoTelefono += ' / ' + relacionar.llamada.cliente.telefono2
            }
        } else if (relacionar.llamada.contacto && relacionar.llamada.contacto != null) {
            if (relacionar.llamada.contacto.nombre && relacionar.llamada.contacto.nombre != null && relacionar.llamada.contacto.nombre != '') {
                textoNombre += relacionar.llamada.contacto.nombre + ' ';
            }
            if (relacionar.llamada.contacto.apellido1 && relacionar.llamada.contacto.apellido1 != null && relacionar.llamada.contacto.apellido1 != '') {
                textoNombre += relacionar.llamada.contacto.apellido1 + ' ';
            }
            if (relacionar.llamada.contacto.apellido2 && relacionar.llamada.contacto.apellido2 != null && relacionar.llamada.contacto.apellido2 != '') {
                textoNombre += relacionar.llamada.contacto.apellido2;
            }
            textoTelefono = relacionar.llamada.contacto.telefono1;
            if (relacionar.llamada.contacto.telefono2 && relacionar.llamada.contacto.telefono2 != null && relacionar.llamada.contacto.telefono2 != '') {
                textoTelefono += ' / ' + relacionar.llamada.contacto.telefono2
            }
        } else if (relacionar.llamada.perito && relacionar.llamada.perito != null) {
            textoNombre = relacionar.llamada.perito.nombre + ' ' + relacionar.llamada.perito.apellido1;
            textoTelefono = relacionar.llamada.perito.telefono1;
            if (relacionar.llamada.perito.telefono2 && relacionar.llamada.perito.telefono2 != null && relacionar.llamada.perito.telefono2 != '') {
                textoTelefono += ' / ' + relacionar.llamada.perito.telefono2;
            }
        } else if (relacionar.llamada.grupo && relacionar.llamada.grupo != null) {
            if (relacionar.llamada.grupo.observaciones && relacionar.llamada.grupo.observaciones != null && relacionar.llamada.grupo.observaciones != '') {
                var fecha = relacionar.llamada.grupo.observaciones.slice(1, relacionar.llamada.grupo.observaciones.indexOf(']'));
                fecha = new Date (new Number(fecha));
                textoNombre = relacionar.llamada.grupo.observaciones.slice(relacionar.llamada.grupo.observaciones.indexOf(']') + 2, relacionar.llamada.grupo.observaciones.length);
                textoTelefono = '[Jor. ' + (fecha.getDate() > 9 ? fecha.getDate() : '0' + fecha.getDate()) + '/' + (fecha.getMonth() > 8 ? fecha.getMonth() + 1 : '0' + (fecha.getMonth() + 1)) + '/' + fecha.getFullYear() + ']';
            }
        }
        detalles.children('div.input-group').children('div.input-group-prepend').children('span.numero').html(textoTelefono);
        detalles.children('div.input-group').children('span.nombre').html(textoNombre);
        detalles.children('div.input-group').children('div.input-group-append').children('span.tipo').html(generar_icono_llamada(relacionar.llamada.tipo));
        edicion_llamada = false;
        card.children('div.card-header').children('div.fecha').children('input').prop('disabled', false);
        card.children('div.card-body').children('div.container-fluid').children('div.descripcion').children('div.col-12').children('textarea').prop('disabled', false);
        card.children('div.card-footer').children('div.container-fluid').children('div.botones').children('div.col-12').children('button').prop('disabled', false);
        detalles.children('div.input-group').children('div.input-group-append').children('span.tipo').html(generar_icono_llamada(relacionar.llamada.tipo));
        card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.boton, div.nueva').hide();
        detalles.show();
    }
    
    function llamada_cancelar_click() {
        var card = componentes.relacionar.cita.children('div.contenedor').children('div.card');
        edicion_llamada = false;
        card.children('div.card-header').children('div.fecha').children('input').prop('disabled', false);
        card.children('div.card-body').children('div.container-fluid').children('div.descripcion').children('div.col-12').children('textarea').prop('disabled', false);
        card.children('div.card-footer').children('div.container-fluid').children('div.botones').children('div.col-12').children('button').prop('disabled', false);
        card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.nueva, div.detalles').hide();
        card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.boton').show();
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
    
    function llamada_telefonos_change() {
        var nueva = componentes.relacionar.cita.children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.nueva');
        if ($(this).val() == -1) {
            nueva.children('div.botones').children('div.col-12').children('button.btn-aceptar').prop('disabled', true);
            nueva.children('div.contacto').children('div.col-12').children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input[name="llamada_contacto_telefono1"]').val('');
            nueva.children('div.contacto').show();
        } else {
            nueva.children('div.botones').children('div.col-12').children('button.btn-aceptar').prop('disabled', $(this).val() < 0);
            nueva.children('div.contacto').hide();
        }
    }
    
    function llamada_tipo_change() {
        $(this).siblings('div.input-group-append').children('span.tipo').html(generar_icono_llamada(Number.parseInt($(this).val())));
    }
    
    function siniestro_llamada_telefono1_keyup() {
        var aceptar = componentes.relacionar.cita.children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.nueva').children('div.botones').children('div.col-12').children('button.btn-aceptar');
        aceptar.prop('disabled', !($(this).val() != '' && telefono_valido($(this).val())));
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
            componentes.jornada.agenda.detalles.hide();
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
    
    function cargar_evento(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var card = componentes.relacionar.cita.children('div.contenedor').children('div.card'),
                detalles_llamada = card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.detalles'),
                nueva_llamada = card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.nueva'),
                textoNombre, textoTelefono, fecha = relacionar.llamada.evento.fecha, operador = relacionar.llamada.evento.operador;
            fecha = new Date(fecha.slice(0, fecha.indexOf('T')));
            textoNombre = operador.trabajador.nombre + ' ' + operador.trabajador.apellido1;
            card.children('div.card-header').children('h4.nombre').html('<ins>Registrado por:</ins> ' + textoNombre);
            fecha = fecha.getFullYear() + '-' + (fecha.getMonth() > 8 ? (fecha.getMonth() + 1) : '0' + (fecha.getMonth() + 1)) + '-' + (fecha.getDate() > 9 ? fecha.getDate() : ('0' + fecha.getDate()));
            card.children('div.card-header').children('div.fecha').children('input').val(fecha);
            card.children('div.card-body').children('div.container-fluid').children('div.descripcion').children('div.col-12').children('textarea').prop('readonly', false);
            if (relacionar.llamada.evento.descripcion && relacionar.llamada.evento.descripcion != null) {
                card.children('div.card-body').children('div.container-fluid').children('div.descripcion').children('div.col-12').children('textarea').val(relacionar.llamada.evento.descripcion);
            }
            if (relacionar.llamada.id == null) {
                if (relacionar.llamada.cliente && relacionar.llamada.cliente != null) {
                    textoNombre = relacionar.llamada.cliente.nombre + ' ' + relacionar.llamada.cliente.apellido1;
                    if (relacionar.llamada.cliente.apellido2 && relacionar.llamada.cliente.apellido2 != null && relacionar.llamada.cliente.apellido2 != '') {
                        textoNombre += ' ' + relacionar.llamada.cliente.apellido2;
                    }
                    textoTelefono = relacionar.llamada.cliente.telefono1;
                    if (relacionar.llamada.cliente.telefono2 && relacionar.llamada.cliente.telefono2 != null && relacionar.llamada.cliente.telefono2 != '') {
                        textoTelefono += ' / ' + relacionar.llamada.cliente.telefono2
                    }
                } else if (relacionar.llamada.contacto && relacionar.llamada.contacto != null) {
                    textoNombre = '';
                    if (relacionar.llamada.contacto.nombre && relacionar.llamada.contacto.nombre != null && relacionar.llamada.contacto.nombre != '') {
                        textoNombre += relacionar.llamada.contacto.nombre + ' ';
                    }
                    if (relacionar.llamada.contacto.apellido1 && relacionar.llamada.contacto.apellido1 != null && relacionar.llamada.contacto.apellido1 != '') {
                        textoNombre += relacionar.llamada.contacto.apellido1 + ' ';
                    }
                    if (relacionar.llamada.contacto.apellido2 && relacionar.llamada.contacto.apellido2 != null && relacionar.llamada.contacto.apellido2 != '') {
                        textoNombre += relacionar.llamada.contacto.apellido2;
                    }
                    textoTelefono = relacionar.llamada.contacto.telefono1;
                    if (relacionar.llamada.contacto.telefono2 && relacionar.llamada.contacto.telefono2 != null && relacionar.llamada.contacto.telefono2 != '') {
                        textoTelefono += ' / ' + relacionar.llamada.contacto.telefono2
                    }
                } else if (relacionar.llamada.perito && relacionar.llamada.perito != null) {
                    textoNombre = relacionar.llamada.perito.nombre + ' ' + relacionar.llamada.perito.apellido1;
                    textoTelefono = relacionar.llamada.perito.telefono1;
                    if (relacionar.llamada.perito.telefono2 && relacionar.llamada.perito.telefono2 != null && relacionar.llamada.perito.telefono2 != '') {
                        textoTelefono += ' / ' + relacionar.llamada.perito.telefono2;
                    }
                } else if (relacionar.llamada.grupo && relacionar.llamada.grupo != null) {
                    if (relacionar.llamada.grupo.observaciones && relacionar.llamada.grupo.observaciones != null && relacionar.llamada.grupo.observaciones != '') {
                        fecha = relacionar.llamada.grupo.observaciones.slice(1, relacionar.llamada.grupo.observaciones.indexOf(']'));
                        fecha = new Date (new Number(fecha));
                        textoNombre = relacionar.llamada.grupo.observaciones.slice(relacionar.llamada.grupo.observaciones.indexOf(']') + 2, relacionar.llamada.grupo.observaciones.length);
                        textoTelefono = '[Jor. ' + (fecha.getDate() > 9 ? fecha.getDate() : '0' + fecha.getDate()) + '/' + (fecha.getMonth() > 8 ? fecha.getMonth() + 1 : '0' + (fecha.getMonth() + 1)) + '/' + fecha.getFullYear() + ']';
                    }
                } else {
                    alert('falta informacion de la llamada');
                }
                detalles_llamada.children('div.input-group').children('div.input-group-prepend').children('span.numero').html(textoTelefono);
                detalles_llamada.children('div.input-group').children('span.nombre').html(textoNombre);
                detalles_llamada.children('div.input-group').children('div.input-group-append').children('span.tipo').html(generar_icono_llamada(relacionar.llamada.tipo));
                card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.boton').hide();
            } else {
                detalles_llamada.hide();
            }
            nueva_llamada.children('div.seleccion').children('div.col-6').children('select.telefonos').change(llamada_telefonos_change);
            nueva_llamada.children('div.seleccion').children('div.col-6').children('div.input-group').children('select.tipos').change(llamada_tipo_change);
            nueva_llamada.children('div.seleccion').children('div.col-6').children('select.telefonos').change();
            nueva_llamada.children('div.seleccion').children('div.col-6').children('div.input-group').children('select.tipos').change();
            nueva_llamada.children('div.botones').children('div.col-12').children('button.btn-aceptar').click(llamada_aceptar_click);
            nueva_llamada.children('div.botones').children('div.col-12').children('button.btn-cancelar').click(llamada_cancelar_click);
            nueva_llamada.children('div.contacto').children('div.col-12').children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input[name="llamada_contacto_telefono1"]').keyup(siniestro_llamada_telefono1_keyup);
            card.children('div.card-footer').children('div.container-fluid').children('div.botones').children('div.col-12').children('button.btn-aceptar').click(evento_aceptar_click);
            card.children('div.card-footer').children('div.container-fluid').children('div.botones').children('div.col-12').children('button.btn-cancelar').click(siniestro_consultar_click);
            card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.boton').children('div.input-group').children('button.btn-nuevo').click(llamada_agregar_click);
            card.children('div.card-body').children('div.container-fluid').children('div.cita').children('div.col-12').children('div.boton').children('div.input-group').children('button.btn-nuevo').prop('disabled', true).click(cita_agregar_click);
            card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('div.boton').children('div.input-group').children('div.input-group-prepend').children('span.input-group-text').click(icono_agregar_click);
            card.css({'border-color':colorBordeSiniestro, 'background-color':'rgb(255, 255, 255)'});
            card.children('div.card-header').css({'border-color':colorBordeSiniestro, 'background-color':colorBordeSiniestro});
            card.children('div.card-header').children('div.fecha').css('background-color', 'white');
            card.children('div.card-header').children('div.fecha').children('input').css({'background-color': colorFondoSiniestro, 'border-color': colorFondoSiniestro, 'color': colorTextoNeutro});
            card.children('div.card-body, div.card-footer').css({'border-color':colorBordeSiniestro, 'background-color':colorFondoSiniestro});
            detalles_llamada.children('div.input-group').children('div.input-group-prepend').children('span.numero').css({'background-color': colorFondoSiniestro, 'border-color': colorBordeSiniestro});
            detalles_llamada.children('div.input-group').children('span.nombre').css({'background-color': colorFondoSiniestro, 'border-color': colorBordeSiniestro});
            detalles_llamada.children('div.input-group').children('div.input-group-append').children('span.tipo').css({'background-color': colorFondoSiniestro, 'border-color': colorBordeSiniestro});
            card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('div.boton').css({'background-color': colorFondoSiniestro, 'border-color': colorBordeSiniestro});
            card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('div.boton').children('div.input-group').children('div.input-group-prepend').children('span.input-group-text').css({'background-color': colorBordeSiniestro, 'border-color': colorBordeSiniestro, 'color': 'rgb(255, 255, 255, 0.7)'});
            card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('div.boton').children('div.input-group').children('button.btn-nuevo').css({'background-color': colorFondoSiniestro, 'border-color': colorBordeSiniestro});
            card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.nueva').css({'background-color': colorFondoSiniestro, 'border-color': colorBordeSiniestro}).hide();
            card.children('div.card-body').children('div.container-fluid').children('div.cita').children('div.col-12').children('div.detalles').hide();
            componentes.relacionar.cita.show();
        } else {
            alerta('Error 404', 'no se pudo cargar evento.html');
            componentes.relacionar.cita.hide();
        }
    }
    
    function cargar_cita_grupo(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var cita = seleccion_grup.agenda.citaSeleccionada,
                card = $(this).children('div.contenedor').children('div.card-cita');
            mostrar_cita(cita, card, 'grupo');
        } else {
            alerta('Error 404', 'no se pudo cargar cita.html');
        }
    }
    
    function cargar_tarea_siniestro(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var header = $(this).children('div.contenedor').children('div.card').children('div.card-header'),
                body = $(this).children('div.contenedor').children('div.card').children('div.card-body'),
                footer = $(this).children('div.contenedor').children('div.card').children('div.card-footer'),
                gremio = header.children('div.container-fluid').children('div.row').children('div.col-4').children('input.tarea-gremio'),
                descripcion = body.children('div.container-fluid').children('div.row').children('div.col-8').children('input.tarea-descripcion'),
                codigo = header.children('div.container-fluid').children('div.row').children('div.col-4').children('input.tarea-codigo'),
                estado = header.children('div.container-fluid').children('div.row').children('div.col-4').children('input.tarea-estado'),
                cantidad = body.children('div.container-fluid').children('div.row').children('div.col-4').children('div.tarea-cantidad'),
                cantidad_valor = cantidad.children('input[type="number"]'),
                cantidad_unidad = cantidad.children('div.input-group-append').children('span.input-group-text'),
                observaciones = body.children('div.container-fluid').children('div.row').children('div.col-8').children('textarea.tarea-observaciones'),
                importe = body.children('div.container-fluid').children('div.row').children('div.col-4').children('div').children('div.tarea-importe').children('input[type="text"]');
            if (seleccion_even.tareas.tareaSeleccionada.trabajo.gremio.nombre && seleccion_even.tareas.tareaSeleccionada.trabajo.gremio.nombre != null && seleccion_even.tareas.tareaSeleccionada.trabajo.gremio.nombre != '') {
                gremio.val(seleccion_even.tareas.tareaSeleccionada.trabajo.gremio.nombre);
            } else {
                gremio.val('');
            }
            if (seleccion_even.tareas.tareaSeleccionada.trabajo.descripcion && seleccion_even.tareas.tareaSeleccionada.trabajo.descripcion != null && seleccion_even.tareas.tareaSeleccionada.trabajo.descripcion != '') {
                descripcion.val(seleccion_even.tareas.tareaSeleccionada.trabajo.descripcion);
            } else {
                descripcion.val('');
            }
            if (seleccion_even.tareas.tareaSeleccionada.trabajo.codigo && seleccion_even.tareas.tareaSeleccionada.trabajo.codigo != null && seleccion_even.tareas.tareaSeleccionada.trabajo.codigo != '') {
                codigo.val(seleccion_even.tareas.tareaSeleccionada.trabajo.codigo);
            } else {
                codigo.val('');
            }
            switch (seleccion_even.tareas.tareaSeleccionada.estado) {
                case 0: estado.val('pendiente'); break;
                case 1: estado.val('en proceso'); break;
                case 2: estado.val('finalizada'); break;
                case 3: estado.val('anulada'); break;
                default: estado.val('');
            }
            if (seleccion_even.tareas.tareaSeleccionada.cantidad != null) {
                cantidad_valor.val(seleccion_even.tareas.tareaSeleccionada.cantidad);
                switch (seleccion_even.tareas.tareaSeleccionada.trabajo.medida) {
                    case 0: cantidad_unidad.html('uds.'); break;
                    case 1: cantidad_unidad.html('m'); break;
                    case 2: cantidad_unidad.html('m<sup>2</sup>'); break;
                    case 3: cantidad_unidad.html('m<sup>3</sup>'); break;
                    case 4: cantidad_unidad.html('h'); break;
                    case 5: cantidad_unidad.html('km'); break;
                    default: cantidad_unidad.html('');
                }
            } else {
                cantidad_valor.val('');
                cantidad_unidad.html('');
            }
            if (seleccion_even.tareas.tareaSeleccionada.observaciones && seleccion_even.tareas.tareaSeleccionada.observaciones != null && seleccion_even.tareas.tareaSeleccionada.observacionese != '') {
                observaciones.val(seleccion_even.tareas.tareaSeleccionada.observaciones);
            } else {
                observaciones.val('');
            }
            if (seleccion_even.tareas.tareaSeleccionada.importe && seleccion_even.tareas.tareaSeleccionada.importe != null) {
                importe.val(seleccion_even.tareas.tareaSeleccionada.importe.toFixed(2));
            } else {
                importe.val('0.00');
            }
            $(this).children('div.contenedor').children('div.card').css('border-color', colorBordeSiniestro);
            header.css({'background-color':colorBordeSiniestro, 'border-color':colorBordeSiniestro});
            footer.css({'background-color':colorFondoSiniestro, 'border-color':colorBordeSiniestro});
            body.children('div.container-fluid').children('div.row').children('div.col-4').children('div.botones').remove();
        } else {
            alerta('Error 404', 'no se pudo cargar tarea.html');
        }
    }
    
    function cargar_cita_siniestro(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var cita = seleccion_even.citas.citaSeleccionada,
                card = $(this).children('div.contenedor').children('div.card-cita');
            mostrar_cita(cita, card, 'siniestro');
        } else {
            alerta('Error 404', 'no se pudo cargar cita.html');
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
            actualizar_tabla_agenda(seleccion_grup.agenda.listaCitas, componentes.jornada.agenda.tbody);
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerSiniestro(data, status) {
        if (status == 'success') {
            seleccion_even.siniestros.siniestroSeleccionado = data;
            relacionar.agenda.cliente = seleccion_even.siniestros.siniestroSeleccionado.poliza.cliente;
            $.get('http://localhost:8080/ReForms_Provider/wr/perito/buscarPeritoPorAseguradora/' + seleccion_even.siniestros.siniestroSeleccionado.poliza.cliente.aseguradora.id, function(data, status) {
                if (status == 'success') {
                    var i;
                    relacionar.agenda.peritos = [];
                    for (i = 0; i < data.length; i++) {
                        relacionar.agenda.peritos.push(data[i]);
                    }
                    $.get('http://localhost:8080/ReForms_Provider/wr/grupo/obtenerGruposPorSiniestro/' + seleccion_even.siniestros.siniestroSeleccionado.id, function(data, status) {
                        if (status == 'success') {
                            var i;
                            relacionar.agenda.grupos = [];
                            for (i = 0; i < data.length; i++) {
                                relacionar.agenda.grupos.push(data[i]);
                            }
                        } else {
                            relacionar.agenda.cliente = null;
                            relacionar.agenda.contactos = [];
                            relacionar.agenda.peritos = [];
                            relacionar.agenda.grupos = [];
                            alert('fallo en el proveedor');
                        }
                    }, 'json');
                } else {
                    relacionar.agenda.cliente = null;
                    relacionar.agenda.contactos = [];
                    relacionar.agenda.peritos = [];
                    relacionar.agenda.grupos = [];
                    alert('fallo en el proveedor');
                }
            }, 'json');
            mostrar_siniestro(seleccion_even.siniestros.siniestroSeleccionado);
        } else {
            alert('fallo en proveedor');
        }
    }
    
    function respuesta_obtenerContactos(data, status) {
        if (status == 'success') {
            relacionar.agenda.contactos = data;
            if (data.length > 0) {
                var i, aux;
                componentes.siniestro.resumen.contactos.children('div.contactos').children('ul').children('li').remove();
                for (i = 0; i < data.length; i++) {
                    aux = '';
                    if (data[i].nombre && data[i].nombre != null && data[i].nombre != '') {
                        aux += data[i].nombre + ' ';
                    }
                    if (data[i].apellido1 && data[i].apellido1 != null && data[i].apellido1 != '') {
                        aux += data[i].apellido1 + ' ';
                    }
                    if (data[i].apellido2 && data[i].apellido2 != null && data[i].apellido2 != '') {
                        aux += data[i].apellido2 + ' ';
                    }
                    aux += '(' + data[i].telefono1;
                    if (data[i].telefono2 && data[i].telefono2 != null && data[i].telefono2 != '') {
                        aux += '/' + data[i].telefono2;
                    }
                    aux += ')';
                    componentes.siniestro.resumen.contactos.children('div.contactos').children('ul').append('<li>' + aux + '</li>');
                }
                componentes.siniestro.resumen.contactos.children('div.contactos').show();
            } else {
                componentes.siniestro.resumen.contactos.children('div.contactos').hide();
            }
        } else {
            relacionar.agenda.cliente = null;
            relacionar.agenda.contactos = [];
            relacionar.agenda.peritos = [];
            relacionar.agenda.grupos = [];
            alert('fallo en proveedor');
        }
    }
    
    function respuesta_obtenerCitas(data, status) {
        seleccion_even.citas.posicionSeleccionada = -1;
        seleccion_even.citas.citaSeleccionada = null;
        if (status == 'success') {
            seleccion_even.citas.listaCitas = data;
            actualizar_tabla_citas(seleccion_even.citas.listaCitas, componentes.siniestro.citas.tbody);
        } else {
            seleccion_even.tareas.listaTareas = [];
            alert('fallo en proveedor');
        }
    }
    
    function respuesta_obtenerTareas(data, status) {
        seleccion_even.tareas.posicionSeleccionada = -1;
        seleccion_even.tareas.tareaSeleccionada = null;
        if (status == 'success') {
            var i;
            seleccion_even.tareas.listaTareas = [];
            for (i = 0; i < data.length; i++) {
                seleccion_even.tareas.listaTareas.push(data[i].tarea);
            }
            actualizar_tabla_tareas(seleccion_even.tareas.listaTareas, componentes.siniestro.tareas.tbody);
        } else {
            seleccion_even.tareas.listaTareas = [];
            alert('fallo en proveedor');
        }
    }
    
    function respuesta_obtenerTareasPorCita(data, status) {
        if (status == 'success') {
            var tbody = componentes.cardActual.children('div.card-body').children('div.tareas').children('div.col-12').children('div.tabla').children('table.table').children('tbody');
            actualizar_tabla_tareas(data, tbody);
        } else {
            alert('fallo en proveedor');
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
    componentes.jornada.agenda.detalles = componentes.jornada.div.children('div.agenda').children('div.col-12').children('div.detalles');
    componentes.siniestros.mapa = componentes.siniestros.div.children('div.mapa');
    componentes.siniestros.tabla.tbody = componentes.siniestros.div.children('div.tabla');
    componentes.siniestros.tabla.detalles = componentes.siniestros.div.children('div.tabla');
    componentes.siniestro.resumen.cabecera.siniestro = componentes.siniestro.div.children('div.container-fluid').children('div.cabecera').children('div.num-siniestro').children('h5').children('span');
    componentes.siniestro.resumen.cabecera.poliza = componentes.siniestro.div.children('div.container-fluid').children('div.cabecera').children('div.num-poliza').children('h5').children('span');
    componentes.siniestro.resumen.cabecera.fecha = componentes.siniestro.div.children('div.container-fluid').children('div.cabecera').children('div.fecha').children('h6').children('span');
    componentes.siniestro.resumen.cabecera.estado = componentes.siniestro.div.children('div.container-fluid').children('div.cabecera').children('div.estado').children('h6').children('span');
    componentes.siniestro.resumen.cabecera.consultar = componentes.siniestro.div.children('div.container-fluid').children('div.cabecera').children('div.detalles').children('button.btn-consultar');
    componentes.siniestro.resumen.contactos = componentes.siniestro.div.children('div.container-fluid').children('div.resumen').children('div.contactos');
    componentes.siniestro.resumen.direccion = componentes.siniestro.div.children('div.container-fluid').children('div.resumen').children('div.direccion');
    componentes.siniestro.tareas.tbody = componentes.siniestro.div.children('div.container-fluid').children('div.tareas').children('div.tabla').children('table.table').children('tbody');
    componentes.siniestro.tareas.tarea = componentes.siniestro.div.children('div.container-fluid').children('div.tarea');
    componentes.siniestro.citas.tbody = componentes.siniestro.div.children('div.container-fluid').children('div.citas').children('div.tabla').children('table.table').children('tbody');
    componentes.siniestro.citas.cita = componentes.siniestro.div.children('div.container-fluid').children('div.cita');
    componentes.siniestro.botones = componentes.siniestro.div.children('div.container-fluid').children('div.botones').children('div.col-12');
    componentes.relacionar.iconoGrupo = componentes.relacionar.div.children('div.col-2:first-child').children('i.relaccion');
    componentes.relacionar.iconoEvento = componentes.relacionar.div.children('div.col-2:last-child').children('i.relaccion');
    componentes.relacionar.cita = componentes.relacionar.div.children('div.col-8').children('div.cita');
    if (sessionStorage.llamada && sessionStorage.llamada != null && sessionStorage.llamada != '') {
        // parte en la que entramos desde el siniestro
        relacionar.llamada = JSON.parse(sessionStorage.llamada);
        sessionStorage.removeItem('llamada');
        componentes.siniestro.botones.children('button.btn-volver').click(siniestro_consultar_click);
        componentes.relacionar.cita.load('Html/evento.html', cargar_evento);
        $.get('http://localhost:8080/ReForms_Provider/wr/siniestro/obtenerSiniestro/' + relacionar.llamada.evento.siniestro.id, respuesta_obtenerSiniestro, 'json');
    } else {
        // parte en la que entramos desde la pestaña jornadas
        componentes.siniestro.botones.children('button.btn-volver').click(siniestro_volver_click);
    }
    componentes.siniestro.resumen.cabecera.consultar.click(siniestro_consultar_click);
    var f = new Date(), y = f.getFullYear(), m = f.getMonth() + 1;
    componentes.jornadas.calendario.fecha.val(y + (m < 10 ? '-0' + m : '-' + m) + '-01');
    componentes.jornadas.calendario.fecha.change(fecha_change);
    componentes.jornadas.calendario.nueva.click(jornada_nueva_click);
    componentes.jornada.div.children('div.botones').children('button.btn-volver').click(jornada_volver_click);
    componentes.jornada.select.change(jornada_grupo_change);
    actualizar_calendario(y, m, null);

    // Inicializacion de aspecto y colores
    // ====================================================================== //
    $("#ventana").css({'border-color':colorBorde, 'background-color':colorFondo});
    componentes.jornadas.calendario.tbody.siblings('thead').children('tr').css("background-color", colorBorde);
    componentes.jornadas.calendario.nueva.css({'border-color':colorBorde, 'background-color':colorFondo});
    componentes.jornada.agenda.tbody.siblings('thead').children('tr').css("background-color", colorBorde);
    componentes.jornada.div.children('div.cabecera').css('background-color', colorBorde);
    componentes.jornada.div.children('div.botones').children('button.btn-volver').css({'border-color':colorBorde, 'background-color':colorFondo});
    componentes.siniestro.div.css('border-color', colorBordeSiniestro);
    componentes.siniestro.div.children('div.container-fluid').css('background-color', colorFondoSiniestro);
    componentes.siniestro.resumen.cabecera.consultar.css({'border-color':sinColor, 'background-color':sinColor});
    componentes.siniestro.tareas.tbody.siblings('thead').children('tr').children('th').css('background-color', colorBordeSiniestro);
    componentes.siniestro.citas.tbody.siblings('thead').children('tr').children('th').css('background-color', colorBordeSiniestro);
    componentes.siniestro.botones.children('button.btn-volver').css({'border-color':colorBordeSiniestro, 'background-color':colorFondoSiniestro});
    componentes.relacionar.div.css('background-image', 'linear-gradient(to right, ' + colorBorde + ' , ' + colorBordeSiniestro + ')');
    componentes.jornadas.detalles.hide();
    componentes.jornada.div.hide();
    if (relacionar.llamada == null) {
        componentes.relacionar.iconoGrupo.html('help');
        componentes.relacionar.iconoEvento.html('help');
        componentes.siniestro.div.hide();
    } else {
        componentes.relacionar.iconoGrupo.html('help');
        componentes.relacionar.iconoEvento.html('check_circle');
        componentes.siniestros.div.hide();
    }
});
