$(document).ready(function() {

    // Variables
    // ====================================================================== //
    var googleKey = sessionStorage.googleKey,
        colorBorde = $('#btn-siniestros').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.1)',
        sinColor = 'rgb(0, 0, 0, 0)',
        componentes = {
            'progreso': {
                'barra': $('#ventana').children('div.container-fluid').children('div.progreso').children('div.col-12').children('div.progress').children('div.progress-bar'),
                'paso': $('#ventana').children('div.container-fluid').children('div.progreso').children('div.col-12').children('span.badge'),
                'porcentaje': 0
            },
            'pasos': {
                'paso1': {
                    'logos': $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso1').children('div.row').children('div.col-12').children('div.logos'),
                    'numero_siniestro': $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso1').children('div.row').children('div.col-12').children('input[name="numero_siniestro"]'),
                    'info': $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso1').children('div.row').children('div.col-12').children('h6.info')
                },
                'paso2': {
                    'numero_poliza': $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso2').children('div.numero-poliza').children('input[name="numero_poliza"]'),
                    'info': $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso2').children('div.numero-poliza').children('h6.info'),
                    'poliza': {
                        'contenedor': $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso2').children('div.info-poliza'),
                        'asegurado': null,
                        'propiedad': null
                    }
                },
                'paso3': {
                    
                }
            },
            'botones': $('#ventana').children('div.container-fluid').children('div.botones').children('div.col-6')
        },
        pasos = {
            'actual': 1,
            'paso1': {
                'numero_siniestro': '',
                'listaAseguradoras': [],
                'aseguradoraSeleccionada': localStorage.aseguradoraPredeterminada ? JSON.parse(localStorage.aseguradoraPredeterminada) : null
            },
            'paso2': {
                'numero_poliza': '',
                'poliza': null,
                'listaClientes': [],
                'listaPropiedades': [],
                'listaCoincidencias': [],
                'cliente': {
                    'nombre': false,
                    'apellido1': false,
                    'telefono1': false
                },
                'propiedad': {
                    'direccion': false,
                    'numero': false,
                    'localidad': false
                }
            },
            'paso3': {
                'listaPeritos': [],
                'peritoSeleccionado': null,
                'original': null,
                'fecha': ''
            }
        };
    
    // Funciones auxiliares
    // ====================================================================== //
    function alerta(titulo, mensaje) {
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-header').children('div.modal-title').html(titulo);
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-body').html(mensaje);
        $('#activador-alerta').click();
    }
    
    function telefono_valido(telefonoStr) {
        return /^[69]\d{8}$/.test(telefonoStr);
    }
    
    function cp_valido(cpStr) {
        return /^\d{5}$/.test(cpStr);
    }
    
    function test(obj) {
        var x, res = true;
        for (x in obj) {
            res &= obj[x];
        }
        return res;
    }
    
    function generarLogo(aseguradora) {
        return i = '<img class="logo" src="data:image/gif;base64,' + aseguradora.logo + '" width="480" height="360" alt="' + aseguradora.nombre + '"/>';
    }
    
    function generarMapa(lat, long) {
        var funcion = '<script>function cargarMapa() { var propiedades = { center: new google.maps.LatLng(' + lat + ', ' + long + '), zoom: 18 }, mapa = new google.maps.Map(document.getElementById("googleMap"), propiedades), marcador = new google.maps.Marker({position: propiedades.center}); marcador.setMap(mapa); }</script>',
            script = '<script src="https://maps.googleapis.com/maps/api/js?key=' + googleKey + '&callback=cargarMapa"></script>',
            mapa  = '<div id="googleMap" style="width:100%;height:400px;"></div>';
        return '<div class="mapaGoogle">' + funcion + script + mapa + '</div>';
    }
    
    function mostrar_aseguradoras(div) {
        var i, logo;
        for (i = 0; i < pasos.paso1.listaAseguradoras.length; i++) {
            logo = generarLogo(pasos.paso1.listaAseguradoras[i]);
            if (pasos.paso1.aseguradoraSeleccionada != null && pasos.paso1.aseguradoraSeleccionada.id == pasos.paso1.listaAseguradoras[i].id) {
                div.children('.seleccionada').removeClass('seleccionada');
                logo = logo.replace('class="logo"', 'class="logo seleccionada"');
                componentes.progreso.porcentaje = 5;
                componentes.progreso.barra.animate({width: '5%'}, 'fast');
                componentes.pasos.paso1.numero_siniestro.prop('readonly', false);
                componentes.pasos.paso1.numero_siniestro.focus();
            }
            div.append(logo);
        }
        div.children('.logo').css("border-color", colorBorde).click(logo_click);
    }
    
    function mostrar_sugerencias_cliente() {
        var i, fila, nombre, telefono,
            tbody = componentes.pasos.paso2.poliza.asegurado.children('div.sugerencias').children('div.col-12').children('div.table-responsive-md').children('table').children('tbody');
        tbody.children('tr.cliente').remove();
        for (i = 0; i < pasos.paso2.listaClientes.length; i++) {
            nombre = pasos.paso2.listaClientes[i].nombre + ' ' + pasos.paso2.listaClientes[i].apellido1;
            if (pasos.paso2.listaClientes[i].apellido2 && pasos.paso2.listaClientes[i].apellido2 != null && pasos.paso2.listaClientes[i].apellido2 != '') {
                nombre += ' ' + pasos.paso2.listaClientes[i].apellido2;
            }
            telefono = pasos.paso2.listaClientes[i].telefono1;
            if (pasos.paso2.listaClientes[i].telefono2 && pasos.paso2.listaClientes[i].telefono2 != null && pasos.paso2.listaClientes[i].telefono2 != '') {
                telefono += ' / ' + pasos.paso2.listaClientes[i].telefono2;
            }
            fila = '<tr class="cliente"><td>' + nombre + '</td><td>' + telefono + '</td></tr>';
            tbody.append(fila);
        }
        tbody.children('tr.cliente').click(cliente_click);
    }
    
    function mostrar_sugerencias_propiedad() {
        var i, fila, direccion, localidad,
            tbody = componentes.pasos.paso2.poliza.propiedad.children('div.sugerencias').children('div.col-12').children('div.table-responsive-md').children('table').children('tbody'),
            tfoot = componentes.pasos.paso2.poliza.propiedad.children('div.sugerencias').children('div.col-12').children('div.table-responsive-md').children('table').children('tfoot');
        tbody.children('tr.propiedad').remove();
        for (i = 0; i < pasos.paso2.listaPropiedades.length; i++) {
            direccion = pasos.paso2.listaPropiedades[i].direccion + ', ' + pasos.paso2.listaPropiedades[i].numero;
            localidad = pasos.paso2.listaPropiedades[i].localidad.nombre + ' [ ' + pasos.paso2.listaPropiedades[i].localidad.cp + ' ]';
            if (pasos.paso2.listaPropiedades[i].piso && pasos.paso2.listaPropiedades[i].piso != null && pasos.paso2.listaPropiedades[i].piso != '') {
                fila = '<tr class="propiedad"><td>' + direccion + '</td><td>' + pasos.paso2.listaPropiedades[i].piso + '</td><td>' + localidad + '</td></tr>';
            } else {
                fila = '<tr class="propiedad"><td colspan="2">' + direccion + '</td><td>' + localidad + '</td></tr>';
            }
            tbody.append(fila);
        }
        tfoot.children('tr.coincidencia').remove();
        for (i = 0; i < pasos.paso2.listaCoincidencias.length; i++) {
            direccion = pasos.paso2.listaCoincidencias[i].direccion + ', ' + pasos.paso2.listaCoincidencias[i].numero;
            localidad = pasos.paso2.listaCoincidencias[i].localidad.nombre + ' [ ' + pasos.paso2.listaCoincidencias[i].localidad.cp + ' ]';
            fila = '<tr class="coincidencia"><td colspan="2">' + direccion + '</td><td>' + localidad + '</td></tr>';
            tfoot.append(fila);
        }
        tbody.children('tr.propiedad').click(propiedad_click);
        tfoot.children('tr.coincidencia').click(propiedad_click);
    }
    
    // Funciones controladoras para componentes
    // ====================================================================== //
    function logo_click() {
        if (pasos.paso1.aseguradoraSeleccionada != null && pasos.paso1.aseguradoraSeleccionada.id == pasos.paso1.listaAseguradoras[$(this).index()].id) {
            componentes.progreso.porcentaje = 0;
            componentes.progreso.barra.animate({width: '0px'}, 'fast');
            pasos.paso1.aseguradoraSeleccionada = null;
            $(this).removeClass("seleccionada");
            componentes.pasos.paso1.numero_siniestro.prop('readonly', true);
        } else {
            if (pasos.paso1.aseguradoraSeleccionada == null) {
                componentes.progreso.porcentaje = 5;
                componentes.progreso.barra.animate({width: '5%'}, 'fast');
            }
            pasos.paso1.aseguradoraSeleccionada = pasos.paso1.listaAseguradoras[$(this).index()];
            $(this).siblings(".seleccionada").removeClass("seleccionada");
            $(this).addClass("seleccionada");
            componentes.pasos.paso1.numero_siniestro.prop('readonly', false);
        }
        componentes.pasos.paso1.numero_siniestro.val('').focus();
        componentes.pasos.paso1.numero_siniestro.keyup();
    }
    
    function aceptar_click() {
        alert('aceptar_click()');
    }
    
    function continuar_click() {
        if (pasos.actual == 1) {
            $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso').not('div.paso3').slideToggle();
            componentes.botones.children('button.btn-cancelar').toggle();
            componentes.botones.children('button.btn-volver').toggle();
            componentes.progreso.paso.text('Paso 2').animate({'margin-left': '10%'}, 'fast');
            if (pasos.paso2.poliza == null || pasos.paso2.poliza.cliente == null || pasos.paso2.poliza.propiedad == null) {
                componentes.botones.children('button.btn-continuar').prop('disabled', true);
            }
            pasos.actual = 2;
        } else if (pasos.actual == 2) {
            $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso').not('div.paso1').slideToggle();
            componentes.botones.children('button.btn-continuar').toggle();
            componentes.botones.children('button.btn-aceptar').toggle();
            componentes.progreso.paso.text('Paso 3').animate({'margin-left': '80%'}, 'fast');
            pasos.actual = 3;
        }
    }
    
    function volver_click() {
        if (pasos.actual == 2) {
            $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso').not('div.paso3').slideToggle();
            componentes.botones.children('button.btn-cancelar').toggle();
            componentes.botones.children('button.btn-volver').toggle();
            componentes.progreso.paso.text('Paso 1').animate({'margin-left': '0px'}, 'fast');
            pasos.actual = 1;
        } else if (pasos.actual == 3) {
            $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso').not('div.paso1').slideToggle();
            componentes.botones.children('button.btn-continuar').toggle();
            componentes.botones.children('button.btn-aceptar').toggle();
            componentes.progreso.paso.text('Paso 2').animate({'margin-left': '10%'}, 'fast');
            pasos.actual = 2;
        }
        componentes.botones.children('button.btn-continuar').prop('disabled', false);
    }
    
    function cancelar_click() {
        $('#btn-siniestros').click();
    }
    
    function cliente_click() {
        var detalles = componentes.pasos.paso2.poliza.asegurado.children('div.detalles'),
            nombre = componentes.pasos.paso2.poliza.asegurado.children('div.nombre').children('div.col-12').children('div.form-group').children('input.nombre'),
            apellido1 = componentes.pasos.paso2.poliza.asegurado.children('div.apellidos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.apellido1'),
            apellido2 = componentes.pasos.paso2.poliza.asegurado.children('div.apellidos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.apellido2'),
            telefono1 = componentes.pasos.paso2.poliza.asegurado.children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.telefono1'),
            telefono2 = componentes.pasos.paso2.poliza.asegurado.children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.telefono2'),
            tipo = componentes.pasos.paso2.poliza.asegurado.children('div.tipo').children('div.col-12').children('div.form-group').children('select.tipo'),
            observaciones = componentes.pasos.paso2.poliza.asegurado.children('div.observaciones').children('div.col-12').children('div.form-group').children('textarea.observaciones-cliente');
        if (pasos.paso2.poliza.cliente == null || pasos.paso2.poliza.cliente.id != pasos.paso2.listaClientes[$(this).index()].id) {
            pasos.paso2.poliza.cliente = pasos.paso2.listaClientes[$(this).index()];
            $(this).css('background-color', colorFondo);
            $(this).siblings('tr.cliente').css('background-color', sinColor);
            nombre.prop('readonly', true).val(pasos.paso2.poliza.cliente.nombre);
            apellido1.prop('readonly', true).val(pasos.paso2.poliza.cliente.apellido1);
            if (pasos.paso2.poliza.cliente.apellido2 && pasos.paso2.poliza.cliente.apellido2 != null && pasos.paso2.poliza.cliente.apellido2 != '') {
                apellido2.prop('readonly', true).val(pasos.paso2.poliza.cliente.apellido1);
            } else {
                apellido2.prop('readonly', true).val('');
            }
            telefono1.prop('readonly', true).val(pasos.paso2.poliza.cliente.telefono1);
            if (pasos.paso2.poliza.cliente.telefono2 && pasos.paso2.poliza.cliente.telefono2 != null && pasos.paso2.poliza.cliente.telefono2 != '') {
                telefono2.prop('readonly', true).val(pasos.paso2.poliza.cliente.telefono2);
            } else {
                telefono2.prop('readonly', true).val('');
            }
            tipo.prop('disabled', true).val(pasos.paso2.poliza.cliente.tipo);
            if (pasos.paso2.poliza.cliente.observaciones && pasos.paso2.poliza.cliente.observaciones != null && pasos.paso2.poliza.cliente.observaciones != '') {
                observaciones.prop('readonly', true).val(pasos.paso2.poliza.cliente.observaciones);
            } else {
                observaciones.prop('readonly', true).val('');
            }
            detalles.show();
        } else {
            pasos.paso2.poliza.cliente = null;
            pasos.paso2.cliente.nombre = false;
            pasos.paso2.cliente.apellido1 = false;
            pasos.paso2.cliente.telefono1 = false;
            $(this).css('background-color', sinColor);
            $(this).siblings('tr.cliente').css('background-color', sinColor);
            nombre.prop('readonly', false).val('');
            apellido1.prop('readonly', false).val('');
            apellido2.prop('readonly', false).val('');
            telefono1.prop('readonly', false).val('');
            telefono2.prop('readonly', false).val('');
            tipo.prop('disabled', false).val(0);
            observaciones.prop('readonly', false).val('');
            detalles.hide();
        }
        if (pasos.paso2.poliza.cliente != null && pasos.paso2.poliza.propiedad != null) {
            componentes.botones.children('button.btn-continuar').prop('disabled', false);
        } else {
            componentes.botones.children('button.btn-continuar').prop('disabled', true);
        }
    }
    
    function propiedad_click() {
        var detalles = componentes.pasos.paso2.poliza.propiedad.children('div.detalles'),
            tbody = componentes.pasos.paso2.poliza.propiedad.children('div.sugerencias').children('div.col-12').children('div.table-responsive-md').children('table').children('tbody'),
            tfoot = componentes.pasos.paso2.poliza.propiedad.children('div.sugerencias').children('div.col-12').children('div.table-responsive-md').children('table').children('tfoot');
        tbody.children('tr.propiedad').css('background-color', sinColor);
        tfoot.children('tr.coincidencia').css('background-color', sinColor);
        if ($(this).hasClass('propiedad')) {
            if (pasos.paso2.poliza.propiedad == null || pasos.paso2.poliza.propiedad.id != pasos.paso2.listaPropiedades[$(this).index()].id) {
                pasos.paso2.poliza.propiedad = pasos.paso2.listaPropiedades[$(this).index()];
                $(this).css('background-color', colorFondo);
                detalles.show();
            } else {
                pasos.paso2.poliza.propiedad = null;
                detalles.hide();
            }
        } else {
            if (pasos.paso2.poliza.propiedad == null || pasos.paso2.poliza.propiedad.id != pasos.paso2.listaCoincidencias[$(this).index()].id) {
                pasos.paso2.poliza.propiedad = pasos.paso2.listaCoincidencias[$(this).index()];
                $(this).css('background-color', colorFondo);
                detalles.show();
            } else {
                pasos.paso2.poliza.propiedad = null;
                detalles.hide();
            }
        }
        if (pasos.paso2.poliza.cliente != null && pasos.paso2.poliza.propiedad != null) {
            componentes.botones.children('button.btn-continuar').prop('disabled', false);
        } else {
            componentes.botones.children('button.btn-continuar').prop('disabled', true);
        }
    }
    
    function numero_siniestro_keyup() {
        if (componentes.pasos.paso1.numero_siniestro.val() != '') {
            if (pasos.paso1.numero_siniestro == '') {
                componentes.progreso.porcentaje = 10;
                componentes.progreso.barra.animate({width: '10%'}, 'fast');
            }
            $.get('http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroSiniestro/0/' + pasos.paso1.aseguradoraSeleccionada.id + '///' + componentes.pasos.paso1.numero_siniestro.val(), function(data, status) {
                if (status == 'success') {
                    componentes.pasos.paso1.info.css('color', 'red').text('ya registrado');
                    if (confirm('el siniestro ' + componentes.pasos.paso1.numero_siniestro.val() + ' ya esta registrado con ' + pasos.paso1.aseguradoraSeleccionada.nombre + '\n\n¿desea consultar dicho siniestro?')) {
                        sessionStorage.setItem('siniestro', JSON.stringify(data[0]));
                        $('#contenido').load('Html/siniestro.html', cargar_siniestro);
                    } else {
                        componentes.botones.children('button.btn-continuar').prop('disabled', true);
                    }
                } else {
                    componentes.pasos.paso1.info.css('color', 'green').text('disponible');
                    componentes.botones.children('button.btn-continuar').prop('disabled', false);
                }
            }, 'json');
        } else {
            componentes.progreso.porcentaje = pasos.paso1.aseguradoraSeleccionada != null ? 5 : 0;
            componentes.progreso.barra.animate({width: componentes.progreso.porcentaje + '%'}, 'fast');
            componentes.botones.children('button.btn-continuar').prop('disabled', true);
            componentes.pasos.paso1.info.text('');
        }
        if (pasos.paso2.numero_poliza != '') {
            componentes.pasos.paso2.numero_poliza.val('').keyup();
        }
        pasos.paso1.numero_siniestro = componentes.pasos.paso1.numero_siniestro.val();
    }
    
    function numero_poliza_keyup() {
        if (componentes.pasos.paso2.numero_poliza.val() != '') {
            $.get('http://localhost:8080/ReForms_Provider/wr/poliza/buscarPolizaPorNumeroPoliza/' + pasos.paso1.aseguradoraSeleccionada.id + '/' + componentes.pasos.paso2.numero_poliza.val(), function(data, status) {
                if (status == 'success') {
                    if (data.length > 0) {
                        pasos.paso2.poliza = data[0];
                        pasos.paso2.cliente.nombre = true;
                        pasos.paso2.cliente.apellido1 = true;
                        pasos.paso2.cliente.telefono1 = true;
                        pasos.paso2.propiedad.direccion = true;
                        pasos.paso2.propiedad.numero = true;
                        pasos.paso2.propiedad.localidad = true;
                        componentes.pasos.paso2.info.css('color', 'orange').text('ya registrada');
                        componentes.pasos.paso2.poliza.contenedor.load('Html/editarpoliza.html', cargar_editarpoliza_vista);
                        componentes.progreso.porcentaje = 80;
                        componentes.progreso.barra.animate({width: '80%'}, 'fast');
                        componentes.botones.children('button.btn-continuar').prop('disabled', false);
                        componentes.pasos.paso2.poliza.contenedor.show();
                    } else {
                        pasos.paso2.poliza = new Poliza();
                        pasos.paso2.cliente.nombre = false;
                        pasos.paso2.cliente.apellido1 = false;
                        pasos.paso2.cliente.telefono1 = false;
                        pasos.paso2.propiedad.direccion = false;
                        pasos.paso2.propiedad.numero = false;
                        pasos.paso2.propiedad.localidad = false;
                        componentes.pasos.paso2.info.css('color', 'green').text('disponible');
                        componentes.pasos.paso2.poliza.contenedor.load('Html/editarpoliza.html', cargar_editarpoliza_edicion);
                        if (componentes.progreso.porcentaje != 15) {
                            componentes.progreso.porcentaje = 15;
                            componentes.progreso.barra.animate({width: '15%'}, 'fast');
                        }
                        componentes.botones.children('button.btn-continuar').prop('disabled', true);
                        componentes.pasos.paso2.poliza.contenedor.show();
                    }
                } else {
                    alert('fallo en el proveedor');
                    componentes.progreso.porcentaje = 10;
                    componentes.progreso.barra.animate({width: '10%'}, 'fast');
                    componentes.pasos.paso2.info.text('');
                    pasos.paso2.poliza = null;
                    pasos.paso2.cliente.nombre = false;
                    pasos.paso2.cliente.apellido1 = false;
                    pasos.paso2.cliente.telefono1 = false;
                    pasos.paso2.propiedad.direccion = false;
                    pasos.paso2.propiedad.numero = false;
                    pasos.paso2.propiedad.localidad = false;
                    componentes.botones.children('button.btn-continuar').prop('disabled', true);
                    componentes.pasos.paso2.poliza.contenedor.hide();
                }
            }, 'json');
        } else {
            if (pasos.paso1.aseguradoraSeleccionada != null) {
                if (componentes.pasos.paso1.numero_siniestro.val() != '') {
                    componentes.progreso.porcentaje = 10;
                    componentes.progreso.barra.animate({width: '10%'}, 'fast');
                } else {
                    componentes.progreso.porcentaje = 5;
                    componentes.progreso.barra.animate({width: '5%'}, 'fast');
                }
            } else {
                componentes.progreso.porcentaje = 0;
                componentes.progreso.barra.animate({width: '0px'}, 'fast');
            }
            componentes.pasos.paso2.info.text('');
            pasos.paso2.poliza = null;
            componentes.botones.children('button.btn-continuar').prop('disabled', true);
            componentes.pasos.paso2.poliza.contenedor.hide();
        }
        pasos.paso2.numero_poliza = componentes.pasos.paso2.numero_poliza.val();
    }
    
    function editarpoliza_cliente_keyup() {
        if ($(this).hasClass('nombre')) {
            if ($(this).val() != '') {
                pasos.paso2.cliente.nombre = true;
            } else {
                pasos.paso2.cliente.nombre = false;
            }
        } else if ($(this).hasClass('apellido1')) {
            if ($(this).val() != '') {
                pasos.paso2.cliente.apellido1 = true;
            } else {
                pasos.paso2.cliente.apellido1 = false;
            }
        } else if ($(this).hasClass('telefono1')) {
            if (telefono_valido($(this).val())) {
                pasos.paso2.cliente.telefono1 = true;
            } else {
                pasos.paso2.cliente.telefono1 = false;
            }
        }
        if (test(pasos.paso2.cliente)) {
            var nombre = componentes.pasos.paso2.poliza.asegurado.children('div.nombre').children('div.col-12').children('div.form-group').children('input.nombre').val(),
                apellido1 = componentes.pasos.paso2.poliza.asegurado.children('div.apellidos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.apellido1').val(),
                apellido2 = componentes.pasos.paso2.poliza.asegurado.children('div.apellidos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.apellido2').val(),
                telefono1 = componentes.pasos.paso2.poliza.asegurado.children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.telefono1').val(),
                telefono2 = componentes.pasos.paso2.poliza.asegurado.children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.telefono2').val(),
                ruta = 'http://localhost:8080/ReForms_Provider/wr/cliente/buscarCoincidenciasCliente/' + pasos.paso1.aseguradoraSeleccionada.id + '/' + nombre + '/' + apellido1 + '/' + apellido2 + '/' + telefono1 + '/' + telefono2;
            $.get(ruta, function(data, status) {
                if (status == 'success') {
                    pasos.paso2.listaClientes = data;
                    if (pasos.paso2.listaClientes.length > 0) {
                        pasos.paso2.poliza.cliente = null;
                        mostrar_sugerencias_cliente();
                        componentes.pasos.paso2.poliza.asegurado.children('div.sugerencias').show();
                    } else {
                        pasos.paso2.poliza.cliente = new Cliente();
                        componentes.pasos.paso2.poliza.asegurado.children('div.sugerencias').hide();
                        if (pasos.paso2.poliza.propiedad != null) {
                            componentes.botones.children('button.btn-continuar').prop('disabled', false);
                        }
                    }
                } else {
                    alert('fallo en el proveedor');
                }
                componentes.pasos.paso2.poliza.asegurado.children('div.detalles').hide();
            }, 'json');
        } else {
            componentes.pasos.paso2.poliza.asegurado.children('div.sugerencias').hide();
            componentes.pasos.paso2.poliza.asegurado.children('div.detalles').hide();
        }
    }
    
    function editarpoliza_propiedad_keyup() {
        if ($(this).hasClass('cp')) {
            if ($(this).val() != '') {
                pasos.paso2.propiedad.localidad = true;
            } else {
                pasos.paso2.propiedad.localidad = false;
            }
        } else if ($(this).hasClass('direccion')) {
            if ($(this).val() != '') {
                pasos.paso2.propiedad.direccion = true;
            } else {
                pasos.paso2.propiedad.direccion = false;
            }
        } else if ($(this).hasClass('numero')) {
            if ($(this).val() != '') {
                pasos.paso2.propiedad.numero = true;
            } else {
                pasos.paso2.propiedad.numero = false;
            }
        }
        if (test(pasos.paso2.propiedad)) {
            var cp = componentes.pasos.paso2.poliza.propiedad.children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.cp'),
                nombre = componentes.pasos.paso2.poliza.propiedad.children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.nombre'),
                direccion = componentes.pasos.paso2.poliza.propiedad.children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.direccion'),
                numero = componentes.pasos.paso2.poliza.propiedad.children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.numero'),
                piso = componentes.pasos.paso2.poliza.propiedad.children('div.piso').children('div.col-12').children('div.form-group').children('input.piso'),
                ruta = 'http://localhost:8080/ReForms_Provider/wr/propiedad/buscarCoincidenciasPropiedad/' + cp.val() + '/' + direccion.val() + '/' + numero.val() + '/' + piso.val();
            nombre.prop('readonly', true);
            $.get(ruta, function(data, status) {
                if (status == 'success') {
                    var direccion_completa = direccion.val() + ' ' + numero.val() + ', ' + cp.val();
                    pasos.paso2.listaPropiedades = data;
                    pasos.paso2.poliza.propiedad = null;
                    $.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + direccion_completa + '&key=' + googleKey, function(data) {
                        if (data.results.length > 0) {
                            var i, j, k, p;
                            pasos.paso2.listaCoincidencias = [];
                            for (i = 0; i < data.results.length; i++) {
                                p = new Propiedad();
                                p.id = -i;
                                p.localidad = new Localidad();
                                for (j = 0; j < data.results[i].address_components.length; j++) {
                                    for (k = 0; k < data.results[i].address_components[j].types.length; k++) {
                                        switch (data.results[i].address_components[j].types[k]) {
                                            case 'route': p.direccion = data.results[i].address_components[j].short_name; break;
                                            case 'street_number': p.numero = data.results[i].address_components[j].short_name; break;
                                            case 'locality': p.localidad.nombre = data.results[i].address_components[j].short_name; break;
                                            case 'postal_code': p.localidad.cp = data.results[i].address_components[j].short_name; break;
                                        }
                                    }
                                }
                                p.geolat = data.results[i].geometry.location.lat;
                                p.geolong = data.results[i].geometry.location.lng;
                                if (p.direccion != null && p.direccion != '' && p.numero != null && p.numero != '' && p.localidad.nombre != null && p.localidad.nombre != '' && p.localidad.cp != null && p.localidad.cp != '') {
                                    pasos.paso2.listaCoincidencias.push(p); 
                                }
                            }
                            mostrar_sugerencias_propiedad();
                            componentes.pasos.paso2.poliza.propiedad.children('div.sugerencias').show();
                            componentes.pasos.paso2.poliza.propiedad.children('div.detalles').hide();
                        }
                    }, 'json');
                } else {
                    alert('fallo en el proveedor');
                    componentes.pasos.paso2.poliza.propiedad.children('div.sugerencias').hide();
                    componentes.pasos.paso2.poliza.propiedad.children('div.detalles').hide();
                }
            }, 'json');
        } else {
            componentes.pasos.paso2.poliza.propiedad.children('div.sugerencias').hide();
            componentes.pasos.paso2.poliza.propiedad.children('div.detalles').hide();
        }
    }
    
    function cp_keyup() {
        var nombre = componentes.pasos.paso2.poliza.propiedad.children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.nombre');
        if ($(this).prop('validity').valid && cp_valido($(this).val())) {
            $.get('http://localhost:8080/ReForms_Provider/wr/localidad/buscarLocalidadPorCodigoPostal/' + $(this).val(), function(data, status) {
                if (status == 'success') {
                    nombre.prop('readonly', true).val(data.nombre);
                } else {
                    nombre.prop('readonly', false).val('');
                }
            }, 'json');
        } else {
            nombre.prop('readonly', true).val('');
        }
    }
    
    // Funciones para cargar paginas y definir su comportamiento
    // ====================================================================== //
    function cargar_siniestro(responseTxt, statusTxt) {
        if (statusTxt != 'success') {
            alerta('Error 404', 'no se pudo cargar siniestro.html');
            sessionStorage.removeItem('siniestro');
        }
    }
    
    function cargar_editarpoliza_vista(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            componentes.pasos.paso2.poliza.asegurado = componentes.pasos.paso2.poliza.contenedor.children('div.marco-poliza').children('div.info').children('div.asegurado');
            componentes.pasos.paso2.poliza.propiedad = componentes.pasos.paso2.poliza.contenedor.children('div.marco-poliza').children('div.info').children('div.propiedad');
            componentes.pasos.paso2.poliza.asegurado.children('div.nombre').children('div.col-12').children('div.form-group').children('input.nombre').prop('readonly', true).val(pasos.paso2.poliza.cliente.nombre);
            componentes.pasos.paso2.poliza.asegurado.children('div.apellidos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.apellido1').prop('readonly', true).val(pasos.paso2.poliza.cliente.apellido1);
            componentes.pasos.paso2.poliza.asegurado.children('div.apellidos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.apellido2').prop('readonly', true).val(pasos.paso2.poliza.cliente.apellido2);
            componentes.pasos.paso2.poliza.asegurado.children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.telefono1').prop('readonly', true).val(pasos.paso2.poliza.cliente.telefono1);
            componentes.pasos.paso2.poliza.asegurado.children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.telefono2').prop('readonly', true).val(pasos.paso2.poliza.cliente.telefono2);
            componentes.pasos.paso2.poliza.asegurado.children('div.tipo').children('div.col-12').children('div.form-group').children('select.tipo').prop('disabled', true).val(pasos.paso2.poliza.cliente.tipo);
            componentes.pasos.paso2.poliza.asegurado.children('div.observaciones').children('div.col-12').children('div.form-group').children('textarea.observaciones-cliente').prop('readonly', true).val(pasos.paso2.poliza.cliente.observaciones);
            componentes.pasos.paso2.poliza.propiedad.children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.cp').prop('readonly', true).val(pasos.paso2.poliza.propiedad.localidad.cp);
            componentes.pasos.paso2.poliza.propiedad.children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.nombre').prop('readonly', true).val(pasos.paso2.poliza.propiedad.localidad.nombre);
            componentes.pasos.paso2.poliza.propiedad.children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.direccion').prop('readonly', true).val(pasos.paso2.poliza.propiedad.direccion);
            componentes.pasos.paso2.poliza.propiedad.children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.numero').prop('readonly', true).val(pasos.paso2.poliza.propiedad.numero);
            componentes.pasos.paso2.poliza.propiedad.children('div.piso').children('div.col-12').children('div.form-group').children('input.piso').prop('readonly', true).val(pasos.paso2.poliza.cliente.telefono2);
            componentes.pasos.paso2.poliza.propiedad.children('div.observaciones').children('div.col-12').children('div.form-group').children('textarea.observaciones-propiedad').prop('readonly', true).val(pasos.paso2.poliza.propiedad.observaciones);
            componentes.pasos.paso2.poliza.asegurado.children('div.sugerencias').children('div.col-12').children('div.table-responsive-md').children('table').children('thead').css('background-color', colorBorde);
            componentes.pasos.paso2.poliza.propiedad.children('div.sugerencias').children('div.col-12').children('div.table-responsive-md').children('table').children('thead').css('background-color', colorBorde);
            componentes.pasos.paso2.poliza.asegurado.children('div.sugerencias').hide();
            componentes.pasos.paso2.poliza.propiedad.children('div.sugerencias').hide();
            componentes.pasos.paso2.poliza.asegurado.children('div.detalles').hide();
            componentes.pasos.paso2.poliza.propiedad.children('div.detalles').hide();
            componentes.pasos.paso2.poliza.contenedor.children('div.marco-poliza').children('div.mapa').children('div.col-12').append(generarMapa(pasos.paso2.poliza.propiedad.geolat, pasos.paso2.poliza.propiedad.geolong));
        } else {
            alerta('Error 404', 'no se pudo cargar editarpoliza.html');
            sessionStorage.removeItem('siniestro');
        }
    }
        
    function cargar_editarpoliza_edicion(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            componentes.pasos.paso2.poliza.asegurado = componentes.pasos.paso2.poliza.contenedor.children('div.marco-poliza').children('div.info').children('div.asegurado');
            componentes.pasos.paso2.poliza.propiedad = componentes.pasos.paso2.poliza.contenedor.children('div.marco-poliza').children('div.info').children('div.propiedad');
            componentes.pasos.paso2.poliza.asegurado.children('div.nombre').children('div.col-12').children('div.form-group').children('input.nombre').keyup(editarpoliza_cliente_keyup);
            componentes.pasos.paso2.poliza.asegurado.children('div.apellidos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.apellido1').keyup(editarpoliza_cliente_keyup);
            componentes.pasos.paso2.poliza.asegurado.children('div.apellidos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.apellido2').keyup(editarpoliza_cliente_keyup);
            componentes.pasos.paso2.poliza.asegurado.children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.telefono1').keyup(editarpoliza_cliente_keyup);
            componentes.pasos.paso2.poliza.asegurado.children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.telefono2').keyup(editarpoliza_cliente_keyup);
            componentes.pasos.paso2.poliza.propiedad.children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.cp').keyup(editarpoliza_propiedad_keyup);
            componentes.pasos.paso2.poliza.propiedad.children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.cp').keyup(cp_keyup);
            componentes.pasos.paso2.poliza.propiedad.children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.direccion').keyup(editarpoliza_propiedad_keyup);
            componentes.pasos.paso2.poliza.propiedad.children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.numero').keyup(editarpoliza_propiedad_keyup);
            componentes.pasos.paso2.poliza.propiedad.children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.numero').click(editarpoliza_propiedad_keyup);
            componentes.pasos.paso2.poliza.propiedad.children('div.piso').children('div.col-12').children('div.form-group').children('input.piso').keyup(editarpoliza_propiedad_keyup);
            componentes.pasos.paso2.poliza.asegurado.children('div.sugerencias').children('div.col-12').children('div.table-responsive-md').children('table').children('thead').css('background-color', colorBorde);
            componentes.pasos.paso2.poliza.propiedad.children('div.sugerencias').children('div.col-12').children('div.table-responsive-md').children('table').children('thead').css('background-color', colorBorde);
            componentes.pasos.paso2.poliza.asegurado.children('div.detalles').children('div.col-12').children('div.marco').css('border-color', colorBorde);
            componentes.pasos.paso2.poliza.propiedad.children('div.detalles').children('div.col-12').children('div.marco').css('border-color', colorBorde);
            componentes.pasos.paso2.poliza.asegurado.children('div.sugerencias').hide();
            componentes.pasos.paso2.poliza.propiedad.children('div.sugerencias').hide();
            componentes.pasos.paso2.poliza.asegurado.children('div.detalles').hide();
            componentes.pasos.paso2.poliza.propiedad.children('div.detalles').hide();
            componentes.pasos.paso2.poliza.contenedor.children('div.marco-poliza').children('div.mapa').hide();
        } else {
            alerta('Error 404', 'no se pudo cargar editarpoliza.html');
            sessionStorage.removeItem('siniestro');
        }
    }
    
    // Cargar paginas y aplicar controles
    // ====================================================================== //
    $.get('http://localhost:8080/ReForms_Provider/wr/aseguradora/obtenerAseguradoras', function(data, status) {
        if (status == 'success') {
            pasos.paso1.listaAseguradoras = data;
            mostrar_aseguradoras($('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso1').children('div.row').children('div.col-12').children('div.logos'));
        }
    }, 'json');
    componentes.progreso.paso.text('Paso 1');
    componentes.botones.children('button.btn-aceptar').prop('disabled', true).click(aceptar_click);
    componentes.botones.children('button.btn-continuar').prop('disabled', true).click(continuar_click);
    componentes.botones.children('button.btn-cancelar').click(cancelar_click);
    componentes.botones.children('button.btn-volver').click(volver_click);
    componentes.pasos.paso1.numero_siniestro.prop('readonly', true).keyup(numero_siniestro_keyup);
    componentes.pasos.paso2.numero_poliza.keyup(numero_poliza_keyup);

    // Inicializacion de aspecto y colores
    // ====================================================================== //
    $('#ventana').css('border-color', colorBorde);
    $('#ventana').css('background-color', colorFondo);
    $('#ventana').children('div.container-fluid').children('div.progreso').css({'border-color':colorBorde, 'background-color':colorFondo});
    $('#ventana').children('div.container-fluid').children('div.progreso').children('div.col-12').children('div.progress').css('border-color', colorBorde);
    componentes.progreso.barra.css('background-color', colorBorde);
    $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso').not('div.paso1').hide();
    componentes.botones.children('button.btn-volver').css({'border-color':colorBorde, 'background-color':colorFondo}).hide();
    componentes.botones.children('button.btn-continuar').css({'border-color':colorBorde, 'background-color':colorFondo});
    componentes.botones.children('button.btn-aceptar').hide();
    componentes.pasos.paso2.poliza.contenedor.hide();
});
