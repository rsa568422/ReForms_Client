$(document).ready(function() {

    // Variables
    // ====================================================================== //
    var colorBorde = $('#btn-siniestros').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.1)',
        sinColor = 'rgb(0, 0, 0, 0)',
        contenedor = $('#ventana').children('div[class="container-fluid"]'),
        informacion = contenedor.children('div.siniestro').children('div.ocultable-contenido').children('div.informacion'),
        poliza = contenedor.children('div.siniestro').children('div.ocultable-contenido').children('div.poliza'),
        contenedor_contactos = contenedor.children('div.siniestro').children('div.ocultable-contenido').children('div.contactos'),
        contenedor_adicional = contenedor.children('div.adicional').children('div.ocultable-contenido'),
        siniestro = JSON.parse(sessionStorage.siniestro),
        contactos = {
            'listaContactos': [],
            'contactoSeleccionado': null,
            'posicionSeleccionado': -1
        },
        tareas = {
            'listaTareas': [],
            'tareaSeleccionada': null
        },
        eventos = {
            'listaEventos': [],
            'eventoSeleccionado': null
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
                'recursoSeleccionado': null
            }
        },
        strAux, edicion = false;
    
    // Funciones auxiliares
    // ====================================================================== //
    function alerta(titulo, mensaje) {
        $('#alerta').find('.modal-title').html(titulo);
        $('#alerta').find('.modal-body').html(mensaje);
        $('#activador-alerta').click();
    }
    
    function telefono_valido(telefonoStr) {
        return /^[69]\d{8}$/.test(telefonoStr);
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
                    tbody.append('<tr class="participante"><td>' + listaParticipantes[i].multiservicios.nombre + ' (' + contacto + ')<button class="btn btn-borrar-sm" type="button">&times;</button></td></tr>');
                } else {
                    tbody.append('<tr class="participante"><td>' + listaParticipantes[i].multiservicios.nombre + '<button class="btn btn-borrar-sm" type="button">&times;</button></td></tr>');
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
    
    function actualizar_estado_siniestro() {
        var strAux;
        switch (siniestro.estado) {
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
        informacion.find('input[name="siniestro_estado"]').val(strAux);
        contenedor.children('div.siniestro').children('div.ocultable-titulo').find('input[name="estado"]').val(strAux);
    }
    
    function actualizar_detalles_contacto() {
        var detalles = contenedor_contactos.children('div.detalles'),
            nombre = detalles.find('input[name="siniestro_contacto_nombre"]'),
            apellido1 = detalles.find('input[name="siniestro_contacto_apellido1"]'),
            apellido2 = detalles.find('input[name="siniestro_contacto_apellido2"]'),
            telefono1 = detalles.find('input[name="siniestro_contacto_telefono1"]'),
            telefono2 = detalles.find('input[name="siniestro_contacto_telefono2"]'),
            observaciones = detalles.find('textarea[name="siniestro_contacto_observaciones"]'),
            aceptar = detalles.find('button.btn-aceptar');
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
            detalles.show();
        } else {
            detalles.hide();
        }
    }
    
    function actualizar_detalles_participante() {
        var contenedor = contenedor_adicional.children('div.row').children('div.participantes').children('div.participante').children('div.contenedor');
        contenedor.find('input').val('');
    }
    
    // Funciones controladoras para componentes
    // ====================================================================== //
    function replanificar_click() {
        alert('replanificar_click()');
        contenedor.children('div.acciones').hide();
    }
    
    function reasignar_click() {
        alert('reasignar_click()');
        contenedor.children('div.acciones').show();
    }
    
    function volver_click() {
        $('#btn-siniestros').click();
    }
    
    function ocultable_click() {
        if (!edicion) {
            if ($(this).parent('div.ocultable').filter('.siniestro').length == 1) {
                if ($(this).siblings('div.ocultable-contenido').is(':visible')) {
                    $(this).find('div.estado').fadeIn();
                } else {
                    $(this).find('div.estado').fadeOut();
                }
            } else {
                contenedor.children('div.siniestro').children('div.ocultable-titulo').find('div.estado').fadeIn();
            }
            $(this).siblings('.ocultable-contenido').slideToggle();
            $(this).parent('.ocultable').siblings('.ocultable').children('.ocultable-contenido').slideUp();
        }
    }
    
    function descargar_click() {
        $(this).prop("download", siniestro.original.nombre);
        $(this).prop("href", "data:text/plain;base64," + siniestro.original.fichero);
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
            contenedor_contactos.children('div.detalles').find('button[name="siniestro_contacto_editar"]').click();
        }
    }
    
    function contacto_editar_click() {
        var nombre = contenedor_contactos.children('div.detalles').find('input[name="siniestro_contacto_nombre"]'),
            telefono1 = contenedor_contactos.children('div.detalles').find('input[name="siniestro_contacto_telefono1"]'),
            observaciones = contenedor_contactos.children('div.detalles').find('textarea[name="siniestro_contacto_observaciones"]');
        if (!edicion) {
            edicion = true;
            $(this).hide();
            $(this).siblings('button.btn-aceptar').show();
            $(this).siblings('button.btn-cancelar').show();
            $(this).siblings('button.btn-borrar').hide();
            contenedor_contactos.children('div.tabla').find('button[name="siniestro_contacto_nuevo"]').prop('disabled', true);
            contenedor_contactos.children('div.detalles').find('input').prop('readonly', false);
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
        var detalles = contenedor_contactos.children('div.detalles'),
            nombre = detalles.find('input[name="siniestro_contacto_nombre"]'),
            apellido1 = detalles.find('input[name="siniestro_contacto_apellido1"]'),
            apellido2 = detalles.find('input[name="siniestro_contacto_apellido2"]'),
            telefono1 = detalles.find('input[name="siniestro_contacto_telefono1"]'),
            telefono2 = detalles.find('input[name="siniestro_contacto_telefono2"]'),
            observaciones = detalles.find('textarea[name="siniestro_contacto_observaciones"]'),
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
                        mostrar_contactos(contactos.listaContactos, contenedor_contactos.children('div.tabla').children('table').children('tbody'));
                        contenedor_contactos.children('div.tabla').children('table').children('tbody').children('tr.contacto').eq(contactos.posicionSeleccionado).css('background-color', colorFondo);
                    },
                    error: function(jQxhr, textStatus, errorThrown){
                        alerta('Error en proveedor', 'no ha sido posible actualizar el contacto');
                    }
                });
            }
            $(this).siblings('button.btn-cancelar').click();
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
        $(this).hide();
        $(this).siblings('button.btn-aceptar').prop('disabled', false).hide();
        $(this).siblings('button.btn-editar').show();
        $(this).siblings('button.btn-borrar').show();
        contenedor_contactos.children('div.tabla').find('button[name="siniestro_contacto_nuevo"]').prop('disabled', false);
        contenedor_contactos.children('div.detalles').find('input').prop('readonly', true);
        contenedor_contactos.children('div.detalles').find('textarea').prop('readonly', true);
        if (contactos.contactoSeleccionado.id == null) {
            contenedor_contactos.children('div.detalles').hide();
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
            var i, tfoot = $(this).siblings('table').children('tfoot'),
                boton_actual = $(this),
                boton_vecino = $(this).parent('div.participantes').parent('div.row').siblings('div.recursos').children('div.tabla').children('button[name="recurso_nuevo"]'),
                select = '<tr><td><div class="container mt-3"><div class="input-group mb-3"><select class="form-control form custom-select">', opciones = '',
                botones = '</select><div class="input-group-append"><button class="btn btn-aceptar-sm" type="button">+</button><button class="btn btn-cancelar-sm" type="button">x</button></div></div></div></td></tr>';
            tfoot.children('tr').remove();
            $.get('http://localhost:8080/ReForms_Provider/wr/multiservicios/obtenerMultiserviciosDisponibles/' + siniestro.id, function(data, status) {
                if (status == "success") {
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
                    boton_actual.hide();
                    boton_vecino.prop('disabled', true);
                } else {
                    alert('fallo en el proveedor');
                }
            }, 'json');
        }
    }
    
    function participante_aceptar_click() {
        var select = $(this).parent('div.input-group-append').siblings('select'),
            tbody = contenedor_adicional.children('div.row').children('div.participantes').children('table').children('tbody'),
            tfoot = contenedor_adicional.children('div.row').children('div.participantes').children('table').children('tfoot'),
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
            contenedor_adicional.children('div.row').children('div.participantes').children('div.participante').show();
            tfoot.children('tr').hide();
        }
    }
    
    function participante_cancelar_click() {
        var tfoot = $(this).parent('div.input-group-append').parent('div.input-group').parent('div.container').parent('td').parent('tr').parent('tfoot'),
            boton_vecino = tfoot.parent('table').parent('div.participantes').parent('div.row').siblings('div.recursos').children('div.tabla').children('button[name="recurso_nuevo"]');
        edicion = false;
        tfoot.children('tr').remove();
        tfoot.parent('table').siblings('button[name="participante_nuevo"]').show();
        boton_vecino.prop('disabled', false);
    }
    
    function participante_borrar_click() {
        var tr = $(this).parent('td').parent('tr.participante'),
            tbody = contenedor_adicional.children('div.row').children('div.participantes').children('table').children('tbody'),
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
        var contenedor = $(this).parent('div.col-12').parent('div.row').parent('div.contenedor'),
            cancelar = $(this).siblings('button.btn-cancelar'),
            nombre = contenedor.children('div.row').find('input[name="adicional_participante_nombre"]'),
            telefono1 = contenedor.children('div.row').find('input[name="adicional_participante_telefono1"]'),
            telefono2 = contenedor.children('div.row').find('input[name="adicional_participante_telefono2"]'),
            fax = contenedor.children('div.row').find('input[name="adicional_participante_fax"]'),
            email = contenedor.children('div.row').find('input[name="adicional_participante_email"]'),
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
        var participante = $(this).parent('div.col-12').parent('div.row').parent('div.contenedor').parent('div.participante'),
            boton_cancelar_vecino = participante.siblings('table').children('tfoot').find('button.btn-cancelar-sm');
        adicional.participantes.participanteSeleccionado = null;
        actualizar_detalles_participante();
        participante.hide();
        boton_cancelar_vecino.click();
    }
    
    function recurso_click() {
        alert('recurso_click()');
    }
    
    function recurso_adjuntar_click() {
        alert('recurso_adjuntar_click()');
        /*var recurso = contenedor_adicional.children('div.recursos').children('div.recurso'),
            archivo = recurso.children('div.contenedor').children('div.archivo'),
            descripcion = recurso.children('div.contenedor').children('div.descripcion'),
            botones = recurso.children('div.contenedor').children('div.botones'),
            boton_vecino = contenedor_adicional.children('div.row').children('div.participantes').children('button[name="participante_nuevo"]');
        if (!edicion) {
            edicion = true;
            $(this).prop('disabled', true);
            boton_vecino.prop('disabled', true);
            archivo.children('div.tipo').children('div.form-group').children('div.salida').hide();
            archivo.children('div.tipo').children('div.form-group').children('div.entrada').show();
            archivo.children('div.tipo').children('div.form-group').children('div.entrada').children('select[name="recurso_tipo"]').val(1);
            archivo.children('div.fichero').children('div.form-group').children('div.salida').hide();
            archivo.children('div.fichero').children('div.form-group').children('div.entrada').show();
            descripcion.children('div.texto').children('textarea[name="recurso_descripcion"]').val('').prop('rows', '4').prop('readonly', false);
            descripcion.children('div.texto').removeClass('col-12').addClass('col-4');
            descripcion.children('div.previualizacion').show();
            botones.children('div.col-12').children('button[name="recurso_editar"]').hide();
            botones.children('div.col-12').children('button[name="recurso_aceptar"]').show();
            botones.children('div.col-12').children('button[name="recurso_cancelar"]').show();
            botones.children('div.col-12').children('button[name="recurso_borrar"]').hide();
            recurso.show();
        }*/
        
        // para la version buena
        //adicional.recursos.recursoSeleccionado = null;
        //actualizar_detalles_recurso();
    }
    
    function siniestro_contacto_telefono1_keyup() {
        var aceptar = contenedor_contactos.children('div.detalles').find('button.btn-aceptar');
        if ($(this).val() != '' && telefono_valido($(this).val())) {
            aceptar.prop('disabled', false);
        } else {
            aceptar.prop('disabled', true);
        }
    }
    
    function recurso_tipo_change() {
        
    }
    
    // Funciones para cargar paginas y definir su comportamiento
    // ====================================================================== //
    function cargar_poliza(responseTxt, statusTxt) {
        if (statusTxt != 'success') {
            alerta('Error 404', 'no se pudo cargar poliza.html');
            sessionStorage.removeItem('vuelta');
            sessionStorage.removeItem('poliza');
        }
    }
    
    function respuesta_obtenerUltimaReasignacion (data, status) {
        var nombre;
        if (status == "success") {
            nombre = data.perito.nombre + ' ' + data.perito.apellido1;
            informacion.find('input[name="siniestro_peritoActual"]').val(nombre);
            nombre = siniestro.peritoOriginal.nombre + ' ' + siniestro.peritoOriginal.apellido1;
            informacion.find('input[name="siniestro_fechaReasignacion"]').val(data.fecha.slice(0, data.fecha.indexOf('T'))).show();
            informacion.find('input[name="siniestro_peritoOriginal"]').val(nombre).parent('div.form-group').show();
        } else {
            nombre = siniestro.peritoOriginal.nombre + ' ' + siniestro.peritoOriginal.apellido1;
            informacion.find('input[name="siniestro_peritoActual"]').val(nombre);
            informacion.find('input[name="siniestro_fechaReasignacion"]').parent('div.form-group').hide();
            informacion.find('input[name="siniestro_peritoOriginal"]').parent('div.form-group').hide();
        }
    }
    
    function respuesta_obtenerContactos(data, status) {
        var tbody = contenedor_contactos.children('div.tabla').children('table').children('tbody');
        if (status == "success") {
            contactos.listaContactos = data;
            mostrar_contactos(contactos.listaContactos, tbody);
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerParticipantes(data, status) {
        var tbody = contenedor_adicional.children('div.row').children('div.participantes').children('table').children('tbody');
        if (status == "success") {
            adicional.participantes.listaParticipantes = data;
            mostrar_participantes(adicional.participantes.listaParticipantes, tbody);
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerReplanificaciones(data, status) {
        var tbody = contenedor_adicional.children('div.row').children('div.replanificaciones').children('table').children('tbody'),
            h5 = informacion.children('div.container-fluid').find('input[name="siniestro_fecha"]').siblings('h5');
        if (status == "success") {
            adicional.replanificaciones.listaReplanificaciones = data;
            if (adicional.replanificaciones.listaReplanificaciones.length > 0) {
                h5.html('Fecha replanificada');
            } else {
                h5.html('Fecha de registro');
            }
            mostrar_replanificaciones(adicional.replanificaciones.listaReplanificaciones, tbody);
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerReasignaciones(data, status) {
        var tbody = contenedor_adicional.children('div.row').children('div.reasignaciones').children('table').children('tbody');
        if (status == "success") {
            adicional.reasignaciones.listaReasignaciones = data;
            mostrar_reasignaciones(adicional.reasignaciones.listaReasignaciones, tbody);
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    function respuesta_obtenerRecursos(data, status) {
        var tbody = contenedor_adicional.children('div.recursos').children('div.tabla').children('table').children('tbody');
        if (status == "success") {
            adicional.recursos.listaRecursos = data;
            mostrar_recursos(adicional.recursos.listaRecursos, tbody);
        } else {
            alert('fallo en el proveedor');
        }
    }
    
    // Cargar paginas y aplicar controles
    // ====================================================================== //
    sessionStorage.setItem('vuelta', sessionStorage.siniestro);
    sessionStorage.setItem('poliza', JSON.stringify(siniestro.poliza));
    sessionStorage.removeItem('siniestro');
    poliza.children('div.col-12').load('Html/poliza.html', cargar_poliza);
    if (siniestro.afectado && siniestro.afectado != null) {
        strAux = siniestro.afectado.direccion + ' ' + siniestro.afectado.numero;
        if (siniestro.afectado.piso && siniestro.afectado.piso != null && siniestro.afectado.piso != '') {
            strAux += ', ' + siniestro.afectado.piso;
        }
        contenedor.children('div.siniestro').children('div.ocultable-contenido').children('div.afectado').find('input[name="siniestro_afectado"]').val(strAux);
        contenedor.children('div.siniestro').children('div.ocultable-contenido').children('div.afectado').show();
        if (siniestro.afectado.observaciones && siniestro.afectado.observaciones != null && siniestro.afectado.observaciones != '') {
            strAux = siniestro.afectado.observaciones;
            contenedor.children('div.siniestro').children('div.ocultable-contenido').children('div.afectado').find('textarea[name="siniestro_afectado_observaciones"]').val(strAux);
        } else {
            contenedor.children('div.siniestro').children('div.ocultable-contenido').children('div.afectado').find('textarea[name="siniestro_afectado_observaciones"]').hide();
        }
    } else {
        contenedor.children('div.siniestro').children('div.ocultable-contenido').children('div.afectado').hide();
    }
    contenedor.children('div.botonera').find('button[name="replanificar"]').click(replanificar_click);
    contenedor.children('div.botonera').find('button[name="reasignar"]').click(reasignar_click);
    contenedor.children('div.botonera').find('button[name="volver"]').css({'border-color':colorBorde, 'background-color':colorFondo}).click(volver_click);
    contenedor.children('div.ocultable').children('div.ocultable-titulo').click(ocultable_click);
    informacion.find('a[name="siniestro_original_descargar"]').css({'border-color':colorBorde, 'background-color':colorFondo, 'color':colorBorde}).click(descargar_click);
    informacion.find('input[name="siniestro_numero"]').val(siniestro.numero);
    informacion.find('input[name="siniestro_fecha"]').val(siniestro.fechaRegistro.slice(0, siniestro.fechaRegistro.indexOf('T')));
    actualizar_estado_siniestro();
    $.get('http://localhost:8080/ReForms_Provider/wr/reasignacion/obtenerUltimaReasignacion/' + siniestro.id, respuesta_obtenerUltimaReasignacion, 'json');
    informacion.find('input[name="siniestro_albaran"]').val(siniestro.albaran);
    informacion.find('input[name="siniestro_original"]').val(siniestro.original.nombre);
    if (siniestro.observaciones && siniestro.observaciones != null && siniestro.observaciones != '') {
        informacion.siblings('div.observaciones').find('textarea[name="siniestro_observaciones"]').val(siniestro.observaciones);
        informacion.siblings('div.observaciones').show();
    } else {
        informacion.siblings('div.observaciones').hide();
    }
    contenedor_contactos.children('div.tabla').children('button[name="siniestro_contacto_nuevo"]').click(contacto_nuevo_click);
    contenedor_contactos.children('div.detalles').find('button[name="siniestro_contacto_editar"]').click(contacto_editar_click);
    contenedor_contactos.children('div.detalles').find('button[name="siniestro_contacto_borrar"]').click(contacto_borrar_click);
    contenedor_contactos.children('div.detalles').find('button[name="siniestro_contacto_aceptar"]').click(contacto_aceptar_click).hide();
    contenedor_contactos.children('div.detalles').find('button[name="siniestro_contacto_cancelar"]').click(contacto_cancelar_click).hide();
    contenedor_contactos.children('div.detalles').find('input[name="siniestro_contacto_telefono1"]').keyup(siniestro_contacto_telefono1_keyup);
    contenedor_adicional.find('button[name="participante_nuevo"]').click(participante_agregar_click);
    contenedor_adicional.find('button[name="recurso_nuevo"]').click(recurso_adjuntar_click);
    contenedor_adicional.find('button[name="adicional_participante_aceptar"]').click(adicional_participante_aceptar_click);
    contenedor_adicional.find('button[name="adicional_participante_cancelar"]').click(adicional_participante_cancelar_click);
    contenedor_adicional.children('div.recursos').find('select[name="recurso_tipo"]').change(recurso_tipo_change);
    $.get('http://localhost:8080/ReForms_Provider/wr/contacto/obtenerContactos/' + siniestro.id, respuesta_obtenerContactos, 'json');
    $.get('http://localhost:8080/ReForms_Provider/wr/participante/obtenerParticipantes/' + siniestro.id, respuesta_obtenerParticipantes, 'json');
    $.get('http://localhost:8080/ReForms_Provider/wr/replanificacion/obtenerReplanificaciones/' + siniestro.id, respuesta_obtenerReplanificaciones, 'json');
    $.get('http://localhost:8080/ReForms_Provider/wr/reasignacion/obtenerReasignaciones/' + siniestro.id, respuesta_obtenerReasignaciones, 'json');
    $.get('http://localhost:8080/ReForms_Provider/wr/recurso/obtenerRecursos/' + siniestro.id, respuesta_obtenerRecursos, 'json');
    
    // Inicializacion de aspecto y colores
    // ====================================================================== //
    $('#ventana').css('border-color', colorBorde);
    $('#ventana').css('background-color', colorFondo);
    contenedor.find('button.btn-nuevo').css({'border-color':colorBorde, 'background-color':colorFondo});
    contenedor.find('button.btn-editar').css({'border-color':colorBorde, 'background-color':colorFondo});
    contenedor.children('div.ocultable').css('border-color', colorBorde);
    contenedor.children('div.ocultable').children('div.ocultable-contenido').hide();
    contenedor.children('div.siniestro').children('div.ocultable-contenido').show();
    contenedor.children('div.siniestro').children('div.ocultable-titulo').find('div.estado').hide();
    contenedor.children('div.siniestro').children('div.ocultable-titulo').find('input[name="estado"]').css({'border-color':colorBorde, 'background-color':sinColor});
    contenedor.children('div.siniestro').children('div.ocultable-titulo').find('span.input-group-text').css({'border-color':colorBorde, 'background-color':colorFondo, 'font-size':'1.25em'});
    contenedor.children('div.adicional').find('table').children('thead').children('tr').css('background-color', colorBorde);
    contenedor_contactos.children('div.tabla').children('table').children('thead').children('tr').css('background-color', colorBorde);
    contenedor_contactos.children('div.detalles').children('div.contenedor').css('border-color', colorBorde);
    contenedor_adicional.children('div.recursos').children('div.recurso').children('div.contenedor').css('border-color', colorBorde);
    contenedor_adicional.children('div.row').children('div.participantes').children('div.participante').children('div.contenedor').css('border-color', colorBorde);
    contenedor_adicional.children('div.recursos').children('div.recurso').children('div.contenedor').children('div.descripcion').children('div.previualizacion').children('div.contenedor').css('border-color', colorBorde);
    contenedor.children('div.acciones').hide();
    contenedor_contactos.children('div.detalles').hide();
    contenedor_adicional.children('div.row').children('div.participantes').children('div.participante').hide();
    contenedor_adicional.children('div.recursos').children('div.recurso').hide();
});
