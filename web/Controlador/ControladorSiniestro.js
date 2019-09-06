$(document).ready(function() {

    // Variables
    // ====================================================================== //
    var colorBorde = $('#btn-siniestros').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.2)',
        sinColor = 'rgb(0, 0, 0, 0)',
        colorFondoNeutro = 'rgb(169, 169, 169)',
        colorBordeNeutro = 'rgb(206, 212, 218)',
        colorTextoNeutro = 'rgb(33, 37, 41)',
        siniestro = JSON.parse(sessionStorage.siniestro),
        contactos = {
            'listaContactos': [],
            'contactoSeleccionado': null,
            'posicionSeleccionado': -1
        },
        tareas = {
            'listaTareas': [],
            'tareaSeleccionada': null,
            'posicionSeleccionada': -1,
            'ampliaciones': [],
            'gremios': [],
            'trabajos': []
        },
        eventos = {
            'listaLlamadas': [],
            'llamadaSeleccionada': null,
            'posicionSeleccionada': -1,
            'agenda': {
                'cliente': null,
                'contactos': [],
                'peritos': [],
                'grupos': []
            }
        },
        adicional = {
            'participantes': {
                'listaParticipantes': [],
                'participanteSeleccionado': null,
                'multiserviciosDisponibles': []
            },
            'replanificaciones': {
                'listaReplanificaciones': []
            },
            'reasignaciones': {
                'listaReasignaciones': []
            },
            'recursos': {
                'listaRecursos': [],
                'recursoSeleccionado': null,
                'posicionSeleccionado': -1,
                'temp': null
            }
        },
        componentes = {
            'botonera': {
                'botones': $('#ventana').children('div.container-fluid').children('div.botonera').children('div.acciones'),
                'acciones': $('#ventana').children('div.container-fluid').children('div.acciones')
            },
            'siniestro': {
            	'contenido': $('#ventana').children('div.container-fluid').children('div.siniestro').children('div.ocultable-contenido'),
                'informacion': null,
                'observaciones': null,
                'estado': $('#ventana').children('div.container-fluid').children('div.siniestro').children('div.ocultable-titulo').children('div.form-inline').children('div.estado')
            },
            'contactos': {
                'detalles': null,
                'botones': null,
                'entradas': null,
                'tabla': null
            },
            'tareas': {
                'lista': $('#ventana').children('div.container-fluid').children('div.tareas').children('div.ocultable-contenido').children('div.row').children('div.col-12').children('div.lista').children('div.row'),
                'botones': $('#ventana').children('div.container-fluid').children('div.tareas').children('div.ocultable-contenido').children('div.row').children('div.col-12').children('div.botones'),
                'seleccionada': {
                    'header': null,
                    'body': null,
                    'footer': null,
                    'botones': null
                },
                'nueva': {
                    'header': null,
                    'body': null,
                    'botones': null
                }
            },
            'eventos': {
                'tbody': $('#ventana').children('div.container-fluid').children('div.eventos').children('div.ocultable-contenido').children('div.row').children('div.tabla').children('div.table-responsive-md').children('table.table').children('tbody'),
                'nuevo': $('#ventana').children('div.container-fluid').children('div.eventos').children('div.ocultable-contenido').children('div.row').children('div.tabla').children('div.table-responsive-md').children('button.btn-nuevo'),
                'detalles': $('#ventana').children('div.container-fluid').children('div.eventos').children('div.ocultable-contenido').children('div.row').children('div.detalles')
            },
            'adicional': {
                'participantes': {
                    'elemento': $('#ventana').children('div.container-fluid').children('div.adicional').children('div.ocultable-contenido').children('div.row').children('div.participantes'),
                    'nuevo': null,
                    'participante': null,
                    'botones': null
                },
                'replanificaciones': {
                    'elemento': $('#ventana').children('div.container-fluid').children('div.adicional').children('div.ocultable-contenido').children('div.row').children('div.replanificaciones')
                },
                'reasignaciones': {
                    'elemento': $('#ventana').children('div.container-fluid').children('div.adicional').children('div.ocultable-contenido').children('div.row').children('div.reasignaciones')
                },
                'recursos': {
                    'recurso': $('#ventana').children('div.container-fluid').children('div.adicional').children('div.ocultable-contenido').children('div.recursos').children('div.recurso'),
                    'entrada_fichero': null,
                    'descarga_fichero': null,
                    'entrada_tipo': null,
                    'botones': null,
                    'previsualizacion': null,
                    'tabla': $('#ventana').children('div.container-fluid').children('div.adicional').children('div.ocultable-contenido').children('div.recursos').children('div.tabla')
                }
            }
        },
        strAux, edicion = false, edicion_llamada = false;
        
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
    
    function invertir_color(color) {
        var c, r, g, b, t;
        c = color.substring(4, color.length - 1);
        r = Number(c.substring(0, c.indexOf(',')));
        c = c.substring(c.indexOf(',') + 2, c.length);
        g = Number(c.substring(0, c.indexOf(',')));
        c = c.substring(c.indexOf(',') + 2, c.length);
        if (c.indexOf(',') == -1) {
            b = c;
            t = null;
        } else {
            b = Number(c.substring(0, c.indexOf(',')));
            t = c.substring(c.indexOf(',') + 2, c.length);
        }
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
        return t == null ? ('rgb(' + r + ', ' + g + ', ' + b + ')') : ('rgb(' + r + ', ' + g + ', ' + b + ', ' + t + ')');
    }
    
    function calcular_importe(cantidad, trabajo) {
        var importe, direfencia;
        if (cantidad <= trabajo.cantidadMin) {
            importe = trabajo.precioMin;
        } else if (cantidad <= trabajo.cantidadMed) {
            importe = trabajo.precioMed;
        } else {
            direfencia = cantidad - trabajo.cantidadMed;
            importe = trabajo.precioMed + (direfencia * trabajo.precioExtra);
        }
        return importe;
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
    
    function mostrar_contactos(listaContactos, tbody) {
        var i, informacion;
        tbody.children('tr.contacto').remove();
        if (listaContactos.length > 0) {
            for (i = 0; i < listaContactos.length; i++) {
                if (listaContactos[i].nombre && listaContactos[i].nombre != null && listaContactos[i].nombre != '') {
                    informacion = listaContactos[i].nombre;
                } else {
                    informacion = '';
                }
                if (listaContactos[i].apellido1 && listaContactos[i].apellido1 != null && listaContactos[i].apellido1 != '') {
                    informacion += ' ' + listaContactos[i].apellido1;
                }
                if (listaContactos[i].apellido2 && listaContactos[i].apellido2 != null && listaContactos[i].apellido2 != '') {
                    informacion += ' ' + listaContactos[i].apellido2;
                }
                informacion += ' ( ' + listaContactos[i].telefono1;
                if (listaContactos[i].telefono2 && listaContactos[i].telefono2 != null && listaContactos[i].telefono2 != '') {
                    informacion += ' / ' + listaContactos[i].telefono2 + ' )';
                } else {
                    informacion += ' )';
                }
                tbody.append('<tr class="contacto"><td>' + informacion + '</td></tr>');
            }
            tbody.children('tr.contacto').click(contacto_click);
        } else {
            tbody.append('<tr class="contacto sin-resultados"><td><h4>Sin contactos</h4></td></tr>');
        }
    }
    
    function mostrar_replanificaciones(listaReplanificaciones, tbody) {
        var i;
        tbody.children('tr.replanificacion').remove();
        if (listaReplanificaciones.length > 0) {
            for (i = 0; i < listaReplanificaciones.length; i++) {
                tbody.append('<tr class="replanificacion"><td>' + listaReplanificaciones[i].fecha.slice(0, listaReplanificaciones[i].fecha.indexOf('T')) + '</td></tr>');
            }
        } else {
            tbody.append('<tr class="replanificacion sin-resultados"><td><h5>No ha sido replanificado</h5></td></tr>');
        }
    }
    
    function mostrar_reasignaciones(listaReasignaciones, tbody) {
        var i, fecha, perito;
        tbody.children('tr.reasignacion').remove();
        if (listaReasignaciones.length > 0) {
            for (i = 0; i < listaReasignaciones.length; i++) {
                fecha = listaReasignaciones[i].fecha.slice(0, listaReasignaciones[i].fecha.indexOf('T'));
                if (listaReasignaciones[i].perito.apellido1 && listaReasignaciones[i].perito.apellido1 != null && listaReasignaciones[i].perito.apellido1 != '') {
                    perito = listaReasignaciones[i].perito.nombre + ' ' + listaReasignaciones[i].perito.apellido1;
                } else {
                    perito = listaReasignaciones[i].perito.nombre;
                }
                tbody.append('<tr class="reasignacion"><td>' + fecha + '</td><td>' + perito + '</td></tr>');
            }
        } else {
            tbody.append('<tr class="reasignacion sin-resultados"><td colspan="2"><h5>No ha sido reasignado</h5></td></tr>');
        }
    }
    
    function mostrar_participantes(listaParticipantes, tbody) {
        var i, contacto;
        tbody.children('tr.participante').remove();
        if (listaParticipantes.length > 0) {
            for (i = 0; i < listaParticipantes.length; i++) {
                if (listaParticipantes[i].multiservicios.telefono1 && listaParticipantes[i].multiservicios.telefono1 != null && listaParticipantes[i].multiservicios.telefono1 != '') {
                    contacto = listaParticipantes[i].multiservicios.telefono1;
                } else if (listaParticipantes[i].multiservicios.telefono2 && listaParticipantes[i].multiservicios.telefono2 != null && listaParticipantes[i].multiservicios.telefono2 != '') {
                    contacto = listaParticipantes[i].multiservicios.telefono2;
                } else if (listaParticipantes[i].multiservicios.email && listaParticipantes[i].multiservicios.email != null && listaParticipantes[i].multiservicios.email != '') {
                    contacto = listaParticipantes[i].multiservicios.email;
                } else if (listaParticipantes[i].multiservicios.fax && listaParticipantes[i].multiservicios.fax != null && listaParticipantes[i].multiservicios.fax != '') {
                    contacto = listaParticipantes[i].multiservicios.fax;
                } else {
                    contacto = null;
                }
                if (contacto != null) {
                    tbody.append('<tr class="participante"><td>' + listaParticipantes[i].multiservicios.nombre + ' (' + contacto + ')<button class="btn btn-borrar-sm" type="button">&Chi;</button></td></tr>');
                } else {
                    tbody.append('<tr class="participante"><td>' + listaParticipantes[i].multiservicios.nombre + '<button class="btn btn-borrar-sm" type="button">&Chi;</button></td></tr>');
                }
            }
            tbody.children('tr.participante').children('td').mouseenter(function () {if (!edicion) {$(this).children('button.btn-borrar-sm').show();}});
            tbody.children('tr.participante').children('td').mouseleave(function () {$(this).children('button.btn-borrar-sm').hide();});
            tbody.children('tr.participante').children('td').children('button.btn-borrar-sm').click(participante_borrar_click).hide();
        } else {
            tbody.append('<tr class="participante sin-resultados"><td><h5>No hay participantes</h5></td></tr>');
        }
    }
    
    function mostrar_recursos(listaRecursos, tbody) {
        var i, tipo;
        tbody.children('tr.recurso').remove();
        if (listaRecursos.length > 0) {
            for (i = 0; i < listaRecursos.length; i++) {
                switch (listaRecursos[i].tipo) {
                    case 0: tipo = '<i class="material-icons">insert_drive_file</i>'; break;
                    case 1: tipo = '<i class="material-icons">camera_alt</i>'; break; 
                    case 2: tipo = '<i class="material-icons">attach_file</i>'; break; 
                    default: tipo = 'desconocido';
                }
                tbody.append('<tr class="recurso"><td>' + listaRecursos[i].nombre + '</td><td>' + tipo + '</td></tr>');
            }
            tbody.children('tr.recurso').click(recurso_click);
        } else {
            tbody.append('<tr class="recurso sin-resultados"><td colspan="2"><h5>No hay recursos</h5></td></tr>');
        }
    }
    
    function mostrar_tareas(listaTareas, contenedor) {
        contenedor.children('div.sin-tareas').remove();
        contenedor.children('div.tarea').remove();
        if (listaTareas.length > 0) {
            var i;
            for (i = 0; i < listaTareas.length; i++) {
                contenedor.append('<div class="tarea col-xl-6 col-12"></div>');
            }
            contenedor.children('div.tarea').load('Html/tarea.html', cargar_tarea);
        } else {
            contenedor.append('<div class="sin-tareas col-12"><h1>Sin tareas registradas</h1></div>');
            contenedor.children('div.sin-tareas').css({'background-color':colorFondo, 'border-color':colorBorde});
        }
    }
    
    function mostrar_llamadas(listaLlamadas, tbody) {
        tbody.children('tr.llamada').remove();
        if (listaLlamadas.length > 0) {
            var i, fecha, descripcion, tipo;
            for (i = 0; i < listaLlamadas.length; i++) {
                if (listaLlamadas[i].id > -1) {
                    if (listaLlamadas[i].evento.fecha && listaLlamadas[i].evento.fecha != null) {
                        fecha = '<td>' +
                                (listaLlamadas[i].evento.fecha.getDate() > 9 ? listaLlamadas[i].evento.fecha.getDate() : '0' + listaLlamadas[i].evento.fecha.getDate()) + '/' +
                                (listaLlamadas[i].evento.fecha.getMonth() > 8 ? (listaLlamadas[i].evento.fecha.getMonth() + 1) : '0' + (listaLlamadas[i].evento.fecha.getMonth() + 1)) + '/' +
                                listaLlamadas[i].evento.fecha.getFullYear() + '</td>';
                    } else {
                        fecha = '<td></td>';
                    }
                    if (listaLlamadas[i].cliente && listaLlamadas[i].cliente != null) {
                        descripcion = listaLlamadas[i].cliente.nombre + ' ' + listaLlamadas[i].cliente.apellido1 + ' (' + listaLlamadas[i].cliente.telefono1;
                        if (listaLlamadas[i].cliente.telefono2 && listaLlamadas[i].cliente.telefono2 != null && listaLlamadas[i].cliente.telefono2 != '') {
                            descripcion += '/' + listaLlamadas[i].cliente.telefono2;
                        }
                        descripcion += ')';
                    } else if (listaLlamadas[i].contacto && listaLlamadas[i].contacto != null) {
                        descripcion = '';
                        if (listaLlamadas[i].contacto.nombre && listaLlamadas[i].contacto.nombre != null && listaLlamadas[i].contacto.nombre != '') {
                            descripcion += listaLlamadas[i].contacto.nombre + ' ';
                        }
                        if (listaLlamadas[i].contacto.apellido1 && listaLlamadas[i].contacto.apellido1 != null && listaLlamadas[i].contacto.apellido1 != '') {
                            descripcion += listaLlamadas[i].contacto.apellido1 + ' ';
                        }
                        if (listaLlamadas[i].contacto.apellido2 && listaLlamadas[i].contacto.apellido2 != null && listaLlamadas[i].contacto.apellido2 != '') {
                            descripcion += listaLlamadas[i].contacto.apellido2 + ' ';
                        }
                        descripcion += '(' + listaLlamadas[i].contacto.telefono1;
                        if (listaLlamadas[i].contacto.telefono2 && listaLlamadas[i].contacto.telefono2 != null && listaLlamadas[i].contacto.telefono2 != '') {
                            descripcion += '/' + listaLlamadas[i].contacto.telefono2;
                        }
                        descripcion += ')';
                    } else if (listaLlamadas[i].perito && listaLlamadas[i].perito != null) {
                        descripcion = listaLlamadas[i].perito.nombre + ' ' + listaLlamadas[i].perito.apellido1 + ' (' + listaLlamadas[i].perito.telefono1;
                        if (listaLlamadas[i].perito.telefono2 && listaLlamadas[i].perito.telefono2 != null && listaLlamadas[i].perito.telefono2 != '') {
                            descripcion += '/' + listaLlamadas[i].perito.telefono2;
                        }
                        descripcion += ')';
                    } else if (listaLlamadas[i].grupo && listaLlamadas[i].grupo != null) {
                        var f = listaLlamadas[i].grupo.observaciones.slice(1, listaLlamadas[i].grupo.observaciones.indexOf(']')),
                            textoNombre, textoFecha;
                        f = new Date (new Number(f));
                        textoFecha = '[Jor. ' + (f.getDate() > 9 ? f.getDate() : '0' + f.getDate()) + '/' + (f.getMonth() > 8 ? f.getMonth() + 1 : '0' + (f.getMonth() + 1)) + '/' + f.getFullYear() + ']';
                        textoNombre = listaLlamadas[i].grupo.observaciones.slice(listaLlamadas[i].grupo.observaciones.indexOf(']') + 2, listaLlamadas[i].grupo.observaciones.length);
                        descripcion = textoFecha + ' ' + textoNombre;
                    } else {
                        descripcion = '';
                    }
                    descripcion = '<td>' + descripcion + '</td>';
                    tipo = '<td>' + generar_icono_llamada(listaLlamadas[i].tipo) + '</td>';
                    tbody.append('<tr class="llamada">' + fecha + descripcion + tipo + '</tr>');
                } else {
                    if (listaLlamadas[i].evento.fecha && listaLlamadas[i].evento.fecha != null) {
                        fecha = '<td>' +
                                (listaLlamadas[i].evento.fecha.getDate() > 9 ? listaLlamadas[i].evento.fecha.getDate() : '0' + listaLlamadas[i].evento.fecha.getDate()) + '/' +
                                (listaLlamadas[i].evento.fecha.getMonth() > 8 ? (listaLlamadas[i].evento.fecha.getMonth() + 1) : '0' + (listaLlamadas[i].evento.fecha.getMonth() + 1)) + '/' +
                                listaLlamadas[i].evento.fecha.getFullYear() + '</td>';
                    } else {
                        fecha = '<td></td>';
                    }
                    descripcion = '<td>' + listaLlamadas[i].evento.descripcion + '</td>';
                    tipo = '<td></td>';
                    tbody.append('<tr class="llamada">' + fecha + descripcion + tipo + '</tr>');
                }
            }
            tbody.children('tr.llamada').click(evento_click);
        } else {
            tbody.append('<tr class="llamada sin-resultados"><td colspan="3"><h4>Sin eventos registrados</h4></td></tr>');
        }
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
    
    function actualizar_estado_siniestro(estado) {
        var strAux;
        switch (estado) {
            case 0: strAux = 'pendiente'; break;
            case 1: strAux = 'en proceso'; break;
            case 2: strAux = 'finalizado'; break;
            case 3: strAux = 'parcialmente finalizado'; break;
            case 4: strAux = 'cerrado'; break;
            case 5: strAux = 'devuleto'; break;
            case 6: strAux = 'facturado'; break;
            case 7: strAux = 'cobrado'; break;
            default: strAux = 'desconocido'; break;
        }
        componentes.siniestro.informacion.children('div.siniestro_estado').children('div.form-group').children('input[name="siniestro_estado"]').val(strAux);
        componentes.siniestro.estado.children('input[name="estado"]').val(strAux);
        if (estado < 4) {
            componentes.tareas.botones.show();
            componentes.botonera.botones.children('button[name="replanificar"]').show();
            componentes.botonera.botones.children('button[name="reasignar"]').show();
            if (estado == 0 && tareas.listaTareas.length == 0 && eventos.listaLlamadas.length == 0) {
                componentes.botonera.botones.children('button[name="borrar"]').show();
            } else {
                componentes.botonera.botones.children('button[name="borrar"]').hide();
            }
            if (estado < 2) {
                componentes.botonera.botones.children('button[name="cerrar"]').hide();
            } else {
                componentes.botonera.botones.children('button[name="cerrar"]').show();
            }
            componentes.botonera.botones.children('button[name="facturar"]').hide();
            componentes.botonera.botones.children('button[name="cobrar"]').hide();
        } else {
            componentes.tareas.botones.hide();
            componentes.botonera.botones.children('button[name="borrar"]').hide();
            switch (estado) {
                case 4:
                    componentes.botonera.botones.children('button').not('button[name="facturar"]').hide();
                    componentes.botonera.botones.children('button[name="facturar"]').show();
                    break;
                case 6:
                    componentes.botonera.botones.children('button').not('button[name="cobrar"]').hide();
                    componentes.botonera.botones.children('button[name="cobrar"]').show();
                    break;
                default:
                    componentes.botonera.botones.children('button').hide();
                    break;
            }
        }
    }
    
    function actualizar_fecha_siniestro() {
        var fecha = componentes.siniestro.contenido.children('div.informacion').children('div.container-fluid').children('div.row').children('div.siniestro_fecha').children('div.form-group').children('input[name="siniestro_fecha"]'),
            h5 = componentes.siniestro.informacion.children('div.siniestro_fecha').children('div.form-group').children('h5');
        if (siniestro.estado != null && siniestro.estado > 3) {
            h5.html('Fecha de cierre');
            fecha.val(siniestro.fechaCierre.slice(0, siniestro.fechaCierre.indexOf('T')));
        } else {
            if (adicional.replanificaciones.listaReplanificaciones.length > 0)  {
                h5.html('Fecha replanificada');
            } else {
                h5.html('Fecha de registro');
            }
            fecha.val(siniestro.fechaRegistro.slice(0, siniestro.fechaRegistro.indexOf('T')));
        }
    }
    
    function actualizar_detalles_contacto() {
        var nombre = componentes.contactos.entradas.children('input[name="siniestro_contacto_nombre"]'),
            apellido1 = componentes.contactos.entradas.children('div.input-group').children('input[name="siniestro_contacto_apellido1"]'),
            apellido2 = componentes.contactos.entradas.children('div.input-group').children('input[name="siniestro_contacto_apellido2"]'),
            telefono1 = componentes.contactos.entradas.children('div.input-group').children('input[name="siniestro_contacto_telefono1"]'),
            telefono2 = componentes.contactos.entradas.children('div.input-group').children('input[name="siniestro_contacto_telefono2"]'),
            observaciones = componentes.contactos.entradas.children('textarea[name="siniestro_contacto_observaciones"]'),
            aceptar = componentes.contactos.botones.children('button[name="siniestro_contacto_aceptar"]');
        if (contactos.contactoSeleccionado != null) {
            if (contactos.contactoSeleccionado.nombre && contactos.contactoSeleccionado.nombre != null && contactos.contactoSeleccionado.nombre != '') {
                nombre.val(contactos.contactoSeleccionado.nombre);
            } else {
                nombre.val('');
            }
            if (contactos.contactoSeleccionado.apellido1 && contactos.contactoSeleccionado.apellido1 != null && contactos.contactoSeleccionado.apellido1 != '') {
                apellido1.val(contactos.contactoSeleccionado.apellido1);
            } else {
                apellido1.val('');
            }
            if (contactos.contactoSeleccionado.apellido2 && contactos.contactoSeleccionado.apellido2 != null && contactos.contactoSeleccionado.apellido2 != '') {
                apellido2.val(contactos.contactoSeleccionado.apellido2);
            } else {
                apellido2.val('');
            }
            if (contactos.contactoSeleccionado.telefono1 && contactos.contactoSeleccionado.telefono1 != null && contactos.contactoSeleccionado.telefono1 != '') {
                telefono1.val(contactos.contactoSeleccionado.telefono1);
                aceptar.prop('disabled', false);
            } else {
                telefono1.val('');
                aceptar.prop('disabled', true);
            }
            if (contactos.contactoSeleccionado.telefono2 && contactos.contactoSeleccionado.telefono2 != null && contactos.contactoSeleccionado.telefono2 != '') {
                telefono2.val(contactos.contactoSeleccionado.telefono2);
            } else {
                telefono2.val('');
            }
            if (contactos.contactoSeleccionado.observaciones && contactos.contactoSeleccionado.observaciones != null && contactos.contactoSeleccionado.observaciones != '') {
                observaciones.val(contactos.contactoSeleccionado.observaciones);
            } else {
                observaciones.val('');
            }
            componentes.contactos.detalles.show();
        } else {
            componentes.contactos.detalles.hide();
        }
    }
    
    function actualizar_detalles_participante() {
        var contenedor = componentes.adicional.participantes.participante.children('div.contenedor');
        contenedor.find('input').val('');
    }
    
    function actualizar_detalles_recurso() {
        var salidas = componentes.adicional.recursos.recurso.children('div.contenedor').children('div.archivo').children('div.tipo').children('div.form-group').children('div.salida'),
            icono = salidas.children('div.input-group-append').children('div.recurso_tipo_icono');
        if (adicional.recursos.recursoSeleccionado != null) {
            if (adicional.recursos.recursoSeleccionado.id == null) {
                adicional.recursos.recursoSeleccionado.tipo = 1;
            }
            componentes.adicional.recursos.entrada_tipo.children('select[name="recurso_tipo"]').val(adicional.recursos.recursoSeleccionado.tipo).change();
            if (adicional.recursos.recursoSeleccionado.tipo == 2) {
                salidas.children('input[name="recurso_tipo_texto"]').val('Archivo');
                icono.children('i.material-icons').remove();
                icono.append('<i class="material-icons">attach_file</i>');
            } else {
                if (adicional.recursos.recursoSeleccionado.tipo == 0) {
                    salidas.children('input[name="recurso_tipo_texto"]').val('PDF');
                    icono.children('i.material-icons').remove();
                    icono.append('<i class="material-icons">insert_drive_file</i>');
                    componentes.adicional.recursos.previsualizacion.children('div.contenedor').children('div.vista-previa').remove();
                    if (adicional.recursos.recursoSeleccionado.fichero && adicional.recursos.recursoSeleccionado.fichero != null && adicional.recursos.recursoSeleccionado.fichero != '') {
                        var pdf = '<iframe src="data:application/pdf;base64,' + adicional.recursos.recursoSeleccionado.fichero + '"></iframe>'; 
                        componentes.adicional.recursos.previsualizacion.children('div.contenedor').append('<div class="vista-previa">' + pdf + '</div>');
                        componentes.adicional.recursos.previsualizacion.show();
                    } else {
                        componentes.adicional.recursos.previsualizacion.hide();
                    }
                } else {
                    salidas.children('input[name="recurso_tipo_texto"]').val('Imagen');
                    icono.children('i.material-icons').remove();
                    icono.append('<i class="material-icons">camera_alt</i>');
                    componentes.adicional.recursos.previsualizacion.children('div.contenedor').children('div.vista-previa').remove();
                    if (adicional.recursos.recursoSeleccionado.fichero && adicional.recursos.recursoSeleccionado.fichero != null && adicional.recursos.recursoSeleccionado.fichero != '') {
                        var img = '<img src="data:image/jpeg;base64,' + adicional.recursos.recursoSeleccionado.fichero + '" alt="' + adicional.recursos.recursoSeleccionado.nombre + '"/>';
                        componentes.adicional.recursos.previsualizacion.children('div.contenedor').append('<div class="vista-previa">' + img + '</div>');
                        componentes.adicional.recursos.previsualizacion.show();
                    } else {
                        componentes.adicional.recursos.previsualizacion.hide();
                    }
                }
            }
            if (adicional.recursos.recursoSeleccionado.nombre && adicional.recursos.recursoSeleccionado.nombre != null && adicional.recursos.recursoSeleccionado.nombre != '') {
                componentes.adicional.recursos.recurso.children('div.contenedor').children('div.archivo').children('div.fichero').children('div.form-group').children('div.salida').children('input[name="recurso_nombre"]').val(adicional.recursos.recursoSeleccionado.nombre);
            } else{
                componentes.adicional.recursos.recurso.children('div.contenedor').children('div.archivo').children('div.fichero').children('div.form-group').children('div.salida').children('input[name="recurso_nombre"]').val('');
            }
            if (adicional.recursos.recursoSeleccionado.fichero && adicional.recursos.recursoSeleccionado.fichero != null && adicional.recursos.recursoSeleccionado.fichero != '') {
                componentes.adicional.recursos.descarga_fichero.prop('download', adicional.recursos.recursoSeleccionado.nombre);
                componentes.adicional.recursos.descarga_fichero.prop('href', 'data:text/plain;base64,' + adicional.recursos.recursoSeleccionado.fichero);
                componentes.adicional.recursos.entrada_fichero.children('input[name="recurso_fichero"]').val('');
                componentes.adicional.recursos.entrada_fichero.children('label.recurso_fichero_texto').text(adicional.recursos.recursoSeleccionado.nombre);
            } else {
                componentes.adicional.recursos.descarga_fichero.prop('download', '');
                componentes.adicional.recursos.descarga_fichero.prop('href', '');
                componentes.adicional.recursos.entrada_fichero.children('input[name="recurso_fichero"]').val('');
                componentes.adicional.recursos.entrada_fichero.children('label.recurso_fichero_texto').text('Examinar . . .');
            }
            if (adicional.recursos.recursoSeleccionado.descripcion && adicional.recursos.recursoSeleccionado.descripcion != null && adicional.recursos.recursoSeleccionado.descripcion != '') {
                componentes.adicional.recursos.recurso.children('div.contenedor').children('div.descripcion').children('div.texto').children('textarea[name="recurso_descripcion"]').val(adicional.recursos.recursoSeleccionado.descripcion);
            } else {
                componentes.adicional.recursos.recurso.children('div.contenedor').children('div.descripcion').children('div.texto').children('textarea[name="recurso_descripcion"]').val('');
            }
            componentes.adicional.recursos.recurso.show();
        } else {
            componentes.adicional.recursos.recurso.hide();
        }
    }
    
    // Funciones controladoras para componentes
    // ====================================================================== //
    function borrar_click() {
        if (!edicion) {
            if (confirm('el siniestro se eliminara permanentemente')) {
                $.ajax({
                    url: 'http://localhost:8080/ReForms_Provider/wr/siniestro/borrarSiniestro/' + siniestro.id,
                    type: 'delete',
                    contentType: 'application/json;charset=UTF-8',
                    success: function(data, textStatus, jQxhr){
                        $('#btn-siniestros').click();
                    },
                    error: function(jqXhr, textStatus, errorThrown){
                        alerta('Error en proveedor', 'no ha sido posible borrar el siniestro');
                    }
                });
            }
        }
    }
    
    function replanificar_click() {
        if (!edicion) {
            componentes.botonera.acciones.children('div.contenedor').children('div.accion').remove();
            componentes.botonera.acciones.children('div.contenedor').append('<div class="accion"></div>');
            componentes.botonera.acciones.children('div.contenedor').children('div.accion').load('Html/replanificacion.html', cargar_replanificacion);
        }
    }
    
    function replanificacion_aceptar_click() {
        var fecha = componentes.botonera.acciones.children('div.contenedor').children('div.accion').children('div.container-fluid').children('div.row').children('div.nueva').children('div.form-group').children('input.accion-fecha-nueva'),
            r = new Replanificacion();
        r.fecha = new Date(fecha.val());
        r.siniestro = siniestro;
        $.ajax({
            url: 'http://localhost:8080/ReForms_Provider/wr/replanificacion/replanificarSiniestro',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(r),
            processData: false,
            success: function(data, textStatus, jQxhr){
                siniestro.fechaRegistro = fecha.val().concat(siniestro.fechaRegistro.substring(siniestro.fechaRegistro.indexOf('T'), siniestro.fechaRegistro.length));
                $.get('http://localhost:8080/ReForms_Provider/wr/replanificacion/obtenerReplanificaciones/' + siniestro.id, respuesta_obtenerReplanificaciones, 'json');
            },
            error: function(jQxhr, textStatus, errorThrown){
                alerta('Error en proveedor', 'no ha sido posible replanificar el siniestro');
            }
        });
        $(this).siblings('button.btn-accion-cancelar').click();
    }
    
    function replanificacion_cancelar_click() {
        edicion = false;
        componentes.botonera.acciones.slideUp();
    }
    
    function reasignar_click() {
        if (!edicion) {
            componentes.botonera.acciones.children('div.contenedor').children('div.accion').remove();
            componentes.botonera.acciones.children('div.contenedor').append('<div class="accion"></div>');
            componentes.botonera.acciones.children('div.contenedor').children('div.accion').load('Html/reasignacion.html', cargar_reasignacion);
        }
    }
    
    function reasignacion_aceptar_click() {
        var select = componentes.botonera.acciones.children('div.contenedor').children('div.accion').children('div.container-fluid').children('div.row').children('div.nuevo').children('div.form-group').children('select.accion-perito-nuevo'),
            r = new Reasignacion();
        r.siniestro = siniestro;
        r.perito = new Perito();
        r.perito.id = select.val();
        $.ajax({
            url: 'http://localhost:8080/ReForms_Provider/wr/reasignacion/reasignarSiniestro',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(r),
            processData: false,
            success: function(data, textStatus, jQxhr){
                $.get('http://localhost:8080/ReForms_Provider/wr/reasignacion/obtenerReasignaciones/' + siniestro.id, respuesta_obtenerReasignaciones, 'json');
                $.get('http://localhost:8080/ReForms_Provider/wr/reasignacion/obtenerUltimaReasignacion/' + siniestro.id, respuesta_obtenerUltimaReasignacion, 'json');
            },
            error: function(jQxhr, textStatus, errorThrown){
                alerta('Error en proveedor', 'no ha sido posible reasignar el siniestro');
            }
        });
        $(this).siblings('button.btn-accion-cancelar').click();
    }
    
    function reasignacion_cancelar_click() {
        edicion = false;
        componentes.botonera.acciones.slideUp();
    }
    
    function cerrar_click() {
        if (!edicion) {
            if (confirm('Se cerrara el siniestro de forma permanente')) {
                $.ajax({
                    url: 'http://localhost:8080/ReForms_Provider/wr/siniestro/cerrarSiniestro/' + siniestro.id,
                    dataType: 'json',
                    type: 'put',
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify(siniestro),
                    processData: false,
                    success: function(data, textStatus, jQxhr){
                        $.get('http://localhost:8080/ReForms_Provider/wr/tarea/obtenerTareas/' + siniestro.id, respuesta_obtenerTareas, 'json');
                    },
                    error: function(jQxhr, textStatus, errorThrown){
                        alerta('Error en proveedor', 'no ha sido posible cerrar el siniestro');
                    }
                });
            }
        }
    }
    
    function facturar_click() {
        if (!edicion) {
            componentes.botonera.acciones.children('div.contenedor').children('div.accion').remove();
            componentes.botonera.acciones.children('div.contenedor').append('<div class="accion"></div>');
            componentes.botonera.acciones.children('div.contenedor').children('div.accion').load('Html/facturacion.html', cargar_facturacion);
        }
    }
    
    function facturacion_aceptar_click() {
        if (confirm('Se cambiara el estado del siniestro a facturado de forma permanente')) {
            var entrada = componentes.botonera.acciones.children('div.contenedor').children('div.accion').children('div.container-fluid').children('div.row').children('div.albaran').children('div.form-group').children('input.form-control');
            siniestro.albaran = entrada.val() != '' ? Number(entrada.val()) : null;
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/siniestro/facturarSiniestro/' + siniestro.id,
                dataType: 'json',
                type: 'put',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(siniestro),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    $.get('http://localhost:8080/ReForms_Provider/wr/tarea/obtenerTareas/' + siniestro.id, respuesta_obtenerTareas, 'json');
                    componentes.siniestro.contenido.children('div.informacion').children('div.container-fluid').children('div.row').children('div.siniestro_albaran ').children('div.form-group').children('input[name="siniestro_albaran"]').val(siniestro.albaran);
                },
                error: function(jQxhr, textStatus, errorThrown){
                    alerta('Error en proveedor', 'no ha sido posible marcar como facturado el siniestro');
                    siniestro.albaran = null;
                }
            });
            $(this).siblings('button.btn-accion-cancelar').click();
        }
    }
    
    function facturacion_cancelar_click() {
        edicion = false;
        componentes.botonera.acciones.slideUp();
    }
    
    function cobrar_click() {
        if (!edicion) {
            if (confirm('Se cambiara el estado del siniestro a cobrado de forma permanente')) {
                $.ajax({
                    url: 'http://localhost:8080/ReForms_Provider/wr/siniestro/cobrarSiniestro/' + siniestro.id,
                    dataType: 'json',
                    type: 'put',
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify(siniestro),
                    processData: false,
                    success: function(data, textStatus, jQxhr){
                        $.get('http://localhost:8080/ReForms_Provider/wr/siniestro/consultarEstado/' + siniestro.id, respuesta_consultarEstado, 'text');
                    },
                    error: function(jQxhr, textStatus, errorThrown){
                        alerta('Error en proveedor', 'no ha sido posible marcar como cobrado el siniestro');
                    }
                });
            }
        }
    }
    
    function volver_click() {
        $('#btn-siniestros').click();
    }
    
    function ocultable_click() {
        if (!edicion) {
            if ($(this).parent('div.ocultable').filter('.siniestro').length == 1) {
                if ($(this).siblings('div.ocultable-contenido').is(':visible')) {
                    componentes.siniestro.estado.fadeIn();
                } else {
                    componentes.siniestro.estado.fadeOut();
                }
            } else {
                componentes.siniestro.estado.fadeIn();
            }
            $(this).siblings('.ocultable-contenido').slideToggle();
            $(this).parent('.ocultable').siblings('.ocultable').children('.ocultable-contenido').slideUp();
        }
    }
    
    function contacto_click() {
        if (!edicion) {
            if (contactos.contactoSeleccionado == null || contactos.contactoSeleccionado.id != contactos.listaContactos[$(this).index()].id) {
                contactos.posicionSeleccionado = $(this).index();
                contactos.contactoSeleccionado = contactos.listaContactos[contactos.posicionSeleccionado];
                $(this).css('background-color', colorFondo);
                $(this).siblings('tr.contacto').css('background-color', sinColor);
            } else {
                contactos.posicionSeleccionado = -1;
                contactos.contactoSeleccionado = null;
                $(this).css('background-color', sinColor);
            }
            actualizar_detalles_contacto();
        }
    }
    
    function contacto_nuevo_click() {
        if (!edicion) {
            contactos.posicionSeleccionado = -1;
            contactos.contactoSeleccionado = new Contacto();
            actualizar_detalles_contacto();
            componentes.contactos.botones.children('button[name="siniestro_contacto_editar"]').click();
        }
    }
    
    function contacto_editar_click() {
        var nombre = componentes.contactos.entradas.children('input[name="siniestro_contacto_nombre"]'),
            telefono1 = componentes.contactos.entradas.children('div.input-group').children('input[name="siniestro_contacto_telefono1"]'),
            observaciones = componentes.contactos.entradas.children('textarea[name="siniestro_contacto_observaciones"]');
        if (!edicion) {
            edicion = true;
            componentes.contactos.botones.children('button[name="siniestro_contacto_editar"]').hide();
            componentes.contactos.botones.children('button[name="siniestro_contacto_aceptar"]').show();
            componentes.contactos.botones.children('button[name="siniestro_contacto_cancelar"]').show();
            componentes.contactos.botones.children('button[name="siniestro_contacto_borrar"]').hide();
            componentes.contactos.tabla.children('button[name="siniestro_contacto_nuevo"]').prop('disabled', true);
            componentes.contactos.detalles.find('input').prop('readonly', false);
            observaciones.prop('readonly', false);
            if (telefono1.val() == '') {
                telefono1.focus();
            } else if (nombre.val() == '') {
                nombre.focus();
            } else {
                observaciones.focus();
            }
        }
    }
    
    function contacto_aceptar_click() {
        var nombre = componentes.contactos.entradas.children('input[name="siniestro_contacto_nombre"]'),
            apellido1 = componentes.contactos.entradas.children('div.input-group').children('input[name="siniestro_contacto_apellido1"]'),
            apellido2 = componentes.contactos.entradas.children('div.input-group').children('input[name="siniestro_contacto_apellido2"]'),
            telefono1 = componentes.contactos.entradas.children('div.input-group').children('input[name="siniestro_contacto_telefono1"]'),
            telefono2 = componentes.contactos.entradas.children('div.input-group').children('input[name="siniestro_contacto_telefono2"]'),
            observaciones = componentes.contactos.entradas.children('textarea[name="siniestro_contacto_observaciones"]'),
            t1 = false, t2 = false;
        if (telefono1.val() != '' && telefono_valido(telefono1.val())) {
            t1 = true;
        }
        if (telefono2.val() == '' || telefono_valido(telefono2.val())) {
            t2 = true;
        }
        if (t1 && t2) {
            var temporal = new Contacto();
            temporal.id = contactos.contactoSeleccionado.id;
            temporal.nombre = nombre.val() == '' ? null : nombre.val();
            temporal.apellido1 = apellido1.val() == '' ? null : apellido1.val();
            temporal.apellido2 = apellido2.val() == '' ? null : apellido2.val();
            temporal.telefono1 = telefono1.val();
            temporal.telefono2 = telefono2.val() == '' ? null : telefono2.val();
            temporal.observaciones = observaciones.val() == '' ? null : observaciones.val();
            temporal.siniestro = siniestro;
            if (temporal.id == null) {
                $.ajax({
                    url: 'http://localhost:8080/ReForms_Provider/wr/contacto/agregarContacto',
                    dataType: 'json',
                    type: 'post',
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify(temporal),
                    processData: false,
                    success: function(data, textStatus, jQxhr){
                        contactos.posicionSeleccionado = -1;
                        contactos.contactoSeleccionado = null;
                        actualizar_detalles_contacto();
                        $.get('http://localhost:8080/ReForms_Provider/wr/contacto/obtenerContactos/' + siniestro.id, respuesta_obtenerContactos, 'json');
                    },
                    error: function(jQxhr, textStatus, errorThrown){
                        alerta('Error en proveedor', 'no ha sido posible agregar el contacto');
                    }
                });
            } else {
                $.ajax({
                    url: 'http://localhost:8080/ReForms_Provider/wr/contacto/actualizarContacto/' + temporal.id,
                    dataType: 'json',
                    type: 'put',
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify(temporal),
                    processData: false,
                    success: function(data, textStatus, jQxhr){
                        contactos.listaContactos[contactos.posicionSeleccionado] = temporal;
                        contactos.contactoSeleccionado = temporal;
                        actualizar_detalles_contacto();
                        mostrar_contactos(contactos.listaContactos, componentes.contactos.tabla.children('table').children('tbody'));
                        componentes.contactos.tabla.children('table').children('tbody').children('tr.contacto').eq(contactos.posicionSeleccionado).css('background-color', colorFondo);
                    },
                    error: function(jQxhr, textStatus, errorThrown){
                        alerta('Error en proveedor', 'no ha sido posible actualizar el contacto');
                    }
                });
            }
            componentes.contactos.botones.children('button[name="siniestro_contacto_cancelar"]').click();
        } else {
            alerta('Error en los datos', 'introduzca un telefono valido');
            if (!t1) {
                telefono1.focus();
            } else {
                telefono2.focus();
            }
        }
    }
    
    function contacto_cancelar_click() {
        edicion = false;
        componentes.contactos.botones.children('button[name="siniestro_contacto_cancelar"]').hide();
        componentes.contactos.botones.children('button[name="siniestro_contacto_aceptar"]').prop('disabled', false).hide();
        componentes.contactos.botones.children('button[name="siniestro_contacto_editar"]').show();
        componentes.contactos.botones.children('button[name="siniestro_contacto_borrar"]').show();
        componentes.contactos.tabla.children('button[name="siniestro_contacto_nuevo"]').prop('disabled', false);
        componentes.contactos.detalles.find('input').prop('readonly', true);
        componentes.contactos.detalles.find('textarea').prop('readonly', true);
        if (contactos.contactoSeleccionado.id == null) {
            componentes.contactos.detalles.hide();
        } else {
            actualizar_detalles_contacto();
        }
    }
    
    function contacto_borrar_click() {
        if (!edicion) {
            if (confirm('el contacto se eliminara permanentemente')) {
                $.ajax({
                    url: 'http://localhost:8080/ReForms_Provider/wr/contacto/borrarContacto/' + contactos.contactoSeleccionado.id,
                    type: 'delete',
                    contentType: 'application/json;charset=UTF-8',
                    success: function(data, textStatus, jQxhr){
                        contactos.posicionSeleccionado = -1;
                        contactos.contactoSeleccionado = null;
                        actualizar_detalles_contacto();
                        $.get('http://localhost:8080/ReForms_Provider/wr/contacto/obtenerContactos/' + siniestro.id, respuesta_obtenerContactos, 'json');
                        $.get('http://localhost:8080/ReForms_Provider/wr/llamada/obtenerEventos/' + siniestro.id, respuesta_obtenerEventos, 'json');
                    },
                    error: function(jqXhr, textStatus, errorThrown){
                        alerta('Error en proveedor', 'no ha sido posible borrar el contacto');
                    }
                });
            }
        }
    }

    function participante_agregar_click() {
        if (!edicion) {
            var i, tfoot = componentes.adicional.participantes.elemento.children('table').children('tfoot'),
                boton_vecino = componentes.adicional.recursos.tabla.children('button[name="recurso_nuevo"]'),
                select = '<tr><td><div class="container mt-3"><div class="input-group mb-3"><select class="form-control form custom-select">', opciones = '',
                botones = '</select><div class="input-group-append"><button class="btn btn-aceptar-sm" type="button">&radic;</button><button class="btn btn-cancelar-sm" type="button">&Chi;</button></div></div></div></td></tr>';
            tfoot.children('tr').remove();
            $.get('http://localhost:8080/ReForms_Provider/wr/multiservicios/obtenerMultiserviciosDisponibles/' + siniestro.id, function(data, status) {
                if (status == 'success') {
                    edicion = true;
                    adicional.participantes.multiserviciosDisponibles = data;
                    if (adicional.participantes.multiserviciosDisponibles.length > 0) {
                        opciones = '<option value=0 selected>' + adicional.participantes.multiserviciosDisponibles[0].nombre + '</option>';
                        for (i = 1; i < adicional.participantes.multiserviciosDisponibles.length; i++) {
                            opciones += '<option value=' + i + '>' + adicional.participantes.multiserviciosDisponibles[i].nombre + '</option>';
                        }
                        opciones += '<option value=-1>Agregar nueva</option>';
                    } else {
                        opciones = '<option value=-1 selected>Agregar nueva</option>';
                    }
                    tfoot.append(select + opciones + botones);
                    tfoot.find('button.btn-aceptar-sm').click(participante_aceptar_click);
                    tfoot.find('button.btn-cancelar-sm').click(participante_cancelar_click);
                    tfoot.find('select').focus();
                    componentes.adicional.participantes.nuevo.hide();
                    boton_vecino.prop('disabled', true);
                } else {
                    alert('fallo en el proveedor');
                }
            }, 'json');
        }
    }
    
    function participante_aceptar_click() {
        var select = $(this).parent('div.input-group-append').siblings('select'),
            tfoot = componentes.adicional.participantes.elemento.children('table').children('tfoot'),
            cancelar = $(this).siblings('button.btn-cancelar-sm');
        if (select.val() > -1) {
            var p = new Participante();
            p.multiservicios = adicional.participantes.multiserviciosDisponibles[select.val()];
            p.siniestro = siniestro;
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/participante/agregarParticipante',
                dataType: 'json',
                type: 'post',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(p),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    $.get('http://localhost:8080/ReForms_Provider/wr/participante/obtenerParticipantes/' + siniestro.id, respuesta_obtenerParticipantes, 'json');
                    cancelar.click();
                },
                error: function(jQxhr, textStatus, errorThrown){
                    alerta('Error en proveedor', 'no ha sido posible agregar el participante');
                }
            });
        } else {
            componentes.adicional.participantes.participante.show();
            tfoot.children('tr').hide();
        }
    }
    
    function participante_cancelar_click() {
        var tfoot = componentes.adicional.participantes.elemento.children('table').children('tfoot'),
            boton_vecino = componentes.adicional.recursos.tabla.children('button[name="recurso_nuevo"]');
        edicion = false;
        tfoot.children('tr').remove();
        componentes.adicional.participantes.nuevo.show();
        boton_vecino.prop('disabled', false);
    }
    
    function participante_borrar_click() {
        var tr = $(this).parent('td').parent('tr.participante'),
            tbody = componentes.adicional.participantes.elemento.children('table').children('tbody'),
            participante = adicional.participantes.listaParticipantes[tr.index()];
        if (confirm(participante.multiservicios.nombre + ' dejara de participar en el siniestro')) {
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/participante/borrarParticipante/' + participante.id,
                type: 'delete',
                contentType: 'application/json;charset=UTF-8',
                success: function(data, textStatus, jQxhr){
                    adicional.participantes.multiserviciosDisponibles.push(participante);
                    adicional.participantes.listaParticipantes.splice(tr.index(), 1);
                    mostrar_participantes(adicional.participantes.listaParticipantes, tbody);
                },
                error: function(jqXhr, textStatus, errorThrown){
                    alerta('Error en proveedor', 'no ha sido posible borrar el participante');
                }
            });
        }
    }
    
    function adicional_participante_aceptar_click() {
        var cancelar = componentes.adicional.participantes.botones.children('button[name="adicional_participante_cancelar"]'),
            entradas = componentes.adicional.participantes.elemento.children('div.participante').children('div.contenedor').children('div.row').children('div.col-12').children('div.form-group'),
            nombre = entradas.children('input[name="adicional_participante_nombre"]'),
            telefono1 = entradas.children('div.input-group').children('input[name="adicional_participante_telefono1"]'),
            telefono2 = entradas.children('div.input-group').children('input[name="adicional_participante_telefono2"]'),
            fax = entradas.children('input[name="adicional_participante_fax"]'),
            email = entradas.children('input[name="adicional_participante_email"]'),
            p = new Participante(),
            m = new Multiservicios(),
            nombreOk = true, telefonosOk = true, faxOk = true, emailOk = true;
        if (nombre.val() != '') {
            m.nombre = nombre.val();
        } else {
            nombreOk = false;
        }
        if (telefono1.val() != '') {
            if (telefono_valido(telefono1.val())) {
                m.telefono1 = telefono1.val();
            } else {
                telefonosOk = false;
            }
        }
        if (telefono2.val() != '') {
            if (telefono_valido(telefono2.val())) {
                if (m.telefono1 == null) {
                    m.telefono1 = telefono2.val();
                } else {
                    m.telefono2 = telefono2.val();
                }
            } else {
                telefonosOk = false;
            }
        }
        if (fax.val() != '') {
            if (telefono_valido(fax.val())) {
                m.fax = fax.val();
            } else {
                faxOk = false;
            }
        }
        if (email.val() != '') {
            if (email.prop('validity').valid) {
                m.email = email.val();
            } else {
                emailOk = false;
            }
        }
        if (nombreOk && telefonosOk && faxOk && emailOk) {
            p.siniestro = siniestro;
            p.multiservicios = m;
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/participante/agregarParticipante',
                dataType: 'json',
                type: 'post',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(p),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    $.get('http://localhost:8080/ReForms_Provider/wr/participante/obtenerParticipantes/' + siniestro.id, respuesta_obtenerParticipantes, 'json');
                    cancelar.click();
                },
                error: function(jQxhr, textStatus, errorThrown){
                    alerta('Error en proveedor', 'no ha sido posible agregar el participante');
                }
            });
        } else if (!nombreOk) {
            alerta('Error en los datos', 'debe introducir un nombre para la multiservicios participante');
            nombre.focus();
        } else if (!telefonosOk) {
            alerta('Error en los datos', 'revise los numeros de telefono de la multiservicios participante');
            if (telefono1.val() == '' || !telefono_valido(telefono1.val())) {
                telefono1.focus();
            } else {
                telefono2.focus();
            }
        } else if (!faxOk) {
            alerta('Error en los datos', 'revise el numero de fax de la multiservicios participante');
            fax.focus();
        } else if (!emailOk) {
            alerta('Error en los datos', 'revise el email de la multiservicios participante');
            email.focus();
        }
    }
    
    function adicional_participante_cancelar_click() {
        var boton_cancelar_vecino = componentes.adicional.participantes.elemento.children('table').children('tfoot').children('tr').children('td').children('div.container').children('div.input-group').children('div.input-group-append').children('button.btn-cancelar-sm');
        adicional.participantes.participanteSeleccionado = null;
        actualizar_detalles_participante();
        componentes.adicional.participantes.participante.hide();
        boton_cancelar_vecino.click();
    }
    
    function recurso_click() {
        if (!edicion) {
            if (adicional.recursos.recursoSeleccionado == null || adicional.recursos.recursoSeleccionado.id != adicional.recursos.listaRecursos[$(this).index()].id) {
                adicional.recursos.posicionSeleccionado = $(this).index();
                adicional.recursos.recursoSeleccionado = adicional.recursos.listaRecursos[adicional.recursos.posicionSeleccionado];
                $(this).css('background-color', colorFondo);
                $(this).siblings('tr.recurso').css('background-color', sinColor);
            } else {
                adicional.recursos.posicionSeleccionado = -1;
                adicional.recursos.recursoSeleccionado = null;
                $(this).css('background-color', sinColor);
            }
            actualizar_detalles_recurso();
        }
    }
    
    function recurso_adjuntar_click() {
        if (!edicion) {
            adicional.recursos.posicionSeleccionado = -1;
            adicional.recursos.recursoSeleccionado = new Recurso();
            actualizar_detalles_recurso();
            componentes.adicional.recursos.entrada_tipo.siblings('div.salida').hide();
            componentes.adicional.recursos.entrada_fichero.siblings('div.salida').hide();
            componentes.adicional.recursos.entrada_tipo.show();
            componentes.adicional.recursos.entrada_fichero.show();
            componentes.adicional.recursos.botones.children('button[name="recurso_editar"]').click();
        }
    }
    
    function recurso_editar_click() {
        var textarea = componentes.adicional.recursos.recurso.children('div.contenedor').children('div.descripcion').children('div.texto').children('textarea[name="recurso_descripcion"]');
        if (!edicion) {
            edicion = true;
            textarea.prop('readonly', false);
            componentes.adicional.participantes.nuevo.prop('disabled', true);
            componentes.adicional.recursos.tabla.children('button[name="recurso_nuevo"]').prop('disabled', true);
            if (adicional.recursos.recursoSeleccionado != null && adicional.recursos.recursoSeleccionado.id != null) {
                textarea.focus();
            } else {
                $('#ventana').children('div.container-fluid').children('div.adicional').children('div.ocultable-contenido').children('div.recursos').children('div.recurso').children('div.contenedor').children('div.archivo').children('div.tipo').children('div.form-group').children('div.entrada').children('select[name="recurso_tipo"]').focus();
            }
            componentes.adicional.recursos.botones.children('button[name="recurso_editar"]').hide();
            componentes.adicional.recursos.botones.children('button[name="recurso_aceptar"]').show();
            componentes.adicional.recursos.botones.children('button[name="recurso_cancelar"]').show();
            componentes.adicional.recursos.botones.children('button[name="recurso_borrar"]').hide();
        }
    }
    
    function recurso_aceptar_click() {
        var temporal = new Recurso(),
            tbody = componentes.adicional.recursos.tabla.children('table').children('tbody'),
            tipo = componentes.adicional.recursos.entrada_tipo.children('select[name="recurso_tipo"]'),
            adicional_recurso_contenido = componentes.adicional.recursos.recurso.children('div.contenedor'),
            nombre = adicional_recurso_contenido.children('div.archivo').children('div.fichero').children('div.form-group').children('div.entrada').children('label.recurso_fichero_texto'),
            descripcion = componentes.adicional.recursos.recurso.children('div.contenedor').children('div.descripcion').children('div.texto').children('textarea[name="recurso_descripcion"]');
        if (adicional.recursos.recursoSeleccionado.id != null) {
            temporal.id = adicional.recursos.recursoSeleccionado.id;
            temporal.nombre = adicional.recursos.recursoSeleccionado.nombre;
            temporal.tipo = adicional.recursos.recursoSeleccionado.tipo;
            temporal.descripcion = descripcion.val();
            temporal.fichero = adicional.recursos.recursoSeleccionado.fichero;
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/recurso/actualizarRecurso/' + temporal.id,
                dataType: 'json',
                type: 'put',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(temporal),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    adicional.recursos.listaRecursos[adicional.recursos.posicionSeleccionado] = temporal;
                    adicional.recursos.recursoSeleccionado = temporal;
                    actualizar_detalles_recurso();
                    mostrar_recursos(adicional.recursos.listaRecursos, tbody);
                    tbody.children('tr.recurso').eq(adicional.recursos.posicionSeleccionado).css('background-color', colorFondo);
                    componentes.adicional.recursos.botones.children('button[name="recurso_cancelar"]').click();
                },
                error: function(jQxhr, textStatus, errorThrown){
                    actualizar_detalles_recurso();
                    alerta('Error en proveedor', 'no ha sido posible actualizar el recurso');
                }
            });
        } else {
            var a = new Adjunto();
            temporal.nombre = nombre.text();
            temporal.tipo = tipo.val();
            temporal.descripcion = descripcion.val();
            temporal.fichero = adicional.recursos.temp;
            a.siniestro = siniestro;
            a.recurso = temporal;
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/adjunto/agregarAdjunto',
                dataType: 'json',
                type: 'post',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(a),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    $.get('http://localhost:8080/ReForms_Provider/wr/recurso/obtenerRecursos/' + siniestro.id, respuesta_obtenerRecursos, 'json');
                    componentes.adicional.recursos.botones.children('button[name="recurso_cancelar"]').click();
                },
                error: function(jQxhr, textStatus, errorThrown){
                    alerta('Error en proveedor', 'no ha sido posible agregar el recurso');
                }
            });
        }
    }
    
    function recurso_cancelar_click() {
        edicion = false;
        adicional.recursos.temp = null;
        componentes.adicional.recursos.recurso.children('div.contenedor').children('div.descripcion').children('div.texto').children('textarea[name="recurso_descripcion"]').prop('readonly', true);
        componentes.adicional.participantes.nuevo.prop('disabled', false);
        componentes.adicional.recursos.tabla.children('button[name="recurso_nuevo"]').prop('disabled', false);
        componentes.adicional.recursos.botones.children('button[name="recurso_cancelar"]').hide();
        componentes.adicional.recursos.botones.children('button[name="recurso_aceptar"]').prop('disabled', false).hide();
        componentes.adicional.recursos.botones.children('button[name="recurso_editar"]').show();
        componentes.adicional.recursos.botones.children('button[name="recurso_borrar"]').show();
        componentes.adicional.recursos.entrada_tipo.siblings('div.salida').show();
        componentes.adicional.recursos.entrada_fichero.siblings('div.salida').show();
        componentes.adicional.recursos.entrada_tipo.hide();
        componentes.adicional.recursos.entrada_fichero.hide();
        if (adicional.recursos.recursoSeleccionado.id == null) {
            componentes.adicional.recursos.recurso.hide();
        } else {
            actualizar_detalles_recurso();
        }
    }
    
    function recurso_borrar_click() {
        if (!edicion) {
            if (confirm('el recurso se eliminara permanentemente')) {
                $.ajax({
                    url: 'http://localhost:8080/ReForms_Provider/wr/adjunto/borrarAdjunto/' + adicional.recursos.recursoSeleccionado.id,
                    type: 'delete',
                    contentType: 'application/json;charset=UTF-8',
                    success: function(data, textStatus, jQxhr){
                        adicional.recursos.posicionSeleccionado = -1;
                        adicional.recursos.recursoSeleccionado = null;
                        actualizar_detalles_recurso();
                        $.get('http://localhost:8080/ReForms_Provider/wr/recurso/obtenerRecursos/' + siniestro.id, respuesta_obtenerRecursos, 'json');
                    },
                    error: function(jqXhr, textStatus, errorThrown){
                        alerta('Error en proveedor', 'no ha sido posible borrar el recurso');
                    }
                });
            }
        }
    }
    
    function tarea_click() {
        var tarea = $(this).parent('div.card').parent('div.contenedor').parent('div.tarea'),
            i = tarea.index();
        if (!edicion) {
            if (tareas.tareaSeleccionada != null && tareas.tareaSeleccionada.id == tareas.listaTareas[i].id) {
                tareas.posicionSeleccionada = -1;
                tareas.tareaSeleccionada = null;
                componentes.tareas.seleccionada.footer.slideUp();
                componentes.tareas.seleccionada.header = null;
                componentes.tareas.seleccionada.body = null;
                componentes.tareas.seleccionada.footer = null;
                componentes.tareas.seleccionada.botones = null;
                $(this).css('background-color', colorFondo);
                componentes.tareas.botones.children('button').not('button[name="tarea_nueva"]').hide();
            } else {
                tareas.posicionSeleccionada = i;
                tareas.tareaSeleccionada = tareas.listaTareas[i];
                componentes.tareas.seleccionada.header = $(this);
                componentes.tareas.seleccionada.body = $(this).siblings('div.card-body');
                componentes.tareas.seleccionada.footer = $(this).siblings('div.card-footer');
                componentes.tareas.seleccionada.botones = componentes.tareas.seleccionada.body.children('div.container-fluid').children('div.row').children('div.col-4').children('div.botones');
                tarea.siblings('div.tarea').children('div.contenedor').children('div.card').children('div.card-header').css('background-color', colorFondo);
                if (siniestro.estado < 4) {
                    componentes.tareas.botones.children('button').not('button[name="tarea_ampliar"]').show();
                    if (tareas.tareaSeleccionada.trabajo.cantidadMin && tareas.tareaSeleccionada.trabajo.cantidadMin != null) {
                        componentes.tareas.botones.children('button[name="tarea_ampliar"]').show();
                    } else {
                        componentes.tareas.botones.children('button[name="tarea_ampliar"]').hide();
                    }
                }
                if (tareas.tareaSeleccionada.fechaAmpliacion != null && tareas.tareaSeleccionada.fechaAmpliacion != '') {
                    componentes.tareas.seleccionada.footer.slideDown();
                }
                componentes.tareas.seleccionada.header.parent('div.card').parent('div.contenedor').parent('div.tarea').siblings('div.tarea').children('div.contenedor').children('div.card').children('div.card-footer').slideUp();
                $(this).css('background-color', colorBorde);
            }
        }
    }
    
    function tarea_actualizar_click() {
        if (!edicion) {
            var padre_estado = componentes.tareas.seleccionada.header.children('div.container-fluid').children('div.row').children('div.col-4').children('input.tarea-estado').parent(),
                importe = componentes.tareas.seleccionada.body.children('div.container-fluid').children('div.row').children('div.col-4').children('div').children('div.tarea-importe'),
                opcion;
            edicion = true;
            padre_estado.children('input.tarea-estado').remove();
            padre_estado.append('<select class="tarea-estado form-control custom-select-lg custom-select"></select>');
            opcion = '<option value=' + 0 + '>pendiente</option>';
            padre_estado.children('select.tarea-estado').append(opcion);
            opcion = '<option value=' + 1 + '>en proceso</option>';
            padre_estado.children('select.tarea-estado').append(opcion);
            opcion = '<option value=' + 2 + '>finalizada</option>';
            padre_estado.children('select.tarea-estado').append(opcion);
            opcion = '<option value=' + 3 + '>anulada</option>';
            padre_estado.children('select.tarea-estado').append(opcion);
            padre_estado.children('select.tarea-estado').children('option').eq(tareas.tareaSeleccionada.estado).prop('selected', true);
            componentes.tareas.seleccionada.body.children('div.container-fluid').children('div.row').children('div.col-8').children('textarea.tarea-observaciones').prop('readonly', false);
            if (!(tareas.tareaSeleccionada.trabajo.cantidadMin && tareas.tareaSeleccionada.trabajo.cantidadMin != null)) {
                componentes.tareas.seleccionada.body.children('div.container-fluid').children('div.row').children('div.col-4').children('div.tarea-cantidad').children('input[type="number"]').prop('readonly', false);
                importe.children('input[type="text"]').remove();
                importe.prepend('<input class="form-control" type="number" min="0.0" step="0.01"/>');
                importe.children('input[type="number"]').val(tareas.tareaSeleccionada.importe.toFixed(2));
            }
            componentes.tareas.botones.children('button').not('button[name="tarea_borrar"]').prop('disabled', true);
            componentes.tareas.botones.children('button[name="tarea_borrar"]').hide();
            componentes.tareas.seleccionada.botones.show();
            padre_estado.children('select.tarea-estado').focus();
        }
    }
    
    function tarea_aceptar_click() {
        var estado = componentes.tareas.seleccionada.header.children('div.container-fluid').children('div.row').children('div.col-4').children('select.tarea-estado'),
            observaciones = componentes.tareas.seleccionada.body.children('div.container-fluid').children('div.row').children('div.col-8').children('textarea.tarea-observaciones'),
            cantidad = componentes.tareas.seleccionada.body.children('div.container-fluid').children('div.row').children('div.col-4').children('div.tarea-cantidad').children('input[type="number"]'),
            importe = componentes.tareas.seleccionada.body.children('div.container-fluid').children('div.row').children('div.col-4').children('div').children('div.tarea-importe'),
            oaux = '', caux = false;
        if (tareas.tareaSeleccionada.observaciones && tareas.tareaSeleccionada.observaciones != null) {
            oaux = tareas.tareaSeleccionada.observaciones;
        }
        if (tareas.tareaSeleccionada.trabajo.cantidadMin && tareas.tareaSeleccionada.trabajo.cantidadMin != null) {
            caux = true;
        }
        if (!caux || estado.val() != tareas.tareaSeleccionada.estado || observaciones.val() != oaux) {
            var temporal = new Tarea();
            temporal.id = tareas.tareaSeleccionada.id;
            temporal.estado = Number(estado.val());
            temporal.observaciones = observaciones.val() != '' ? observaciones.val() : null;
            temporal.siniestro = tareas.tareaSeleccionada.siniestro;
            temporal.trabajo = tareas.tareaSeleccionada.trabajo;
            temporal.ampliacion = tareas.tareaSeleccionada.ampliacion ? tareas.tareaSeleccionada.ampliacion : null;
            temporal.fechaAmpliacion = tareas.tareaSeleccionada.fechaAmpliacion ? tareas.tareaSeleccionada.fechaAmpliacion : null;
            if (caux) {
                temporal.cantidad = tareas.tareaSeleccionada.cantidad;
                temporal.importe = tareas.tareaSeleccionada.importe;
            } else {
                temporal.cantidad = cantidad.val();
                temporal.importe = Number(importe.children('input[type="number"]').val());
            }
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/tarea/actualizarTarea/' + temporal.id,
                dataType: 'json',
                type: 'put',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(temporal),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    tareas.tareaSeleccionada = temporal;
                    tareas.listaTareas.splice(tareas.posicionSeleccionada, 1, temporal);
                    componentes.tareas.seleccionada.botones.children('div.row').children('div.col-6').children('button.tarea-cancelar').click();
                    $.get('http://localhost:8080/ReForms_Provider/wr/siniestro/consultarEstado/' + siniestro.id, respuesta_consultarEstado, 'text');
                },
                error: function(jQxhr, textStatus, errorThrown){
                    alerta('Error en proveedor', 'no ha sido posible actualizar la tarea');
                }
            });
        } else {
            componentes.tareas.seleccionada.botones.children('div.row').children('div.col-6').children('button.tarea-cancelar').click();
        }
        
    }
    
    function tarea_cancelar_click() {
        var observaciones = componentes.tareas.seleccionada.body.children('div.container-fluid').children('div.row').children('div.col-8').children('textarea.tarea-observaciones'),
            padre_estado = componentes.tareas.seleccionada.header.children('div.container-fluid').children('div.row').children('div.col-4').children('select.tarea-estado').parent();
        edicion = false;
        if (!(tareas.tareaSeleccionada.trabajo.cantidadMin && tareas.tareaSeleccionada.trabajo.cantidadMin != null)) {
            var importe = componentes.tareas.seleccionada.body.children('div.container-fluid').children('div.row').children('div.col-4').children('div').children('div.tarea-importe');
            componentes.tareas.seleccionada.body.children('div.container-fluid').children('div.row').children('div.col-4').children('div.tarea-cantidad').children('input[type="number"]').prop('readonly', true).val(tareas.tareaSeleccionada.cantidad);
            importe.children('input[type="number"]').remove();
            importe.prepend('<input class="form-control" type="text" readonly/>');
            importe.children('input[type="text"]').val(tareas.tareaSeleccionada.importe.toFixed(2));
        }
        padre_estado.children('select.tarea-estado').remove();
        padre_estado.append('<input class="tarea-estado form-control form-control-lg" type="text" maxlength="10" readonly/>');
        switch (tareas.tareaSeleccionada.estado) {
            case 0: padre_estado.children('input.tarea-estado').val('pendiente'); break;
            case 1: padre_estado.children('input.tarea-estado').val('en proceso'); break;
            case 2: padre_estado.children('input.tarea-estado').val('finalizada'); break;
            case 3: padre_estado.children('input.tarea-estado').val('anulada'); break;
            default: padre_estado.children('input.tarea-estado').val('desconocido'); break;
        }
        observaciones.prop('readonly', true);
        if (tareas.tareaSeleccionada.observaciones && tareas.tareaSeleccionada.observaciones != null) {
            observaciones.val(tareas.tareaSeleccionada.observaciones);
        } else {
            observaciones.val('');
        }
        componentes.tareas.botones.children('button').not('button[name="tarea_borrar"]').prop('disabled', false);
        componentes.tareas.botones.children('button[name="tarea_borrar"]').show();
        componentes.tareas.seleccionada.botones.hide();
    }
    
    function tarea_nueva_click() {
        if (!edicion) {
            if (tareas.tareaSeleccionada != null) {
                componentes.tareas.seleccionada.header.click();
            }
            edicion = true;
            $(this).prop('disabled', true);
            componentes.tareas.lista.children('div.sin-tareas').remove();
            componentes.tareas.lista.append('<div class="tarea-nueva col-xl-6 col-12"></div>');
            componentes.tareas.lista.children('div.tarea-nueva').load('Html/tarea.html', cargar_tarea_nueva);
        }
    }
    
    function tarea_nueva_aceptar_click() {
        var t = new Tarea();
        t.siniestro = siniestro;
        t.trabajo = tareas.trabajos[componentes.tareas.nueva.header.children('div.container-fluid').children('div.row').children('div.col-4').children('select.tarea-codigo').val()];
        t.siniestro.poliza.cliente.aseguradora.logo = null;
        t.siniestro.peritoOriginal.aseguradora.logo = null;
        t.cantidad = componentes.tareas.nueva.body.children('div.container-fluid').children('div.row').children('div.col-4').children('div.tarea-cantidad').children('input[type="number"]').val();
        if (!(t.trabajo.cantidadMin && t.trabajo.cantidadMin != null)) {
            t.importe = componentes.tareas.nueva.body.children('div.container-fluid').children('div.row').children('div.col-4').children('div').children('div.tarea-importe').children('input[type="number"]').val();
        }
        t.observaciones = componentes.tareas.nueva.body.children('div.container-fluid').children('div.row').children('div.col-8').children('textarea.tarea-observaciones').val();
        if (t.observaciones == '') {
            t.observaciones = null;
        }
        $.ajax({
            url: 'http://localhost:8080/ReForms_Provider/wr/tarea/agregarTarea',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(t),
            processData: false,
            success: function(data, textStatus, jQxhr){
                componentes.tareas.nueva.botones.children('div.row').children('div.col-6').children('button.tarea-cancelar').click();
                $.get('http://localhost:8080/ReForms_Provider/wr/tarea/obtenerTareas/' + siniestro.id, respuesta_obtenerTareas, 'json');
            },
            error: function(jQxhr, textStatus, errorThrown){
                alerta('Error en proveedor', 'no ha sido posible agregar la tarea');
            }
        });
    }
    
    function tarea_nueva_cancelar_click() {
        componentes.tareas.lista.children('div.tarea-nueva').remove();
        componentes.tareas.botones.children('button[name="tarea_nueva"]').prop('disabled', false);
        componentes.tareas.nueva.header = null;
        componentes.tareas.nueva.body = null;
        componentes.tareas.nueva.botones = null
        
        
        
        if (tareas.listaTareas.length == 0) {
            componentes.tareas.lista.append('<div class="sin-tareas col-12"><h1>Sin tareas registradas</h1></div>');
            componentes.tareas.lista.children('div.sin-tareas').css({'background-color':colorFondo, 'border-color':colorBorde});
        }
        edicion = false;
    }
    
    function tarea_ampliar_click() {
        alert('tarea_ampliar_click()\n' + componentes.tareas.seleccionada.footer.html());
        componentes.tareas.seleccionada.footer.slideDown();
    }
    
    function tarea_borrar_click() {
        if (!edicion) {
            if (confirm('la tarea se eliminara permanentemente')) {
                $.ajax({
                    url: 'http://localhost:8080/ReForms_Provider/wr/tarea/borrarTarea/' + tareas.tareaSeleccionada.id,
                    type: 'delete',
                    contentType: 'application/json;charset=UTF-8',
                    success: function(data, textStatus, jQxhr){
                        tareas.posicionSeleccionada = -1;
                        tareas.tareaSeleccionada = null;
                        componentes.tareas.botones.children('button[name="tarea_borrar"]').hide();
                        $.get('http://localhost:8080/ReForms_Provider/wr/tarea/obtenerTareas/' + siniestro.id, respuesta_obtenerTareas, 'json');
                    },
                    error: function(jqXhr, textStatus, errorThrown){
                        alerta('Error en proveedor', 'no ha sido posible borrar la tarea');
                    }
                });
            }
        }
    }
    
    function evento_click() {
        if (!edicion) {
            componentes.eventos.tbody.children('tr.llamada').css('background-color', sinColor).removeClass('seleccionada');
            if (eventos.posicionSeleccionada != $(this).index()) {
                eventos.posicionSeleccionada = $(this).index();
                eventos.llamadaSeleccionada = eventos.listaLlamadas[eventos.posicionSeleccionada];
                $(this).css('background-color', colorFondo).addClass('seleccionada');
                componentes.eventos.detalles.load('Html/evento.html', cargar_evento);
                componentes.eventos.detalles.show();
            } else {
                eventos.posicionSeleccionada = -1;
                eventos.llamadaSeleccionada = null;
                componentes.eventos.detalles.hide();
            }
            
        }
    }
    
    function evento_nuevo_click() {
        edicion = true;
        eventos.posicionSeleccionada = -1;
        eventos.llamadaSeleccionada = new Llamada();
        eventos.llamadaSeleccionada.id = -1;
        eventos.llamadaSeleccionada.evento = new Evento();
        componentes.eventos.tbody.children('tr.llamada').css('background-color', sinColor).removeClass('seleccionada');
        componentes.eventos.nuevo.prop('disabled', true);
        componentes.eventos.detalles.load('Html/evento.html', cargar_evento_nuevo);
        componentes.eventos.detalles.show();
    }
    
    function evento_nuevo_aceptar_click() {
        var card = componentes.eventos.detalles.children('div.contenedor').children('div.card'),
            fecha = card.children('div.card-header').children('div.fecha').children('input'),
            descripcion = card.children('div.card-body').children('div.container-fluid').children('div.descripcion').children('div.col-12').children('textarea'),
            id, operador = JSON.parse(sessionStorage.usuario);
        eventos.llamadaSeleccionada.evento.operador = operador[0];
        eventos.llamadaSeleccionada.evento.siniestro = new Siniestro();
        eventos.llamadaSeleccionada.evento.siniestro.id = siniestro.id;
        eventos.llamadaSeleccionada.evento.fecha = new Date(fecha.val());
        eventos.llamadaSeleccionada.evento.descripcion = descripcion.val() != '' ? descripcion.val() : null;
        $.ajax({
            url: 'http://localhost:8080/ReForms_Provider/wr/evento/agregarEvento',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(eventos.llamadaSeleccionada.evento),
            processData: false,
            success: function(data, textStatus, jQxhr){
                if (eventos.llamadaSeleccionada.id == null) {
                    eventos.llamadaSeleccionada.evento = data;
                    if (eventos.llamadaSeleccionada.cliente != null) {
                        id = eventos.llamadaSeleccionada.cliente.id;
                        eventos.llamadaSeleccionada.cliente = new Cliente();
                        eventos.llamadaSeleccionada.cliente.id = id;
                    } else if (eventos.llamadaSeleccionada.perito != null) {
                        id = eventos.llamadaSeleccionada.perito.id;
                        eventos.llamadaSeleccionada.perito = new Perito();
                        eventos.llamadaSeleccionada.perito.id = id;
                    }
                    $.ajax({
                        url: 'http://localhost:8080/ReForms_Provider/wr/llamada/agregarLlamada',
                        dataType: 'json',
                        type: 'post',
                        contentType: 'application/json;charset=UTF-8',
                        data: JSON.stringify(eventos.llamadaSeleccionada),
                        processData: false,
                        success: function(data, textStatus, jQxhr){
                            componentes.eventos.detalles.children('div.contenedor').children('div.card').children('div.card-footer').children('div.container-fluid').children('div.botones').children('div.col-12').children('button.btn-cancelar').click();
                            $.get('http://localhost:8080/ReForms_Provider/wr/llamada/obtenerEventos/' + siniestro.id, respuesta_obtenerEventos, 'json');
                            $.get('http://localhost:8080/ReForms_Provider/wr/contacto/obtenerContactos/' + siniestro.id, respuesta_obtenerContactos, 'json');
                        },
                        error: function(jQxhr, textStatus, errorThrown){
                            alert('fallo en el proveedor');
                        }
                    });
                } else {
                    componentes.eventos.detalles.children('div.contenedor').children('div.card').children('div.card-footer').children('div.container-fluid').children('div.botones').children('div.col-12').children('button.btn-cancelar').click();
                    $.get('http://localhost:8080/ReForms_Provider/wr/llamada/obtenerEventos/' + siniestro.id, respuesta_obtenerEventos, 'json');
                }
            },
            error: function(jQxhr, textStatus, errorThrown){
                alert('fallo en el proveedor');
            }
        });
    }
    
    function evento_nuevo_cancelar_click() {
        edicion = false;
        eventos.posicionSeleccionada = -1;
        eventos.llamadaSeleccionada = null;
        componentes.eventos.nuevo.prop('disabled', false);
        componentes.eventos.detalles.hide();
    }
    
    function icono_agregar_click() {
        if (!$(this).parent('div.input-group-prepend').siblings('button.btn-nuevo').prop('disabled')) {
            $(this).parent('div.input-group-prepend').siblings('button.btn-nuevo').click();
        }
    }
    
    function llamada_agregar_click() {
        var card = componentes.eventos.detalles.children('div.contenedor').children('div.card');
        edicion_llamada = true;
        eventos.agenda.cliente = siniestro.poliza.cliente;
        eventos.agenda.contactos = [];
        eventos.agenda.contactos = contactos.listaContactos;
        $.get('http://localhost:8080/ReForms_Provider/wr/perito/buscarPeritoPorAseguradora/' + siniestro.poliza.cliente.aseguradora.id, function(data, status) {
            if (status == 'success') {
                eventos.agenda.peritos = data;
                $.get('http://localhost:8080/ReForms_Provider/wr/grupo/obtenerGruposPorSiniestro/' + siniestro.id, function(data, status) {
                    if (status == 'success') {
                        var select = componentes.eventos.detalles.children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.nueva').children('div.seleccion').children('div.col-6').children('select.telefonos');
                        eventos.agenda.grupos = data;
                        mostrar_agenda(eventos.agenda, select);
                    } else {
                        eventos.agenda.cliente = null;
                        eventos.agenda.contactos = [];
                        eventos.agenda.peritos = [];
                        eventos.agenda.grupos = [];
                        alert('fallo en el proveedor');
                    }
                }, 'json');
            } else {
                eventos.agenda.cliente = null;
                eventos.agenda.contactos = [];
                eventos.agenda.peritos = [];
                eventos.agenda.grupos = [];
                alert('fallo en el proveedor');
            }
        }, 'json');
        card.children('div.card-header').children('div.fecha').children('input').prop('disabled', true);
        card.children('div.card-body').children('div.container-fluid').children('div.descripcion').children('div.col-12').children('textarea').prop('disabled', true);
        card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.boton, div.detalles').hide();
        card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.nueva').show();
        card.children('div.card-footer').children('div.container-fluid').children('div.botones').children('div.col-12').children('button').prop('disabled', true);
    }
    
    function llamada_aceptar_click() {
        var card = componentes.eventos.detalles.children('div.contenedor').children('div.card'),
            llamada = card.children('div.card-body').children('div.container-fluid').children('div.llamada'),
            telefonos = llamada.children('div.col-12').children('div.nueva').children('div.seleccion').children('div.col-6').children('select.telefonos'),
            tipo = llamada.children('div.col-12').children('div.nueva').children('div.seleccion').children('div.col-6').children('div.input-group').children('select.tipos'),
            detalles = llamada.children('div.col-12').children('div.detalles'),
            textoTelefono = '', textoNombre = '';
        eventos.llamadaSeleccionada.id = null;
        eventos.llamadaSeleccionada.tipo = Number.parseInt(tipo.val());
        eventos.llamadaSeleccionada.cliente = null;
        eventos.llamadaSeleccionada.contacto = null;
        eventos.llamadaSeleccionada.perito = null;
        eventos.llamadaSeleccionada.grupo = null;
        if (telefonos.val() == 'cliente') {
            eventos.llamadaSeleccionada.cliente = eventos.agenda.cliente;
        } else if (telefonos.val() == -1) {
            var conacto = card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.nueva').children('div.contacto').children('div.col-12'),
                nombre = conacto.children('div.nombre').children('div.col-12').children('div.form-group').children('input[name="llamada_contacto_nombre"]'),
                apellido1 = conacto.children('div.apellidos').children('div.col-12').children('div.form-group').children('div.input-group').children('input[name="llamada_contacto_apellido1"]'),
                apellido2 = conacto.children('div.apellidos').children('div.col-12').children('div.form-group').children('div.input-group').children('input[name="llamada_contacto_apellido2"]'),
                telefono1 = conacto.children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input[name="llamada_contacto_telefono1"]'),
                telefono2 = conacto.children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input[name="llamada_contacto_telefono2"]');
            eventos.llamadaSeleccionada.contacto = new Contacto();
            eventos.llamadaSeleccionada.contacto.telefono1 = telefono1.val();
            if (nombre.val() != '') {
                eventos.llamadaSeleccionada.contacto.nombre = nombre.val();
            }
            if (apellido1.val() != '') {
                eventos.llamadaSeleccionada.contacto.apellido1 = apellido1.val();
            }
            if (nombre.val() != '') {
                eventos.llamadaSeleccionada.contacto.apellido2 = apellido2.val();
            }
            if (nombre.val() != '') {
                eventos.llamadaSeleccionada.contacto.telefono2 = telefono2.val();
            }
        } else {
            var t = telefonos.val().slice(0, telefonos.val().indexOf('[')),
                i = Number.parseInt(telefonos.val().slice(telefonos.val().indexOf('[') + 1, telefonos.val().length - 1));
            switch (t) {
                case 'contacto': eventos.llamadaSeleccionada.contacto = eventos.agenda.contactos[i]; break;
                case 'perito': eventos.llamadaSeleccionada.perito = eventos.agenda.peritos[i]; break;
                case 'grupo': eventos.llamadaSeleccionada.grupo = eventos.agenda.grupos[i]; break;
            }
        }
        if (eventos.llamadaSeleccionada.cliente && eventos.llamadaSeleccionada.cliente != null) {
            textoNombre = eventos.llamadaSeleccionada.cliente.nombre + ' ' + eventos.llamadaSeleccionada.cliente.apellido1;
            if (eventos.llamadaSeleccionada.cliente.apellido2 && eventos.llamadaSeleccionada.cliente.apellido2 != null && eventos.llamadaSeleccionada.cliente.apellido2 != '') {
                textoNombre += ' ' + eventos.llamadaSeleccionada.cliente.apellido2;
            }
            textoTelefono = eventos.llamadaSeleccionada.cliente.telefono1;
            if (eventos.llamadaSeleccionada.cliente.telefono2 && eventos.llamadaSeleccionada.cliente.telefono2 != null && eventos.llamadaSeleccionada.cliente.telefono2 != '') {
                textoTelefono += ' / ' + eventos.llamadaSeleccionada.cliente.telefono2
            }
        } else if (eventos.llamadaSeleccionada.contacto && eventos.llamadaSeleccionada.contacto != null) {
            if (eventos.llamadaSeleccionada.contacto.nombre && eventos.llamadaSeleccionada.contacto.nombre != null && eventos.llamadaSeleccionada.contacto.nombre != '') {
                textoNombre += eventos.llamadaSeleccionada.contacto.nombre + ' ';
            }
            if (eventos.llamadaSeleccionada.contacto.apellido1 && eventos.llamadaSeleccionada.contacto.apellido1 != null && eventos.llamadaSeleccionada.contacto.apellido1 != '') {
                textoNombre += eventos.llamadaSeleccionada.contacto.apellido1 + ' ';
            }
            if (eventos.llamadaSeleccionada.contacto.apellido2 && eventos.llamadaSeleccionada.contacto.apellido2 != null && eventos.llamadaSeleccionada.contacto.apellido2 != '') {
                textoNombre += eventos.llamadaSeleccionada.contacto.apellido2;
            }
            textoTelefono = eventos.llamadaSeleccionada.contacto.telefono1;
            if (eventos.llamadaSeleccionada.contacto.telefono2 && eventos.llamadaSeleccionada.contacto.telefono2 != null && eventos.llamadaSeleccionada.contacto.telefono2 != '') {
                textoTelefono += ' / ' + eventos.llamadaSeleccionada.contacto.telefono2
            }
        } else if (eventos.llamadaSeleccionada.perito && eventos.llamadaSeleccionada.perito != null) {
            textoNombre = eventos.llamadaSeleccionada.perito.nombre + ' ' + eventos.llamadaSeleccionada.perito.apellido1;
            textoTelefono = eventos.llamadaSeleccionada.perito.telefono1;
            if (eventos.llamadaSeleccionada.perito.telefono2 && eventos.llamadaSeleccionada.perito.telefono2 != null && eventos.llamadaSeleccionada.perito.telefono2 != '') {
                textoTelefono += ' / ' + eventos.llamadaSeleccionada.perito.telefono2;
            }
        } else if (eventos.llamadaSeleccionada.grupo && eventos.llamadaSeleccionada.grupo != null) {
            if (eventos.llamadaSeleccionada.grupo.observaciones && eventos.llamadaSeleccionada.grupo.observaciones != null && eventos.llamadaSeleccionada.grupo.observaciones != '') {
                var fecha = eventos.llamadaSeleccionada.grupo.observaciones.slice(1, eventos.llamadaSeleccionada.grupo.observaciones.indexOf(']'));
                fecha = new Date (new Number(fecha));
                textoNombre = eventos.llamadaSeleccionada.grupo.observaciones.slice(eventos.llamadaSeleccionada.grupo.observaciones.indexOf(']') + 2, eventos.llamadaSeleccionada.grupo.observaciones.length);
                textoTelefono = '[Jor. ' + (fecha.getDate() > 9 ? fecha.getDate() : '0' + fecha.getDate()) + '/' + (fecha.getMonth() > 8 ? fecha.getMonth() + 1 : '0' + (fecha.getMonth() + 1)) + '/' + fecha.getFullYear() + ']';
            }
        }
        detalles.children('div.input-group').children('div.input-group-prepend').children('span.numero').html(textoTelefono);
        detalles.children('div.input-group').children('span.nombre').html(textoNombre);
        detalles.children('div.input-group').children('div.input-group-append').children('span.tipo').html(generar_icono_llamada(eventos.llamadaSeleccionada.tipo));
        edicion_llamada = false;
        card.children('div.card-header').children('div.fecha').children('input').prop('disabled', false);
        card.children('div.card-body').children('div.container-fluid').children('div.descripcion').children('div.col-12').children('textarea').prop('disabled', false);
        card.children('div.card-footer').children('div.container-fluid').children('div.botones').children('div.col-12').children('button').prop('disabled', false);
        detalles.children('div.input-group').children('div.input-group-append').children('span.tipo').html(generar_icono_llamada(eventos.llamadaSeleccionada.tipo));
        card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.boton, div.nueva').hide();
        detalles.show();
    }
    
    function llamada_cancelar_click() {
        var card = componentes.eventos.detalles.children('div.contenedor').children('div.card');
        edicion_llamada = false;
        card.children('div.card-header').children('div.fecha').children('input').prop('disabled', false);
        card.children('div.card-body').children('div.container-fluid').children('div.descripcion').children('div.col-12').children('textarea').prop('disabled', false);
        card.children('div.card-footer').children('div.container-fluid').children('div.botones').children('div.col-12').children('button').prop('disabled', false);
        card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.nueva, div.detalles').hide();
        card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.boton').show();
    }
    
    function cita_agregar_click() {
        if (!edicion_llamada) {
            var card = componentes.eventos.detalles.children('div.contenedor').children('div.card'),
                fecha = card.children('div.card-header').children('div.fecha').children('input'),
                descripcion = card.children('div.card-body').children('div.container-fluid').children('div.descripcion').children('div.col-12').children('textarea'),
                id, operador = JSON.parse(sessionStorage.usuario);
            eventos.llamadaSeleccionada.evento.operador = operador[0];
            eventos.llamadaSeleccionada.evento.siniestro = new Siniestro();
            eventos.llamadaSeleccionada.evento.siniestro.id = siniestro.id;
            eventos.llamadaSeleccionada.evento.fecha = new Date(fecha.val());
            eventos.llamadaSeleccionada.evento.descripcion = descripcion.val() != '' ? descripcion.val() : null;
            sessionStorage.setItem('llamada', JSON.stringify(eventos.llamadaSeleccionada));
            $('#contenido').load('Html/jornadas.html', function(responseTxt, statusTxt) {
                if (statusTxt !== 'success') {
                    sessionStorage.removeItem('llamada');
                    alert('no se ha podido cargar jornadas.html');
                }
            });
        }
    }
    
    function accion_fecha_nueva_change() {
        var aceptar = componentes.botonera.acciones.children('div.contenedor').children('div.accion').children('div.container-fluid').children('div.row').children('div.botones').children('button.btn-accion-aceptar');
        if ($(this).val() != '') {
            var fn = new Date($(this).val()),
                fa = new Date(siniestro.fechaRegistro.substring(0, siniestro.fechaRegistro.indexOf('T')));
            if (fn > fa) {
                aceptar.prop('disabled', false);
            } else {
                aceptar.prop('disabled', true);
                alerta('Fecha de replanificacion invalida', 'la fecha de replanificacion debe ser porterior a la fecha actual del sineistro');
            }
        } else {
            aceptar.prop('disabled', true);
        }
    }
    
    function accion_perito_nuevo_change() {
        var aceptar = componentes.botonera.acciones.children('div.contenedor').children('div.accion').children('div.container-fluid').children('div.row').children('div.botones').children('button.btn-accion-aceptar');
        if ($(this).val() != -1) {
            aceptar.prop('disabled', false);
        } else {
            aceptar.prop('disabled', true);
        }
    }
    
    function accion_albaran_change() {
        if ($(this).val() == '' || $(this).val() < 1) {
            componentes.botonera.acciones.children('div.contenedor').children('div.accion').children('div.container-fluid').children('div.row').children('div.botones').children('button.btn-accion-aceptar').prop('disabled', true);
        } else {
            componentes.botonera.acciones.children('div.contenedor').children('div.accion').children('div.container-fluid').children('div.row').children('div.botones').children('button.btn-accion-aceptar').prop('disabled', false);
        }
    }
    
    function recurso_tipo_change() {
        var adicional_recurso_contenido = componentes.adicional.recursos.recurso.children('div.contenedor'),
            fichero = componentes.adicional.recursos.entrada_fichero.children('input[name="recurso_fichero"]');
        componentes.adicional.recursos.previsualizacion.children('div.contenedor').children('div.vista-previa').remove();
        componentes.adicional.recursos.previsualizacion.hide();
        if ($(this).val() == 2) {
            adicional_recurso_contenido.children('div.descripcion').children('div.texto').removeClass('col-4').addClass('col-12').prop('rows', 4);
            fichero.prop('accept', '');
        } else {
            adicional_recurso_contenido.children('div.descripcion').children('div.texto').removeClass('col-12').addClass('col-4').prop('rows', 12);
            if ($(this).val() == 0) {
                fichero.prop('accept', 'application/pdf');
            } else {
               fichero.prop('accept', 'image/jpeg');
            }
        }
        adicional.recursos.temp = null;
        fichero.val('');
        adicional_recurso_contenido.children('div.archivo').children('div.fichero').children('div.form-group').children('div.entrada').children('label.recurso_fichero_texto').text('Examinar . . .');
    }
    
    function recurso_fichero_change() {
        var adicional_recurso_contenido = componentes.adicional.recursos.recurso.children('div.contenedor'),
            tipo = componentes.adicional.recursos.entrada_tipo.children('select[name="recurso_tipo"]'),
            label = adicional_recurso_contenido.children('div.archivo').children('div.fichero').children('div.form-group').children('div.entrada').children('label.recurso_fichero_texto'),
            entradas = this.files,
            lector = new FileReader(),
            nombre = $(this).val(), extension;
        while (nombre.indexOf('\\') != -1) {
            nombre = nombre.slice(nombre.indexOf('\\') + 1, nombre.length);
        }
        extension = nombre.toString();
        while (extension.indexOf('.') != -1) {
            extension = extension.slice(extension.indexOf('.') + 1, extension.length);
        }
        lector.onloadend = function (e) {
            adicional.recursos.temp = e.target.result.split('base64,')[1];
            componentes.adicional.recursos.previsualizacion.children('div.contenedor').children('div.vista-previa').remove();
            
            var test = '' + adicional.recursos.temp;
            if (test.length <= 16777215) {
                if (tipo.val() == 0) {
                    if (extension.toLowerCase() == 'pdf') {
                        var pdf = '<iframe src="data:application/pdf;base64,' + adicional.recursos.temp + '"></iframe>'; 
                        componentes.adicional.recursos.previsualizacion.children('div.contenedor').append('<div class="vista-previa">' + pdf + '</div>');
                        label.text(nombre);
                        componentes.adicional.recursos.previsualizacion.show();
                    } else {
                        adicional.recursos.temp = null;
                        label.text('Examinar . . .');
                        componentes.adicional.recursos.previsualizacion.hide();
                        alerta('Tipo de fichero invalido', 'debe seleccionar un fichero .pdf');
                    }
                } else if (tipo.val() == 1) {
                    if (extension.toLowerCase() == 'jpg' || extension.toLowerCase() == 'jpeg') {
                        var img = '<img src="data:image/jpeg;base64,' + adicional.recursos.temp + '" alt="error al cargar imagen"/>';
                        componentes.adicional.recursos.previsualizacion.children('div.contenedor').append('<div class="vista-previa">' + img + '</div>');
                        label.text(nombre);
                        componentes.adicional.recursos.previsualizacion.show();
                    } else {
                        adicional.recursos.temp = null;
                        label.text('Examinar . . .');
                        componentes.adicional.recursos.previsualizacion.hide();
                        alerta('Tipo de fichero invalido', 'debe seleccionar un fichero .jpg / .jpeg');
                    }
                } else {
                    label.text(nombre);
                    componentes.adicional.recursos.previsualizacion.hide();
                }
            } else {
                adicional.recursos.temp = null;
                label.text('Examinar . . .');
                componentes.adicional.recursos.previsualizacion.hide();
                alerta('Tamaño de fichero invalido', 'debe seleccionar un fichero de tamaño no superior a 16Mb');
            }
        };
        lector.readAsDataURL(entradas[0]);
    }
    
    function tarea_gremio_change() {
        if ($(this).val() != null && tareas.gremios.length > 0) {
            var aseguradora = siniestro.poliza.cliente.aseguradora.id,
                gremio = tareas.gremios[$(this).val()].id,
                codigo = $(this).parent('div.col-4').siblings('div.col-4').children('select.tarea-codigo');
            $.get('http://localhost:8080/ReForms_Provider/wr/trabajo/obtenerTrabajosPorGremio/' + aseguradora + '/' + gremio, function (data, status) {
                if (status == 'success') {
                    var i, j, existe, opcion;
                    tareas.trabajos = data;
                    codigo.children('option').remove();
                    for (i = 0; i < tareas.trabajos.length; i++) {
                        existe = false;
                        j = 0;
                        while (!existe && j < tareas.listaTareas.length) {
                            if (tareas.trabajos[i].id == tareas.listaTareas[j].trabajo.id) {
                                existe = true;
                            }
                            j++;
                        }
                        if (!existe) {
                            opcion = '<option value=' + i + '>' + tareas.trabajos[i].codigo + '</option>';
                            codigo.append(opcion);
                        }
                    }
                    if (codigo.children('option').length == 0) {
                        alerta('Sin trabajos', 'no hay trabajos registrados para este gremio con la aseguradora actual');
                    } else {
                        codigo.children('option').eq(0).prop('selected', true);
                    }
                    codigo.change();
                } else {
                    alert('fallo en el proveedor');
                }
            }, 'json');
        }
    }
    
    function tarea_codigo_change() {
        var cantidad = componentes.tareas.nueva.body.children('div.container-fluid').children('div.row').children('div.col-4').children('div.tarea-cantidad'),
            cantidad_valor = cantidad.children('input[type="number"]'),
            cantidad_unidad = cantidad.children('div.input-group-append').children('span.input-group-text'),
            importe = componentes.tareas.nueva.body.children('div.container-fluid').children('div.row').children('div.col-4').children('div').children('div.tarea-importe'),
            descripcion = componentes.tareas.nueva.body.children('div.container-fluid').children('div.row').children('div.col-8').children('input.tarea-descripcion');
        if ($(this).val() != null && tareas.trabajos.length > 0) {
            var i = $(this).val();
            descripcion.val(tareas.trabajos[i].descripcion);
            switch (tareas.trabajos[i].medida) {
                case 0: cantidad_unidad.html('uds.'); break;
                case 1: cantidad_unidad.html('m'); break;
                case 2: cantidad_unidad.html('m<sup>2</sup>'); break;
                case 3: cantidad_unidad.html('m<sup>3</sup>'); break;
                case 4: cantidad_unidad.html('h'); break;
                case 5: cantidad_unidad.html('km'); break;
                default: cantidad_unidad.html('');
            }
            importe.children('input').remove();
            if (tareas.trabajos[i].cantidadMin && tareas.trabajos[i].cantidadMin != null) {
                importe.prepend('<input class="form-control" type="text" readonly/>');
            } else {
                importe.prepend('<input class="form-control" type="number" min="0.0" step="0.01" val="0.0"/>');
            }
        } else {
            descripcion.val('');
            cantidad_unidad.html('');
        }
        cantidad_valor.val('').keyup();
        cantidad_valor.focus();
    }
    
    function llamada_telefonos_change() {
        var nueva = componentes.eventos.detalles.children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.nueva');
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
    
    function siniestro_contacto_telefono1_keyup() {
        if ($(this).val() != '' && telefono_valido($(this).val())) {
            componentes.contactos.botones.children('button[name="siniestro_contacto_aceptar"]').prop('disabled', false);
        } else {
            componentes.contactos.botones.children('button[name="siniestro_contacto_aceptar"]').prop('disabled', true);
        }
    }
    
    function siniestro_llamada_telefono1_keyup() {
        var aceptar = componentes.eventos.detalles.children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.nueva').children('div.botones').children('div.col-12').children('button.btn-aceptar');
        aceptar.prop('disabled', !($(this).val() != '' && telefono_valido($(this).val())));
    }
    
    function tarea_cantidad_keyup() {
        var importe = componentes.tareas.nueva.body.children('div.container-fluid').children('div.row').children('div.col-4').children('div').children('div.tarea-importe'),
            codigo = componentes.tareas.nueva.header.children('div.container-fluid').children('div.row').children('div.col-4').children('select.tarea-codigo');
        if (codigo.val() != null) {
            if (tareas.trabajos[codigo.val()].cantidadMin && tareas.trabajos[codigo.val()].cantidadMin != null) {
                if ($(this).val() != '' && $(this).val() > 0) {
                    componentes.tareas.nueva.botones.children('div.row').children('div.col-6').children('button.tarea-aceptar').prop('disabled', false);
                    importe.children('input[type="text"]').val(calcular_importe($(this).val(), tareas.trabajos[codigo.val()]).toFixed(2));
                } else {
                    componentes.tareas.nueva.botones.children('div.row').children('div.col-6').children('button.tarea-aceptar').prop('disabled', true);
                    importe.children('input[type="text"]').val('');
                }
            } else {
                if ($(this).val() != '' && $(this).val() > 0) {
                    componentes.tareas.nueva.botones.children('div.row').children('div.col-6').children('button.tarea-aceptar').prop('disabled', false);
                } else {
                    componentes.tareas.nueva.botones.children('div.row').children('div.col-6').children('button.tarea-aceptar').prop('disabled', true);
                }
            }
        } else {
            componentes.tareas.nueva.botones.children('div.row').children('div.col-6').children('button.tarea-aceptar').prop('disabled', true);
            importe.children('input').val('');
        }
    }
    
    // Funciones para cargar paginas y controlar respuestas del proveedor
    // ====================================================================== //
    function cargar_poliza(responseTxt, statusTxt) {
        if (statusTxt != 'success') {
            alerta('Error 404', 'no se pudo cargar poliza.html');
            sessionStorage.removeItem('vuelta');
            sessionStorage.removeItem('poliza');
        }
    }
    
    function cargar_replanificacion(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var row = componentes.botonera.acciones.children('div.contenedor').children('div.accion').children('div.container-fluid').children('div.row');
            edicion = true;
            row.children('div.botones').children('button.btn-accion-aceptar').prop('disabled', true).click(replanificacion_aceptar_click);
            row.children('div.botones').children('button.btn-accion-cancelar').click(replanificacion_cancelar_click);
            row.children('div.nueva').children('div.form-group').children('input.accion-fecha-nueva').val(siniestro.fechaRegistro.slice(0, siniestro.fechaRegistro.indexOf('T'))).change(accion_fecha_nueva_change);
            row.children('div.actual').children('div.form-group').children('input.accion-fecha-actual').val(siniestro.fechaRegistro.slice(0, siniestro.fechaRegistro.indexOf('T')));
            componentes.botonera.acciones.slideDown();
            $('#ventana').children('div.container-fluid').children('div.ocultable').children('div.ocultable-contenido').slideUp();
            row.children('div.nueva').children('div.form-group').children('input.accion-fecha-nueva').focus();
        } else {
            componentes.botonera.acciones.children('div.contenedor').children('div.accion').remove();
            alerta('Error 404', 'no se pudo cargar replanificacion.html');
        }
    }
    
    function cargar_reasignacion(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var i, nombre, actual,
                row = componentes.botonera.acciones.children('div.contenedor').children('div.accion').children('div.container-fluid').children('div.row');
                select = row.children('div.nuevo').children('div.form-group').children('select.accion-perito-nuevo');
            edicion = true;
            row.children('div.botones').children('button.btn-accion-aceptar').prop('disabled', true).click(reasignacion_aceptar_click);
            row.children('div.botones').children('button.btn-accion-cancelar').click(reasignacion_cancelar_click);
            if (adicional.reasignaciones.listaReasignaciones.length == 0) {
                nombre = siniestro.peritoOriginal.nombre + ' ' +  siniestro.peritoOriginal.apellido1;
                actual = siniestro.peritoOriginal.id;
            } else {
                nombre = adicional.reasignaciones.listaReasignaciones[0].perito.nombre + ' ' + adicional.reasignaciones.listaReasignaciones[0].perito.apellido1;
                actual = adicional.reasignaciones.listaReasignaciones[0].perito.id;
            }
            row.children('div.actual').children('div.form-group').children('input.accion-perito-actual').val(nombre);
            $.get("http://localhost:8080/ReForms_Provider/wr/perito/buscarPeritoPorAseguradora/" + siniestro.poliza.cliente.aseguradora.id, function(data, status) {
                if (status == 'success') {
                    if (data.length > 1) {
                        for (i = 0; i < data.length; i++) {
                            if (data[i].id != actual) {
                                nombre = data[i].nombre + ' ' + data[i].apellido1;
                                select.append('<option value=' + data[i].id + '>' + nombre + '</option>');
                            }
                        }
                    } else {
                        select.append('<option value=-1>sin peritos disponibles</option>');
                    }
                    select.children('option:first').prop('selected', true);
                    $('#ventana').children('div.container-fluid').children('div.ocultable').children('div.ocultable-contenido').slideUp();
                    componentes.botonera.acciones.slideDown();
                    select.change(accion_perito_nuevo_change);
                    select.change();
                    select.focus();
                }
            }, "json");
        } else {
            componentes.botonera.acciones.children('div.contenedor').children('div.accion').remove();
            alerta('Error 404', 'no se pudo cargar reasignacion.html');
        }
    }
    
    function cargar_facturacion(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var row = componentes.botonera.acciones.children('div.contenedor').children('div.accion').children('div.container-fluid').children('div.row');
            edicion = true;
            row.children('div.albaran').children('div.form-group').children('input.form-control').val('').change(accion_albaran_change);
            row.children('div.albaran').children('div.form-group').children('input.form-control').val('').keyup(accion_albaran_change);
            row.children('div.botones').children('button.btn-accion-aceptar').prop('disabled', true).click(facturacion_aceptar_click);
            row.children('div.botones').children('button.btn-accion-cancelar').click(facturacion_cancelar_click);
            componentes.botonera.acciones.slideDown();
            $('#ventana').children('div.container-fluid').children('div.ocultable').children('div.ocultable-contenido').slideUp();
        } else {
            componentes.botonera.acciones.children('div.contenedor').children('div.accion').remove();
            alerta('Error 404', 'no se pudo cargar facturacion.html');
        }
    }
    
    function cargar_tarea(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var tarea = tareas.listaTareas[$(this).index()],
                header = $(this).children('div.contenedor').children('div.card').children('div.card-header'),
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
                importe = body.children('div.container-fluid').children('div.row').children('div.col-4').children('div').children('div.tarea-importe').children('input[type="text"]'),
                botones = body.children('div.container-fluid').children('div.row').children('div.col-4').children('div.botones');
            if (tarea.trabajo.gremio.nombre && tarea.trabajo.gremio.nombre != null && tarea.trabajo.gremio.nombre != '') {
                gremio.val(tarea.trabajo.gremio.nombre);
            } else {
                gremio.val('');
            }
            if (tarea.trabajo.descripcion && tarea.trabajo.descripcion != null && tarea.trabajo.descripcion != '') {
                descripcion.val(tarea.trabajo.descripcion);
            } else {
                descripcion.val('');
            }
            if (tarea.trabajo.codigo && tarea.trabajo.codigo != null && tarea.trabajo.codigo != '') {
                codigo.val(tarea.trabajo.codigo);
            } else {
                codigo.val('');
            }
            switch (tarea.estado) {
                case 0: estado.val('pendiente'); break;
                case 1: estado.val('en proceso'); break;
                case 2: estado.val('finalizada'); break;
                case 3: estado.val('anulada'); break;
                default: estado.val('');
            }
            if (tarea.cantidad != null) {
                cantidad_valor.val(tarea.cantidad);
                switch (tarea.trabajo.medida) {
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
            if (tarea.observaciones && tarea.observaciones != null && tarea.observacionese != '') {
                observaciones.val(tarea.observaciones);
            } else {
                observaciones.val('');
            }
            if (tarea.importe && tarea.importe != null) {
                importe.val(tarea.importe.toFixed(2));
            } else {
                importe.val('0.00');
            }
            header.click(tarea_click);
            botones.children('div.row').children('div.col-6').children('button.tarea-aceptar').click(tarea_aceptar_click);
            botones.children('div.row').children('div.col-6').children('button.tarea-cancelar').click(tarea_cancelar_click);
            $(this).children('div.contenedor').children('div.card').css('border-color', colorBorde);
            header.css({'background-color':colorFondo, 'border-color':colorBorde});
            footer.css({'background-color':colorFondo, 'border-color':colorBorde});
            botones.hide();
            footer.hide();
        } else {
            alerta('Error 404', 'no se pudo cargar tarea.html');
        }
    }
    
    function cargar_tarea_nueva(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var gremio, padre_gremio,
                codigo, padre_codigo;
            componentes.tareas.nueva.header = $(this).children('div.contenedor').children('div.card').children('div.card-header');
            componentes.tareas.nueva.body = $(this).children('div.contenedor').children('div.card').children('div.card-body');
            componentes.tareas.nueva.botones = componentes.tareas.nueva.body.children('div.container-fluid').children('div.row').children('div.col-4').children('div.botones');
            gremio = componentes.tareas.nueva.header.children('div.container-fluid').children('div.row').children('div.col-4').children('input.tarea-gremio');
            padre_gremio = gremio.parent('div.col-4');
            codigo = componentes.tareas.nueva.header.children('div.container-fluid').children('div.row').children('div.col-4').children('input.tarea-codigo');
            padre_codigo = codigo.parent('div.col-4');
            gremio.remove();
            codigo.remove();
            $(this).children('div.contenedor').children('div.card').children('div.card-footer').remove();
            padre_gremio.append('<select class="tarea-gremio form-control custom-select-lg custom-select"></select>');
            padre_gremio.children('select.tarea-gremio').change(tarea_gremio_change);
            padre_codigo.append('<select class="tarea-codigo form-control custom-select-lg custom-select"></select>');
            padre_codigo.children('select.tarea-codigo').change(tarea_codigo_change);
            $.get('http://localhost:8080/ReForms_Provider/wr/gremio/obtenerGremios/', function (data, status) {
                if (status == 'success') {
                    var i, opcion;
                    tareas.gremios = data;
                    if (tareas.gremios.length > 0) {
                        opcion = '<option value=' + 0 + ' selected>' + tareas.gremios[0].nombre + '</option>';
                        padre_gremio.children('select.tarea-gremio').append(opcion);
                        for (i = 1; i < tareas.gremios.length; i++) {
                            opcion = '<option value=' + i + '>' + tareas.gremios[i].nombre + '</option>';
                            padre_gremio.children('select.tarea-gremio').append(opcion);
                        }
                        padre_gremio.children('select.tarea-gremio').change();
                    } else {
                        componentes.tareas.nueva.botones.children('div.row').children('div.col-6').children('button.tarea-cancelar').click();
                        alerta('Sin gremios', 'no hay gremios registrados, no es posible registrar tareas');
                    }
                } else {
                    alert('fallo en el proveedor');
                }
            }, 'json');
            componentes.tareas.nueva.header.children('div.container-fluid').children('div.row').children('div.col-4').children('input.tarea-estado').val('pendiente');
            componentes.tareas.nueva.body.children('div.container-fluid').children('div.row').children('div.col-4').children('div.tarea-cantidad').children('input[type="number"]').prop('readonly', false).change(tarea_cantidad_keyup);
            componentes.tareas.nueva.body.children('div.container-fluid').children('div.row').children('div.col-4').children('div.tarea-cantidad').children('input[type="number"]').keyup(tarea_cantidad_keyup);
            componentes.tareas.nueva.body.children('div.container-fluid').children('div.row').children('div.col-8').children('textarea.tarea-observaciones').prop('readonly', false);
            componentes.tareas.nueva.botones.children('div.row').children('div.col-6').children('button.tarea-aceptar').prop('disabled', true).click(tarea_nueva_aceptar_click);
            componentes.tareas.nueva.botones.children('div.row').children('div.col-6').children('button.tarea-cancelar').click(tarea_nueva_cancelar_click);
            $(this).children('div.contenedor').children('div.card').css('border-color', colorBorde);
            componentes.tareas.nueva.header.css({'background-color':colorBorde, 'border-color':colorBorde});
        } else {
            alerta('Error 404', 'no se pudo cargar tarea.html');
        }
    }
    
    function cargar_evento(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var card = componentes.eventos.detalles.children('div.contenedor').children('div.card'),
                detalles_llamada = card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.detalles'),
                textoTelefono = '', textoNombre = '';
            if (eventos.llamadaSeleccionada.id == -1) {
                detalles_llamada.hide();
            } else {
                if (eventos.llamadaSeleccionada.cliente && eventos.llamadaSeleccionada.cliente != null) {
                    textoNombre = eventos.llamadaSeleccionada.cliente.nombre + ' ' + eventos.llamadaSeleccionada.cliente.apellido1;
                    if (eventos.llamadaSeleccionada.cliente.apellido2 && eventos.llamadaSeleccionada.cliente.apellido2 != null && eventos.llamadaSeleccionada.cliente.apellido2 != '') {
                        textoNombre += ' ' + eventos.llamadaSeleccionada.cliente.apellido2;
                    }
                    textoTelefono = eventos.llamadaSeleccionada.cliente.telefono1;
                    if (eventos.llamadaSeleccionada.cliente.telefono2 && eventos.llamadaSeleccionada.cliente.telefono2 != null && eventos.llamadaSeleccionada.cliente.telefono2 != '') {
                        textoTelefono += ' / ' + eventos.llamadaSeleccionada.cliente.telefono2
                    }
                } else if (eventos.llamadaSeleccionada.contacto && eventos.llamadaSeleccionada.contacto != null) {
                    textoNombre = '';
                    if (eventos.llamadaSeleccionada.contacto.nombre && eventos.llamadaSeleccionada.contacto.nombre != null && eventos.llamadaSeleccionada.contacto.nombre != '') {
                        textoNombre += eventos.llamadaSeleccionada.contacto.nombre + ' ';
                    }
                    if (eventos.llamadaSeleccionada.contacto.apellido1 && eventos.llamadaSeleccionada.contacto.apellido1 != null && eventos.llamadaSeleccionada.contacto.apellido1 != '') {
                        textoNombre += eventos.llamadaSeleccionada.contacto.apellido1 + ' ';
                    }
                    if (eventos.llamadaSeleccionada.contacto.apellido2 && eventos.llamadaSeleccionada.contacto.apellido2 != null && eventos.llamadaSeleccionada.contacto.apellido2 != '') {
                        textoNombre += eventos.llamadaSeleccionada.contacto.apellido2;
                    }
                    textoTelefono = eventos.llamadaSeleccionada.contacto.telefono1;
                    if (eventos.llamadaSeleccionada.contacto.telefono2 && eventos.llamadaSeleccionada.contacto.telefono2 != null && eventos.llamadaSeleccionada.contacto.telefono2 != '') {
                        textoTelefono += ' / ' + eventos.llamadaSeleccionada.contacto.telefono2
                    }
                } else if (eventos.llamadaSeleccionada.perito && eventos.llamadaSeleccionada.perito != null) {
                    textoNombre = eventos.llamadaSeleccionada.perito.nombre + ' ' + eventos.llamadaSeleccionada.perito.apellido1;
                    textoTelefono = eventos.llamadaSeleccionada.perito.telefono1;
                    if (eventos.llamadaSeleccionada.perito.telefono2 && eventos.llamadaSeleccionada.perito.telefono2 != null && eventos.llamadaSeleccionada.perito.telefono2 != '') {
                        textoTelefono += ' / ' + eventos.llamadaSeleccionada.perito.telefono2;
                    }
                } else if (eventos.llamadaSeleccionada.grupo && eventos.llamadaSeleccionada.grupo != null) {
                    if (eventos.llamadaSeleccionada.grupo.observaciones && eventos.llamadaSeleccionada.grupo.observaciones != null && eventos.llamadaSeleccionada.grupo.observaciones != '') {
                        var fecha = eventos.llamadaSeleccionada.grupo.observaciones.slice(1, eventos.llamadaSeleccionada.grupo.observaciones.indexOf(']'));
                        fecha = new Date (new Number(fecha));
                        textoNombre = eventos.llamadaSeleccionada.grupo.observaciones.slice(eventos.llamadaSeleccionada.grupo.observaciones.indexOf(']') + 2, eventos.llamadaSeleccionada.grupo.observaciones.length);
                        textoTelefono = '[Jor. ' + (fecha.getDate() > 9 ? fecha.getDate() : '0' + fecha.getDate()) + '/' + (fecha.getMonth() > 8 ? fecha.getMonth() + 1 : '0' + (fecha.getMonth() + 1)) + '/' + fecha.getFullYear() + ']';
                    }
                } else {
                    alert('falta informacion de la llamada');
                }
                detalles_llamada.children('div.input-group').children('div.input-group-prepend').children('span.numero').html(textoTelefono);
                detalles_llamada.children('div.input-group').children('span.nombre').html(textoNombre);
                detalles_llamada.children('div.input-group').children('div.input-group-append').children('span.tipo').html(generar_icono_llamada(eventos.llamadaSeleccionada.tipo));
            }
            textoNombre = eventos.llamadaSeleccionada.evento.operador.trabajador.nombre;
            if (eventos.llamadaSeleccionada.evento.operador.trabajador.apellido1 && eventos.llamadaSeleccionada.evento.operador.trabajador.apellido1 != null && eventos.llamadaSeleccionada.evento.operador.trabajador.apellido1 != '') {
                textoNombre += ' ' + eventos.llamadaSeleccionada.evento.operador.trabajador.apellido1;
            }
            card.children('div.card-header').children('h4.nombre').html('<ins>Registrado por:</ins> ' + textoNombre);
            if (eventos.llamadaSeleccionada.evento.descripcion && eventos.llamadaSeleccionada.evento.descripcion != null && eventos.llamadaSeleccionada.evento.descripcion != '') {
                card.children('div.card-body').children('div.container-fluid').children('div.descripcion').children('div.col-12').children('textarea').val(eventos.llamadaSeleccionada.evento.descripcion);
            }
            $.get('http://localhost:8080/ReForms_Provider/wr/cita/obtenerCitaPorEvento/' + eventos.llamadaSeleccionada.evento.id, respuesta_obtenerCitaPorEvento, 'json');
            card.css('border-color', colorBorde);
            card.children('div.card-header').css({'background-color': colorBorde, 'border-color': colorBorde});
            card.children('div.card-header').children('div.fecha').css('background-color', 'white');
            fecha = eventos.llamadaSeleccionada.evento.fecha.getFullYear() + '-' + (eventos.llamadaSeleccionada.evento.fecha.getMonth() > 8 ? (eventos.llamadaSeleccionada.evento.fecha.getMonth() + 1) : '0' + (eventos.llamadaSeleccionada.evento.fecha.getMonth() + 1)) + '-' + (eventos.llamadaSeleccionada.evento.fecha.getDate() > 9 ? eventos.llamadaSeleccionada.evento.fecha.getDate() : ('0' + eventos.llamadaSeleccionada.evento.fecha.getDate()));
            card.children('div.card-header').children('div.fecha').children('input').css({'background-color': colorFondo, 'border-color': colorFondo, 'color': colorTextoNeutro}).prop('disabled', true).val(fecha);
            card.children('div.card-body').css({'background-color': colorFondo, 'border-color': colorBorde});
            detalles_llamada.children('div.input-group').children('div.input-group-prepend').children('span.numero').css({'background-color': colorFondo, 'border-color': colorBorde});
            detalles_llamada.children('div.input-group').children('span.nombre').css({'background-color': colorFondo, 'border-color': colorBorde});
            detalles_llamada.children('div.input-group').children('div.input-group-append').children('span.tipo').css({'background-color': colorFondo, 'border-color': colorBorde});
            card.children('div.card-body').children('div.container-fluid').children('div.llamada, div.cita').children('div.col-12').children('div.boton').hide();
            card.children('div.card-body').children('div.container-fluid').children('div.llamada, div.cita').children('div.col-12').children('div.nueva').remove();
            card.children('div.card-footer').remove();
        } else {
            alerta('Error 404', 'no se pudo cargar evento.html');
        }
    }
    
    function cargar_evento_nuevo(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var card = componentes.eventos.detalles.children('div.contenedor').children('div.card'),
                detalles_llamada = card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.detalles'),
                nueva_llamada = card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.nueva'),
                textoNombre, fecha = new Date(), operador = JSON.parse(sessionStorage.usuario);
            textoNombre = operador[0].trabajador.nombre + ' ' + operador[0].trabajador.apellido1;
            card.children('div.card-header').children('h4.nombre').html('<ins>Registrado por:</ins> ' + textoNombre);
            fecha = fecha.getFullYear() + '-' + (fecha.getMonth() > 8 ? (fecha.getMonth() + 1) : '0' + (fecha.getMonth() + 1)) + '-' + (fecha.getDate() > 9 ? fecha.getDate() : ('0' + fecha.getDate()));
            card.children('div.card-header').children('div.fecha').children('input').val(fecha);
            card.children('div.card-body').children('div.container-fluid').children('div.descripcion').children('div.col-12').children('textarea').prop('readonly', false);
            card.children('div.card-body').children('div.container-fluid').children('div.llamada').children('div.col-12').children('div.boton').children('div.input-group').children('button.btn-nuevo').click(llamada_agregar_click);
            card.children('div.card-body').children('div.container-fluid').children('div.cita').children('div.col-12').children('div.boton').children('div.input-group').children('button.btn-nuevo').click(cita_agregar_click);
            nueva_llamada.children('div.seleccion').children('div.col-6').children('select.telefonos').change(llamada_telefonos_change);
            nueva_llamada.children('div.seleccion').children('div.col-6').children('div.input-group').children('select.tipos').change(llamada_tipo_change);
            nueva_llamada.children('div.seleccion').children('div.col-6').children('select.telefonos').change();
            nueva_llamada.children('div.seleccion').children('div.col-6').children('div.input-group').children('select.tipos').change();
            nueva_llamada.children('div.botones').children('div.col-12').children('button.btn-aceptar').click(llamada_aceptar_click);
            nueva_llamada.children('div.botones').children('div.col-12').children('button.btn-cancelar').click(llamada_cancelar_click);
            nueva_llamada.children('div.contacto').children('div.col-12').children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input[name="llamada_contacto_telefono1"]').keyup(siniestro_llamada_telefono1_keyup);
            card.children('div.card-footer').children('div.container-fluid').children('div.botones').children('div.col-12').children('button.btn-aceptar').click(evento_nuevo_aceptar_click);
            card.children('div.card-footer').children('div.container-fluid').children('div.botones').children('div.col-12').children('button.btn-cancelar').click(evento_nuevo_cancelar_click);
            card.css('border-color', colorBorde);
            card.children('div.card-header').css({'background-color': colorBorde, 'border-color': colorBorde});
            card.children('div.card-header').children('div.fecha').css('background-color', 'white');
            card.children('div.card-header').children('div.fecha').children('input').css({'background-color': colorFondo, 'border-color': colorFondo, 'color': colorTextoNeutro});
            card.children('div.card-body, div.card-footer').css({'background-color': colorFondo, 'border-color': colorBorde});
            detalles_llamada.children('div.input-group').children('div.input-group-prepend').children('span.numero').css({'background-color': colorFondo, 'border-color': colorBorde});
            detalles_llamada.children('div.input-group').children('span.nombre').css({'background-color': colorFondo, 'border-color': colorBorde});
            detalles_llamada.children('div.input-group').children('div.input-group-append').children('span.tipo').css({'background-color': colorFondo, 'border-color': colorBorde});
            card.children('div.card-body').children('div.container-fluid').children('div.llamada, div.cita').children('div.col-12').children('div.detalles').hide();
            card.children('div.card-body').children('div.container-fluid').children('div.llamada, div.cita').children('div.col-12').children('div.nueva').css({'background-color': colorFondo, 'border-color': colorBorde}).hide();
            card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('div.boton').css({'background-color': colorFondo, 'border-color': colorBorde});
            card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('div.boton').children('div.input-group').children('div.input-group-prepend').children('span.input-group-text').css({'background-color': colorBorde, 'border-color': colorBorde, 'color': 'rgb(255, 255, 255, 0.7)'}).click(icono_agregar_click);
            card.children('div.card-body').children('div.container-fluid').children('div.row').children('div.col-12').children('div.boton').children('div.input-group').children('button.btn-nuevo').css({'background-color': colorFondo, 'border-color': colorBorde});
        } else {
            alerta('Error 404', 'no se pudo cargar evento.html');
        }
    }
    
    function respuesta_obtenerUltimaReasignacion (data, status) {
        var nombre;
        if (status == 'success') {
            nombre = data.perito.nombre + ' ' + data.perito.apellido1;
            componentes.siniestro.informacion.children('div.siniestro_peritoActual').children('div.form-group').children('input[name="siniestro_peritoActual"]').val(nombre);
            nombre = siniestro.peritoOriginal.nombre + ' ' + siniestro.peritoOriginal.apellido1;
            componentes.siniestro.informacion.children('div.siniestro_fechaReasignacion').children('div.form-group').show();
            componentes.siniestro.informacion.children('div.siniestro_fechaReasignacion').children('div.form-group').children('input[name="siniestro_fechaReasignacion"]').val(data.fecha.slice(0, data.fecha.indexOf('T')));
            componentes.siniestro.informacion.children('div.siniestro_peritoOriginal').children('div.form-group').show();
            componentes.siniestro.informacion.children('div.siniestro_peritoOriginal').children('div.form-group').children('input[name="siniestro_peritoOriginal"]').val(nombre);
        } else {
            nombre = siniestro.peritoOriginal.nombre + ' ' + siniestro.peritoOriginal.apellido1;
            componentes.siniestro.informacion.children('div.siniestro_peritoActual').children('div.form-group').children('input[name="siniestro_peritoActual"]').val(nombre);
            componentes.siniestro.informacion.children('div.siniestro_fechaReasignacion').children('div.form-group').hide();
            componentes.siniestro.informacion.children('div.siniestro_peritoOriginal').children('div.form-group').hide();
        }
    }
    
    function respuesta_obtenerContactos(data, status) {
        var tbody = componentes.contactos.tabla.children('table').children('tbody');
        if (status == 'success') {
            contactos.listaContactos = data;
            mostrar_contactos(contactos.listaContactos, tbody);
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerEventos(data, status) {
        if (status == 'success') {
            var i;
            eventos.listaLlamadas = data;
            eventos.llamadaSeleccionada = null;
            eventos.posicionSeleccionada = -1;
            for (i = 0; i < eventos.listaLlamadas.length; i++) {
                eventos.listaLlamadas[i].evento.fecha = new Date(eventos.listaLlamadas[i].evento.fecha.slice(0, eventos.listaLlamadas[i].evento.fecha.indexOf('T')));
            }
            mostrar_llamadas(eventos.listaLlamadas, componentes.eventos.tbody);
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerParticipantes(data, status) {
        var tbody = componentes.adicional.participantes.elemento.children('table').children('tbody');
        if (status == 'success') {
            adicional.participantes.listaParticipantes = data;
            mostrar_participantes(adicional.participantes.listaParticipantes, tbody);
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerReplanificaciones(data, status) {
        var tbody = componentes.adicional.replanificaciones.elemento.children('table').children('tbody');
        if (status == 'success') {
            adicional.replanificaciones.listaReplanificaciones = data;
            actualizar_fecha_siniestro();
            mostrar_replanificaciones(adicional.replanificaciones.listaReplanificaciones, tbody);
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerReasignaciones(data, status) {
        var tbody = componentes.adicional.reasignaciones.elemento.children('table').children('tbody');
        if (status == 'success') {
            adicional.reasignaciones.listaReasignaciones = data;
            mostrar_reasignaciones(adicional.reasignaciones.listaReasignaciones, tbody);
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerRecursos(data, status) {
        var tbody = componentes.adicional.recursos.tabla.children('table').children('tbody');
        if (status == 'success') {
            adicional.recursos.listaRecursos = data;
            mostrar_recursos(adicional.recursos.listaRecursos, tbody);
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_consultarEstado(data, status) {
        if (status == 'success') {
            siniestro.estado = Number(data);
            actualizar_estado_siniestro(siniestro.estado);
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerTareas(data, status) {
        if (status == 'success') {
            tareas.listaTareas = data;
            mostrar_tareas(tareas.listaTareas, componentes.tareas.lista);
            $.get('http://localhost:8080/ReForms_Provider/wr/siniestro/consultarEstado/' + siniestro.id, respuesta_consultarEstado, 'text');
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerCitaPorEvento(data, status) {
        if (status == 'success') {
            var card = componentes.eventos.detalles.children('div.contenedor').children('div.card'),
                detalles_cita = card.children('div.card-body').children('div.container-fluid').children('div.cita').children('div.col-12').children('div.detalles');
            if (data.length > 0) {
                var texto = data[0].grupo.observaciones,
                    fecha = new Date(new Number(texto.slice(1, texto.indexOf(']')))),
                    nombre = texto.slice(texto.indexOf(']') + 2, texto.length);
                texto = (fecha.getDate() > 9 ? fecha.getDate() : ('0' + fecha.getDate())) + '/' + (fecha.getMonth() > 8 ? (fecha.getMonth() + 1) : ('0' + (fecha.getMonth() + 1))) + '/' + fecha.getFullYear();
                detalles_cita.children('div.resumen').children('div.input-group').children('div.input-group-prepend').children('span.dia').html(texto);
                texto = (data[0].hora > 9 ? data[0].hora : ('0' + data[0].hora)) + ':' + (data[0].minuto > 9 ? data[0].minuto : ('0' + data[0].minuto));
                detalles_cita.children('div.resumen').children('div.input-group').children('div.input-group-prepend').children('span.hora').html(texto);
                detalles_cita.children('div.resumen').children('div.input-group').children('span.grupo').html(nombre);
                $.get('http://localhost:8080/ReForms_Provider/wr/tareascita/obtenerTareasPorCita/' + data[0].id, respuesta_obtenerTareasPorCita, 'json');
                detalles_cita.children('div.resumen').children('div.input-group').children('div.input-group-prepend').children('span.dia, span.hora').css({'background-color': colorFondo, 'border-color': colorBorde});
                detalles_cita.children('div.resumen').children('div.input-group').children('span.grupo').css({'background-color': colorFondo, 'border-color': colorBorde});
                detalles_cita.children('div.tabla').children('table.table').children('thead').children('tr').css('background-color', colorBorde);
            } else {
                detalles_cita.hide(); 
            }
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerTareasPorCita(data, status) {
        if (status == 'success') {
            var i, und, tbody = componentes.eventos.detalles.children('div.contenedor').children('div.card').children('div.card-body').children('div.container-fluid').children('div.cita').children('div.col-12').children('div.detalles').children('div.tabla').children('table.table').children('tbody');
            tbody.children('tr.tarea').remove();
            if (data.length > 0) {
                for (i = 0; i < data.length; i++) {
                    switch (data[i].tarea.trabajo.medida) {
                        case 0: und = ' uds.'; break;
                        case 1: und = ' m'; break;
                        case 2: und = ' m<sup>2</sup>'; break;
                        case 3: und = ' m<sup>3</sup>'; break;
                        case 4: und = ' h'; break;
                        case 5: und = ' km'; break;
                        default: und = ''; break;
                    }
                    tbody.append('<tr class="tarea"><td>' + data[i].tarea.trabajo.codigo + '</td><td>' + data[i].tarea.trabajo.descripcion + '</td><td>' + data[i].tarea.cantidad + und + '</td></tr>');
                }
            } else {
                tbody.append('<tr class="sin-resultados tarea"><td colspan="2"><h4>Sin tareas asignadas</h4></td></tr>');
            }
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    // Cargar paginas y aplicar controles
    // ====================================================================== //
    componentes.siniestro.informacion = componentes.siniestro.contenido.children('div.informacion').children('div.container-fluid').children('div.row');
    componentes.siniestro.observaciones = componentes.siniestro.contenido.children('div.observaciones');
    componentes.contactos.detalles = componentes.siniestro.contenido.children('div.contactos').children('div.detalles');
    componentes.contactos.tabla = componentes.siniestro.contenido.children('div.contactos').children('div.tabla');
    componentes.contactos.botones = componentes.contactos.detalles.children('div.contenedor').children('div.botones').children('div.col-12');
    componentes.contactos.entradas = componentes.contactos.detalles.children('div.contenedor').children('div.row').children('div.col-12').children('div.form-group');
    componentes.adicional.participantes.nuevo = componentes.adicional.participantes.elemento.children('button[name="participante_nuevo"]');
    componentes.adicional.participantes.participante = componentes.adicional.participantes.elemento.children('div.participante');
    componentes.adicional.participantes.botones = componentes.adicional.participantes.participante.children('div.contenedor').children('div.row').children('div.col-12');
    componentes.adicional.recursos.entrada_fichero = componentes.adicional.recursos.recurso.children('div.contenedor').children('div.archivo').children('div.fichero').children('div.form-group').children('div.entrada');
    componentes.adicional.recursos.descarga_fichero = componentes.adicional.recursos.recurso.children('div.contenedor').children('div.archivo').children('div.fichero').children('div.form-group').children('div.salida').children('div.input-group-append').children('a[name="recurso_fichero_descargar"]');
    componentes.adicional.recursos.entrada_tipo = componentes.adicional.recursos.recurso.children('div.contenedor').children('div.archivo').children('div.tipo').children('div.form-group').children('div.entrada');
    componentes.adicional.recursos.botones = componentes.adicional.recursos.recurso.children('div.contenedor').children('div.botones').children('div.col-12');
    componentes.adicional.recursos.previsualizacion = componentes.adicional.recursos.recurso.children('div.contenedor').children('div.descripcion').children('div.previsualizacion');
    sessionStorage.setItem('vuelta', sessionStorage.siniestro);
    sessionStorage.setItem('poliza', JSON.stringify(siniestro.poliza));
    sessionStorage.removeItem('siniestro');
    componentes.siniestro.contenido.children('div.poliza').children('div.col-12').load('Html/poliza.html', cargar_poliza);
    if (siniestro.afectado && siniestro.afectado != null) {
        strAux = siniestro.afectado.direccion + ' ' + siniestro.afectado.numero;
        if (siniestro.afectado.piso && siniestro.afectado.piso != null && siniestro.afectado.piso != '') {
            strAux += ', ' + siniestro.afectado.piso;
        }
        componentes.siniestro.contenido.children('div.afectado').children('div.col-12').children('input[name="siniestro_afectado"]').val(strAux);
        componentes.siniestro.contenido.children('div.afectado').show();
        if (siniestro.afectado.observaciones && siniestro.afectado.observaciones != null && siniestro.afectado.observaciones != '') {
            strAux = siniestro.afectado.observaciones;
            componentes.siniestro.contenido.children('div.afectado').children('div.col-12').children('textarea[name="siniestro_afectado_observaciones"]').val(strAux);
        } else {
            componentes.siniestro.contenido.children('div.afectado').children('div.col-12').children('textarea[name="siniestro_afectado_observaciones"]').hide();
        }
    } else {
        componentes.siniestro.contenido.children('div.afectado').hide();
    }
    componentes.botonera.botones.children('button[name="borrar"]').click(borrar_click);
    componentes.botonera.botones.children('button[name="replanificar"]').click(replanificar_click);
    componentes.botonera.botones.children('button[name="reasignar"]').click(reasignar_click);
    componentes.botonera.botones.children('button[name="cerrar"]').click(cerrar_click);
    componentes.botonera.botones.children('button[name="facturar"]').click(facturar_click);
    componentes.botonera.botones.children('button[name="cobrar"]').click(cobrar_click);
    $('#ventana').children('div.container-fluid').children('div.botonera').children('div.volver').children('button[name="volver"]').css({'border-color':colorBorde, 'background-color':colorFondo}).click(volver_click);
    $('#ventana').children('div.container-fluid').children('div.ocultable').children('div.ocultable-titulo').click(ocultable_click);
    if (siniestro.original && siniestro.original != null) {
        componentes.siniestro.contenido.children('div.informacion').children('div.container-fluid').children('div.row').children('div.siniestro_original_descargar').children('div.form-group').children('div.input-group').children('div.input-group-append').children('a[name="siniestro_original_descargar"]').prop('download', siniestro.original.nombre).prop('href', 'data:text/plain;base64,' + siniestro.original.fichero);
    } else {
        componentes.siniestro.contenido.children('div.informacion').children('div.container-fluid').children('div.row').children('div.siniestro_original_descargar').children('div.form-group').children('div.input-group').children('div.input-group-append').children('a[name="siniestro_original_descargar"]').prop('download', '').prop('href', '');
    }
    componentes.siniestro.contenido.children('div.informacion').children('div.container-fluid').children('div.row').children('div.siniestro_numero').children('div.form-group').children('input[name="siniestro_numero"]').val(siniestro.numero);
    actualizar_fecha_siniestro();
    actualizar_estado_siniestro(siniestro.estado);
    $.get('http://localhost:8080/ReForms_Provider/wr/reasignacion/obtenerUltimaReasignacion/' + siniestro.id, respuesta_obtenerUltimaReasignacion, 'json');
    componentes.siniestro.contenido.children('div.informacion').children('div.container-fluid').children('div.row').children('div.siniestro_albaran').children('div.form-group').children('input[name="siniestro_albaran"]').val(siniestro.albaran);
    componentes.siniestro.contenido.children('div.informacion').children('div.container-fluid').children('div.row').children('div.siniestro_original_descargar').children('div.form-group').children('div.input-group').children('input[name="siniestro_original"]').val(siniestro.original.nombre);
    if (siniestro.observaciones && siniestro.observaciones != null && siniestro.observaciones != '') {
        componentes.siniestro.observaciones.children('div.col-12').children('textarea[name="siniestro_observaciones"]').val(siniestro.observaciones);
        componentes.siniestro.observaciones.show();
    } else {
        componentes.siniestro.observaciones.hide();
    }
    componentes.contactos.tabla.children('button[name="siniestro_contacto_nuevo"]').click(contacto_nuevo_click);
    componentes.contactos.botones.children('button[name="siniestro_contacto_editar"]').click(contacto_editar_click);
    componentes.contactos.botones.children('button[name="siniestro_contacto_borrar"]').click(contacto_borrar_click);
    componentes.contactos.botones.children('button[name="siniestro_contacto_aceptar"]').click(contacto_aceptar_click).hide();
    componentes.contactos.botones.children('button[name="siniestro_contacto_cancelar"]').click(contacto_cancelar_click).hide();
    componentes.contactos.entradas.children('div.input-group').children('input[name="siniestro_contacto_telefono1"]').keyup(siniestro_contacto_telefono1_keyup);
    componentes.tareas.botones.children('button[name="tarea_nueva"]').click(tarea_nueva_click);
    componentes.tareas.botones.children('button[name="tarea_actualizar"]').click(tarea_actualizar_click);
    componentes.tareas.botones.children('button[name="tarea_ampliar"]').click(tarea_ampliar_click);
    componentes.tareas.botones.children('button[name="tarea_borrar"]').click(tarea_borrar_click);
    componentes.eventos.nuevo.click(evento_nuevo_click);
    componentes.adicional.participantes.nuevo.click(participante_agregar_click);
    componentes.adicional.participantes.botones.children('button[name="adicional_participante_aceptar"]').click(adicional_participante_aceptar_click);
    componentes.adicional.participantes.botones.children('button[name="adicional_participante_cancelar"]').click(adicional_participante_cancelar_click);
    componentes.adicional.recursos.tabla.children('button[name="recurso_nuevo"]').click(recurso_adjuntar_click);
    componentes.adicional.recursos.botones.children('button[name="recurso_editar"]').click(recurso_editar_click);
    componentes.adicional.recursos.botones.children('button[name="recurso_aceptar"]').click(recurso_aceptar_click).hide();
    componentes.adicional.recursos.botones.children('button[name="recurso_cancelar"]').click(recurso_cancelar_click).hide();
    componentes.adicional.recursos.botones.children('button[name="recurso_borrar"]').click(recurso_borrar_click);
    componentes.adicional.recursos.entrada_fichero.children('input[name="recurso_fichero"]').change(recurso_fichero_change);
    componentes.adicional.recursos.entrada_tipo.children('select[name="recurso_tipo"]').change(recurso_tipo_change);
    $.get('http://localhost:8080/ReForms_Provider/wr/contacto/obtenerContactos/' + siniestro.id, respuesta_obtenerContactos, 'json');
    $.get('http://localhost:8080/ReForms_Provider/wr/llamada/obtenerEventos/' + siniestro.id, respuesta_obtenerEventos, 'json');
    $.get('http://localhost:8080/ReForms_Provider/wr/participante/obtenerParticipantes/' + siniestro.id, respuesta_obtenerParticipantes, 'json');
    $.get('http://localhost:8080/ReForms_Provider/wr/replanificacion/obtenerReplanificaciones/' + siniestro.id, respuesta_obtenerReplanificaciones, 'json');
    $.get('http://localhost:8080/ReForms_Provider/wr/reasignacion/obtenerReasignaciones/' + siniestro.id, respuesta_obtenerReasignaciones, 'json');
    $.get('http://localhost:8080/ReForms_Provider/wr/recurso/obtenerRecursos/' + siniestro.id, respuesta_obtenerRecursos, 'json');
    $.get('http://localhost:8080/ReForms_Provider/wr/tarea/obtenerTareas/' + siniestro.id, respuesta_obtenerTareas, 'json');
    $('#ventana').children('div.container-fluid').children('div.eventos').children('div.ocultable-contenido').children('div.row').children('div.col-12').children('h1').dblclick(function () {
        sessionStorage.setItem('evento', '{"nombre":"prueba"}');
        $('#btn-jornadas').click();
    });
    
    // Inicializacion de aspecto y colores
    // ====================================================================== //
    $('#ventana').css('border-color', colorBorde);
    $('#ventana').css('background-color', colorFondo);
    $('#ventana').children('div.container-fluid').find('button.btn-nuevo').css({'border-color':colorBorde, 'background-color':colorFondo});
    $('#ventana').children('div.container-fluid').find('button.btn-editar').css({'border-color':colorBorde, 'background-color':colorFondo});
    $('#ventana').children('div.container-fluid').children('div.ocultable').css('border-color', colorBorde);
    $('#ventana').children('div.container-fluid').children('div.ocultable').children('div.ocultable-contenido').hide();
    componentes.botonera.botones.children('button.btn-botonera').css({'border-color':invertir_color(colorBorde), 'background-color':invertir_color(colorFondo)});
    componentes.siniestro.contenido.show();
    componentes.siniestro.estado.hide();
    componentes.siniestro.estado.children('input[name="estado"]').css({'border-color':colorBorde, 'background-color':sinColor});
    componentes.siniestro.estado.children('div.input-group-prepend').children('span.input-group-text').css({'border-color':colorBorde, 'background-color':colorFondo, 'font-size':'1.25em'});
    $('#ventana').children('div.container-fluid').children('div.siniestro').children('div.ocultable-titulo').children('div.form-inline').children('div.estado').children('div.input-group-prepend').children('span.input-group-text').css({'border-color':colorBorde, 'background-color':colorFondo, 'font-size':'1.25em'});
    componentes.siniestro.contenido.children('div.informacion').children('div.container-fluid').children('div.row').children('div.siniestro_original_descargar').children('div.form-group').children('div.input-group').children('div.input-group-append').children('a[name="siniestro_original_descargar"]').css({'border-color':colorBordeNeutro, 'background-color':colorFondoNeutro, 'color':colorTextoNeutro});
    $('#ventana').children('div.container-fluid').children('div.adicional').children('div.ocultable-contenido').find('table').children('thead').children('tr').css('background-color', colorBorde);
    componentes.contactos.tabla.children('table').children('thead').children('tr').css('background-color', colorBorde);
    componentes.contactos.detalles.children('div.contenedor').css('border-color', colorBorde);
    componentes.tareas.botones.children('button').not('button.btn-borrar').css({'border-color':colorBorde, 'background-color':colorFondo});
    componentes.eventos.tbody.siblings('thead').children('tr').css('background-color', colorBorde);
    componentes.adicional.recursos.recurso.children('div.contenedor').css('border-color', colorBorde);
    componentes.adicional.participantes.participante.children('div.contenedor').css('border-color', colorBorde);
    componentes.adicional.recursos.previsualizacion.children('div.contenedor').css('border-color', colorBorde);
    componentes.adicional.recursos.recurso.children('div.contenedor').children('div.archivo').children('div.tipo').children('div.form-group').children('div.salida').children('div.input-group-append').children('div.recurso_tipo_icono').css({'border-color':colorBordeNeutro, 'background-color':colorFondoNeutro});
    componentes.adicional.recursos.descarga_fichero.css({'border-color':colorBordeNeutro, 'background-color':colorFondoNeutro, 'color':colorTextoNeutro});
    componentes.botonera.acciones.hide();
    componentes.contactos.detalles.hide();
    if (siniestro.estado > 3) {
        componentes.tareas.botones.children('button[name="tarea_nueva"]').hide();
    }
    componentes.tareas.botones.children('button').not('button[name="tarea_nueva"]').hide();
    componentes.eventos.detalles.hide();
    componentes.adicional.participantes.participante.hide();
    componentes.adicional.recursos.entrada_tipo.hide();
    componentes.adicional.recursos.entrada_fichero.hide();
    componentes.adicional.recursos.recurso.hide();
    componentes.adicional.recursos.previsualizacion.hide();
});
