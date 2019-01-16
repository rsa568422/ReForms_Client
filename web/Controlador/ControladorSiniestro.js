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
        strAux, edicion = false;
    
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
    
    function actualizar_detalles_contacto() {
        var detalles = contenedor_contactos.children('div.detalles'),
            nombre = detalles.find('input[name="siniestro_contacto_nombre"]'),
            apellido1 = detalles.find('input[name="siniestro_contacto_apellido1"]'),
            apellido2 = detalles.find('input[name="siniestro_contacto_apellido2"]'),
            telefono1 = detalles.find('input[name="siniestro_contacto_telefono1"]'),
            telefono2 = detalles.find('input[name="siniestro_contacto_telefono2"]'),
            observaciones = detalles.find('textarea[name="siniestro_contacto_observaciones"]');
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
            telefono1.val(contactos.contactoSeleccionado.telefono1);
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
                        $.get('http://localhost:8080/ReForms_Provider/wr/contacto/obtenerContactos/' + siniestro.id, respuesta_contactos, 'json');
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
        $(this).siblings('button.btn-aceptar').hide();
        $(this).siblings('button.btn-editar').show();
        $(this).siblings('button.btn-borrar').show();
        contenedor_contactos.children('div.detalles').find('input').prop('readonly', true);
        contenedor_contactos.children('div.detalles').find('textarea').prop('readonly', true);
        if (contactos.contactoSeleccionado.id == null) {
            contenedor_contactos.children('div.detalles').hide();
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
                        $.get('http://localhost:8080/ReForms_Provider/wr/contacto/obtenerContactos/' + siniestro.id, respuesta_contactos, 'json');
                    },
                    error: function(jqXhr, textStatus, errorThrown){
                        alerta('Error en proveedor', 'no ha sido posible borrar el contacto');
                    }
                });
            }
        }
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
    
    function respuesta_contactos(data, status) {
        if (status == "success") {
            contactos.listaContactos = data;
            mostrar_contactos(contactos.listaContactos, contenedor_contactos.children('div.tabla').children('table').children('tbody'));
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
        strAux = siniestro.afectado.observaciones;
        contenedor.children('div.siniestro').children('div.ocultable-contenido').children('div.afectado').find('textarea[name="siniestro_afectado_observaciones"]').val(strAux);
        contenedor.children('div.siniestro').children('div.ocultable-contenido').children('div.afectado').show();
    } else {
        contenedor.children('div.siniestro').children('div.ocultable-contenido').children('div.afectado').hide();
    }
    contenedor.children('div.volver').find('button[name="volver"]').css({'border-color':colorBorde, 'background-color':colorFondo}).click(volver_click);
    contenedor.children('div.ocultable').children('div.ocultable-titulo').click(ocultable_click);
    informacion.find('a[name="siniestro_original_descargar"]').css({'border-color':colorBorde, 'background-color':colorFondo, 'color':colorBorde}).click(descargar_click);
    informacion.find('input[name="siniestro_numero"]').val(siniestro.numero);
    informacion.find('input[name="siniestro_fecha"]').val(siniestro.fechaRegistro.slice(0, siniestro.fechaRegistro.indexOf('T')));
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
    $.get('http://localhost:8080/ReForms_Provider/wr/perito/buscarPeritoReasignadoPorSiniestro/' + siniestro.id, function(data, status) {
        var nombre;
        if (status == "success") {
            nombre = data.nombre + ' ' + data.apellido1;
            informacion.find('input[name="siniestro_peritoActual"]').val(nombre);
            nombre = siniestro.peritoOriginal.nombre + ' ' + siniestro.peritoOriginal.apellido1;
            informacion.find('input[name="siniestro_peritoOriginal"]').val(nombre).parent('div.form-group').show();
        } else {
            nombre = siniestro.peritoOriginal.nombre + ' ' + siniestro.peritoOriginal.apellido1;
            informacion.find('input[name="siniestro_peritoActual"]').val(nombre);
            informacion.find('input[name="siniestro_peritoOriginal"]').parent('div.form-group').hide();
        }
    }, 'json');
    informacion.find('input[name="siniestro_estado"]').val(strAux);
    informacion.find('input[name="siniestro_albaran"]').val(siniestro.albaran);
    informacion.find('input[name="siniestro_original"]').val(siniestro.original.nombre);
    contenedor_contactos.children('div.tabla').children('button[name="siniestro_contacto_nuevo"]').css({'border-color':colorBorde, 'background-color':colorFondo}).click(contacto_nuevo_click);
    contenedor_contactos.children('div.detalles').find('button[name="siniestro_contacto_editar"]').css({'border-color':colorBorde, 'background-color':colorFondo}).click(contacto_editar_click);
    contenedor_contactos.children('div.detalles').find('button[name="siniestro_contacto_borrar"]').click(contacto_borrar_click);
    contenedor_contactos.children('div.detalles').find('button[name="siniestro_contacto_aceptar"]').click(contacto_aceptar_click).hide();
    contenedor_contactos.children('div.detalles').find('button[name="siniestro_contacto_cancelar"]').click(contacto_cancelar_click).hide();
    $.get('http://localhost:8080/ReForms_Provider/wr/contacto/obtenerContactos/' + siniestro.id, respuesta_contactos, 'json');
    
    // Inicializacion de aspecto y colores
    // ====================================================================== //
    $('#ventana').css('border-color', colorBorde);
    $('#ventana').css('background-color', colorFondo);
    contenedor.children('div.ocultable').css('border-color', colorBorde);
    contenedor.children('div.ocultable').children('div.ocultable-contenido').hide();
    contenedor.children('div.siniestro').children('div.ocultable-contenido').show();
    contenedor_contactos.children('div.tabla').children('table').children('thead').children('tr').css('background-color', colorBorde);
    contenedor_contactos.children('div.detalles').children('div.contenedor').css('border-color', colorBorde);
    contenedor_contactos.children('div.detalles').hide();
});
