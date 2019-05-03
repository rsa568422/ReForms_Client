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
                    'fecha': $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso3').children('div.principal').children('div.fecha').children('input[name="fecha"]'),
                    'perito': $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso3').children('div.principal').children('div.perito').children('select[name="perito"]'),
                    'original': $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso3').children('div.principal').children('div.original').children('div.custom-file').children('input[name="original"]'),
                    'original_texto': $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso3').children('div.principal').children('div.original').children('div.custom-file').children('label.original-texto'),
                    'observaciones': $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso3').children('div.adicional').children('div.observaciones').children('textarea[name="observaciones"]'),
                    'afectado': $('#ventana').children('div.container-fluid').children('div.pasos').children('div.paso3').children('div.adicional').children('div.afectado')
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
                    'localidad': false,
                    'direccion': false,
                    'numero': false
                }
            },
            'paso3': {
                'listaPeritos': [],
                'original': null,
                'listaPropiedades': [],
                'listaCoincidencias': [],
                'afectado': {
                    'localidad': false,
                    'direccion': false,
                    'numero': false
                },
                'propiedadAfectado': null
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
    
    function generarMapaAfectado(lat, long) {
        var funcion = '<script>function cargarMapa() { var propiedades = { center: new google.maps.LatLng(' + lat + ', ' + long + '), zoom: 18 }, mapa = new google.maps.Map(document.getElementById("googleMapAf"), propiedades), marcador = new google.maps.Marker({position: propiedades.center}); marcador.setMap(mapa); }</script>',
            script = '<script src="https://maps.googleapis.com/maps/api/js?key=' + googleKey + '&callback=cargarMapa"></script>',
            mapa  = '<div id="googleMapAf" style="width:100%;height:400px;"></div>';
        return '<div class="mapaGoogle">' + funcion + script + mapa + '</div>';
    }
    
    function actualizar_barra() {
        var p = 15;
        if (pasos.paso2.cliente.nombre) {
            p += 10;
        }
        if (pasos.paso2.cliente.apellido1) {
            p += 10;
        }
        if (pasos.paso2.cliente.telefono1) {
            p += 10;
        }
        if (pasos.paso2.propiedad.localidad) {
            p += 10;
        }
        if (pasos.paso2.propiedad.direccion) {
            p += 10;
        }
        if (pasos.paso2.propiedad.numero) {
            p += 10;
        }
        componentes.progreso.porcentaje = p;
        componentes.progreso.barra.css({width: componentes.progreso.porcentaje + '%'});
    }
    
    function mostrar_aseguradoras(div) {
        var i, logo;
        for (i = 0; i < pasos.paso1.listaAseguradoras.length; i++) {
            logo = generarLogo(pasos.paso1.listaAseguradoras[i]);
            if (pasos.paso1.aseguradoraSeleccionada != null && pasos.paso1.aseguradoraSeleccionada.id == pasos.paso1.listaAseguradoras[i].id) {
                div.children('.seleccionada').removeClass('seleccionada');
                logo = logo.replace('class="logo"', 'class="logo seleccionada"');
                componentes.progreso.porcentaje = 5;
                componentes.progreso.barra.css({width: '5%'});
                componentes.pasos.paso1.numero_siniestro.prop('readonly', false);
                componentes.pasos.paso1.numero_siniestro.focus();
                $.get('http://localhost:8080/ReForms_Provider/wr/perito/buscarPeritoPorAseguradora/' + pasos.paso1.aseguradoraSeleccionada.id, respuesta_buscarPeritoPorAseguradora, 'json');
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
            fila = '<tr class="coincidencia"><td><strong style="color:DodgerBlue">G</strong><strong style="color:Red">o</strong><strong style="color:Goldenrod">o</strong><strong style="color:DodgerBlue">g</strong><strong style="color:Green">l</strong><strong style="color:Red">e</strong></td><td>' + direccion + '</td><td>' + localidad + '</td></tr>';
            tfoot.append(fila);
        }
        if (pasos.paso2.listaPropiedades.length > 0 || pasos.paso2.listaCoincidencias.length > 0) {
            if (pasos.paso2.listaPropiedades.length > 0 && pasos.paso2.listaCoincidencias.length > 0) {
                tbody.css({'border-style':'solid', 'border-width':'0px 0px 3px 0px', 'border-color':colorBorde});
            } else {
                tbody.css({'border-style':'none', 'border-width':'0px 0px 0px 0px', 'border-color':sinColor});
            }
            tbody.children('tr.propiedad').click(propiedad_click);
            tfoot.children('tr.coincidencia').click(propiedad_click);
        } else {
            fila = '<tr class="coincidencia"><td colspan="3"><h5>Direccion no encontrada en google maps</h5></td></tr>';
            tfoot.append(fila);
        }
    }
    
    function mostrar_sugerencias_afectado() {
        var i, fila, direccion, localidad,
            tbody = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.sugerencias').children('div.table-responsive-md').children('table.table').children('tbody'),
            tfoot = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.sugerencias').children('div.table-responsive-md').children('table.table').children('tfoot');
        tbody.children('tr.propiedad').remove();
        for (i = 0; i < pasos.paso3.listaPropiedades.length; i++) {
            direccion = pasos.paso3.listaPropiedades[i].direccion + ', ' + pasos.paso3.listaPropiedades[i].numero;
            localidad = pasos.paso3.listaPropiedades[i].localidad.nombre + ' [ ' + pasos.paso3.listaPropiedades[i].localidad.cp + ' ]';
            if (pasos.paso3.listaPropiedades[i].piso && pasos.paso3.listaPropiedades[i].piso != null && pasos.paso3.listaPropiedades[i].piso != '') {
                fila = '<tr class="propiedad"><td>' + direccion + '</td><td>' + pasos.paso3.listaPropiedades[i].piso + '</td><td>' + localidad + '</td></tr>';
            } else {
                fila = '<tr class="propiedad"><td colspan="2">' + direccion + '</td><td>' + localidad + '</td></tr>';
            }
            tbody.append(fila);
        }
        tfoot.children('tr.coincidencia').remove();
        for (i = 0; i < pasos.paso3.listaCoincidencias.length; i++) {
            direccion = pasos.paso3.listaCoincidencias[i].direccion + ', ' + pasos.paso3.listaCoincidencias[i].numero;
            localidad = pasos.paso3.listaCoincidencias[i].localidad.nombre + ' [ ' + pasos.paso3.listaCoincidencias[i].localidad.cp + ' ]';
            fila = '<tr class="coincidencia"><td><strong style="color:DodgerBlue">G</strong><strong style="color:Red">o</strong><strong style="color:Goldenrod">o</strong><strong style="color:DodgerBlue">g</strong><strong style="color:Green">l</strong><strong style="color:Red">e</strong></td><td>' + direccion + '</td><td>' + localidad + '</td></tr>';
            tfoot.append(fila);
        }
        if (pasos.paso3.listaPropiedades.length > 0 || pasos.paso3.listaCoincidencias.length > 0) {
            if (pasos.paso3.listaPropiedades.length > 0 && pasos.paso3.listaCoincidencias.length > 0) {
                tbody.css({'border-style':'solid', 'border-width':'0px 0px 3px 0px', 'border-color':colorBorde});
            } else {
                tbody.css({'border-style':'none', 'border-width':'0px 0px 0px 0px', 'border-color':sinColor});
            }
            tbody.children('tr.propiedad').click(afectado_click);
            tfoot.children('tr.coincidencia').click(afectado_click);
        } else {
            fila = '<tr class="coincidencia"><td colspan="3"><h5>Direccion no encontrada en google maps</h5></td></tr>';
            tfoot.append(fila);
        }
    }
    
    function reiniciar_paso_3() {
        componentes.pasos.paso3.fecha.val('');
        componentes.pasos.paso3.perito.val(-1);
        componentes.pasos.paso3.original.val('');
        componentes.pasos.paso3.original_texto.text('Examinar . . .');
        componentes.pasos.paso3.observaciones.val('');
        pasos.paso3.afectado.localidad = false;
        pasos.paso3.afectado.direccion = false;
        pasos.paso3.afectado.numero = false;
        pasos.paso3.propiedadAfectado = null;
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.cp').prop('readonly', false).val('');
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.nombre').prop('readonly', false).val('');
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.direccion').prop('readonly', false).val('');
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.numero').prop('readonly', false).val('');
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.piso').children('div.col-12').children('div.form-group').children('input.piso').prop('readonly', false).val('');
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.observaciones').children('div.col-12').children('div.form-group').children('textarea.observaciones').prop('readonly', false).val('');
        componentes.pasos.paso3.afectado.children('div.sin-afectado').show();
        componentes.pasos.paso3.afectado.children('div.con-afectado').hide();
        componentes.pasos.paso3.afectado.children('div.resumen').hide();
    }
    
    // Funciones controladoras para componentes
    // ====================================================================== //
    function logo_click() {
        if (pasos.paso1.aseguradoraSeleccionada != null && pasos.paso1.aseguradoraSeleccionada.id == pasos.paso1.listaAseguradoras[$(this).index()].id) {
            componentes.progreso.porcentaje = 0;
            componentes.progreso.barra.css({width: '0px'});
            pasos.paso1.aseguradoraSeleccionada = null;
            $(this).removeClass("seleccionada");
            componentes.pasos.paso1.numero_siniestro.prop('readonly', true);
        } else {
            if (pasos.paso1.aseguradoraSeleccionada == null) {
                componentes.progreso.porcentaje = 5;
                componentes.progreso.barra.css({width: '5%'});
            }
            pasos.paso1.aseguradoraSeleccionada = pasos.paso1.listaAseguradoras[$(this).index()];
            $.get('http://localhost:8080/ReForms_Provider/wr/perito/buscarPeritoPorAseguradora/' + pasos.paso1.aseguradoraSeleccionada.id, respuesta_buscarPeritoPorAseguradora, 'json');
            $(this).siblings(".seleccionada").removeClass("seleccionada");
            $(this).addClass("seleccionada");
            componentes.pasos.paso1.numero_siniestro.prop('readonly', false);
        }
        componentes.pasos.paso1.numero_siniestro.val('').focus();
        componentes.pasos.paso1.numero_siniestro.keyup();
    }
    
    function aceptar_click() {
        var s = new Siniestro(),
            r = new Recurso(),
            nombre = componentes.pasos.paso2.poliza.asegurado.children('div.nombre').children('div.col-12').children('div.form-group').children('input.nombre'),
            apellido1 = componentes.pasos.paso2.poliza.asegurado.children('div.apellidos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.apellido1'),
            apellido2 = componentes.pasos.paso2.poliza.asegurado.children('div.apellidos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.apellido2'),
            telefono1 = componentes.pasos.paso2.poliza.asegurado.children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.telefono1'),
            telefono2 = componentes.pasos.paso2.poliza.asegurado.children('div.telefonos').children('div.col-12').children('div.form-group').children('div.input-group').children('input.telefono2'),
            tipo = componentes.pasos.paso2.poliza.asegurado.children('div.tipo').children('div.col-12').children('div.form-group').children('select.tipo'),
            observaciones_cliente = componentes.pasos.paso2.poliza.asegurado.children('div.observaciones').children('div.col-12').children('div.form-group').children('textarea.observaciones-cliente'),
            observaciones_propiedad = componentes.pasos.paso2.poliza.propiedad.children('div.observaciones').children('div.col-12').children('div.form-group').children('textarea.observaciones-propiedad'),
            observaciones_afectado = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.observaciones').children('div.col-12').children('div.form-group').children('textarea.observaciones');
        s.numero = pasos.paso1.numero_siniestro;
        s.poliza = pasos.paso2.poliza;
        if (s.poliza.cliente.id == null) {
            s.poliza.cliente.nombre = nombre.val();
            s.poliza.cliente.apellido1 = apellido1.val();
            if (apellido2.val() != '') {
                s.poliza.cliente.apellido2 = apellido2.val();
            }
            s.poliza.cliente.telefono1 = telefono1.val();
            if (telefono2.val() != '') {
                s.poliza.cliente.telefono2 = telefono2.val();;
            }
            s.poliza.cliente.tipo = Number(tipo.val());
            s.poliza.cliente.observaciones = observaciones_cliente.val() != "" ? observaciones_cliente.val() : null;
        }
        if (s.poliza.propiedad.id < 0) {
            s.poliza.propiedad.id = null;
            s.poliza.propiedad.observaciones = observaciones_propiedad.val() != "" ? observaciones_propiedad.val() : null;
        }
        s.peritoOriginal = pasos.paso3.listaPeritos[componentes.pasos.paso3.perito.val()];
        s.fechaRegistro = new Date(componentes.pasos.paso3.fecha.val());
        r.nombre = componentes.pasos.paso3.original.val();
        while (r.nombre.indexOf("\\") != -1) {
            r.nombre = r.nombre.slice(r.nombre.indexOf("\\") + 1, r.nombre.length);
        }
        r.fichero = pasos.paso3.original;
        s.original = r;
        s.observaciones = componentes.pasos.paso3.observaciones.val() != '' ? componentes.pasos.paso3.observaciones.val() : null;
        s.afectado = pasos.paso3.propiedadAfectado;
        if (s.afectado != null && s.afectado.id < 0) {
            s.afectado.id = null;
            s.afectado.observaciones = observaciones_afectado.val() != "" ? observaciones_afectado.val() : null;
        }
        $.ajax({
            url: 'http://localhost:8080/ReForms_Provider/wr/siniestro/registrarSiniestro',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(s),
            processData: false,
            success: function(data, textStatus, jQxhr){
                // buscar siniestro registrado en el proveedor
                $.get('http://localhost:8080/ReForms_Provider/wr/siniestro/buscarSiniestroPorNumeroSiniestro/0/' + s.poliza.cliente.aseguradora.id + '///' + s.numero, function(data, status) {
                    if (status == 'success') {
                        sessionStorage.setItem('siniestro', JSON.stringify(data[0]));
                        $('#contenido').load('Html/siniestro.html', cargar_siniestro);
                    } else {
                        // el siniestro registrado no se encuentra
                        alert('fallo en el proveedor');
                    }
                }, 'json');
            },
            error: function(jQxhr, textStatus, errorThrown){
                // no se ha registrado el siniestro
                alert('fallo en el proveedor');
            }
        });
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
            componentes.progreso.paso.text('Paso 3').animate({'margin-left': '75%'}, 'fast');
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
        var nombre_completo, telefonos,
            detalles = componentes.pasos.paso2.poliza.asegurado.children('div.detalles'),
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
            nombre_completo = pasos.paso2.poliza.cliente.nombre + ' ' + pasos.paso2.poliza.cliente.apellido1;
            if (pasos.paso2.poliza.cliente.apellido2 && pasos.paso2.poliza.cliente.apellido2 != null && pasos.paso2.poliza.cliente.apellido2 != '') {
                nombre_completo += ' ' + pasos.paso2.poliza.cliente.apellido2;
            }
            detalles.children('div.col-12').children('div.marco').children('div.nombre').text(nombre_completo);
            telefonos = pasos.paso2.poliza.cliente.telefono1;
            if (pasos.paso2.poliza.cliente.telefono2 && pasos.paso2.poliza.cliente.telefono2 != null && pasos.paso2.poliza.cliente.telefono2 != '') {
                telefonos += ' / ' + pasos.paso2.poliza.cliente.telefono2;
            }
            detalles.children('div.col-12').children('div.marco').children('div.telefono').text(telefonos);
            detalles.children('div.col-12').children('div.marco').children('div.polizas').children('ul').children('li').remove();
            $.get('http://localhost:8080/ReForms_Provider/wr/poliza/buscarPolizaPorCliente/' + pasos.paso2.poliza.cliente.id, function(data, status) {
                if (status == 'success') {
                    var i, elemento;
                    for (i = 0; i < data.length; i++) {
                        elemento = '<li>' + data[i].numero + '</li>';
                        detalles.children('div.col-12').children('div.marco').children('div.polizas').children('ul').append(elemento);
                    }
                } else {
                    alert('fallo en el proveedor');
                }
            }, 'json');
            detalles.show();
        } else {
            pasos.paso2.poliza.cliente = null;
            pasos.paso2.cliente.nombre = nombre.val() != '';
            pasos.paso2.cliente.apellido1 = apellido1.val() != '';
            pasos.paso2.cliente.telefono1 = telefono1.val() != '';
            $(this).css('background-color', sinColor);
            $(this).siblings('tr.cliente').css('background-color', sinColor);
            nombre.prop('readonly', false);
            apellido1.prop('readonly', false);
            apellido2.prop('readonly', false);
            telefono1.prop('readonly', false);
            telefono2.prop('readonly', false);
            tipo.prop('disabled', false).val(0);
            observaciones.prop('readonly', false).val('');
            nombre.keyup();
            detalles.hide();
        }
        if (pasos.paso2.poliza.cliente != null && pasos.paso2.poliza.propiedad != null) {
            componentes.botones.children('button.btn-continuar').prop('disabled', false);
        } else {
            componentes.botones.children('button.btn-continuar').prop('disabled', true);
        }
    }
    
    function propiedad_click() {
        var direccion_completa, localidad,
            detalles = componentes.pasos.paso2.poliza.propiedad.children('div.detalles'),
            tbody = componentes.pasos.paso2.poliza.propiedad.children('div.sugerencias').children('div.col-12').children('div.table-responsive-md').children('table').children('tbody'),
            tfoot = componentes.pasos.paso2.poliza.propiedad.children('div.sugerencias').children('div.col-12').children('div.table-responsive-md').children('table').children('tfoot'),
            cp = componentes.pasos.paso2.poliza.propiedad.children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.cp'),
            nombre = componentes.pasos.paso2.poliza.propiedad.children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.nombre'),
            direccion = componentes.pasos.paso2.poliza.propiedad.children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.direccion'),
            numero = componentes.pasos.paso2.poliza.propiedad.children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.numero'),
            piso = componentes.pasos.paso2.poliza.propiedad.children('div.piso').children('div.col-12').children('div.form-group').children('input.piso'),
            observaciones = componentes.pasos.paso2.poliza.propiedad.children('div.observaciones').children('div.col-12').children('div.form-group').children('textarea.observaciones-propiedad');
        tbody.children('tr.propiedad').css('background-color', sinColor);
        tfoot.children('tr.coincidencia').css('background-color', sinColor);
        if ($(this).hasClass('propiedad')) {
            if (pasos.paso2.poliza.propiedad == null || pasos.paso2.poliza.propiedad.id != pasos.paso2.listaPropiedades[$(this).index()].id) {
                pasos.paso2.poliza.propiedad = pasos.paso2.listaPropiedades[$(this).index()];
                $(this).css('background-color', colorFondo);
                cp.prop('readonly', true).val(pasos.paso2.poliza.propiedad.localidad.cp);
                nombre.prop('readonly', true).val(pasos.paso2.poliza.propiedad.localidad.nombre);
                direccion.prop('readonly', true).val(pasos.paso2.poliza.propiedad.direccion);
                numero.prop('readonly', true).val(pasos.paso2.poliza.propiedad.numero);
                piso.prop('readonly', true).val(pasos.paso2.poliza.propiedad.piso);
                observaciones.prop('readonly', true).val(pasos.paso2.poliza.propiedad.observaciones);
                $.get('http://localhost:8080/ReForms_Provider/wr/propiedad/relacionesPropiedad/' + pasos.paso2.poliza.propiedad.id, function(data, status) {
                    if (status == 'success') {
                        var elemento, res = JSON.parse(data);
                        if (res[0] || res[1] || res[2]) {
                            detalles.show();
                            detalles.children('div.col-12').children('div.marco').children('div.origen').children('ul').children('li').remove();
                            if (res[0]) {
                                elemento = '<li>Propiedad asociada a una poliza</li>';
                                detalles.children('div.col-12').children('div.marco').children('div.origen').children('ul').append(elemento);
                            }
                            if (res[1]) {
                                elemento = '<li>Propiedad afectada en algun siniestro</li>';
                                detalles.children('div.col-12').children('div.marco').children('div.origen').children('ul').append(elemento);
                            }
                            if (res[2]) {
                                elemento = '<li>Residencia de algun trabajador</li>';
                                detalles.children('div.col-12').children('div.marco').children('div.origen').children('ul').append(elemento);
                            }
                        } else {
                            detalles.hide();
                        }
                    } else {
                        alert('fallo en el proveedor');
                    }
                }, 'text');
                direccion_completa = pasos.paso2.poliza.propiedad.direccion + ', ' + pasos.paso2.poliza.propiedad.numero;
                detalles.children('div.col-12').children('div.marco').children('div.direccion').text(direccion_completa);
                if (pasos.paso2.poliza.propiedad.piso && pasos.paso2.poliza.propiedad.piso != null && pasos.paso2.poliza.propiedad.piso != '') {
                    detalles.children('div.col-12').children('div.marco').children('div.piso').text(pasos.paso2.poliza.propiedad.piso);
                } else {
                    detalles.children('div.col-12').children('div.marco').children('div.piso').text('');
                }
                localidad = pasos.paso2.poliza.propiedad.localidad.nombre + ' [ ' + pasos.paso2.poliza.propiedad.localidad.cp + ' ]';
                detalles.children('div.col-12').children('div.marco').children('div.localidad').text(localidad);
                detalles.show();
                componentes.pasos.paso2.poliza.contenedor.children('div.marco-poliza').children('div.mapa').children('div.col-12').children('div.mapaGoogle').remove();
                componentes.pasos.paso2.poliza.contenedor.children('div.marco-poliza').children('div.mapa').children('div.col-12').append(generarMapa(pasos.paso2.poliza.propiedad.geolat, pasos.paso2.poliza.propiedad.geolong));
                componentes.pasos.paso2.poliza.contenedor.children('div.marco-poliza').children('div.mapa').show();
            } else {
                pasos.paso2.poliza.propiedad = null;
                cp.prop('readonly', false);
                cp.keyup();
                direccion.prop('readonly', false);
                numero.prop('readonly', false);
                piso.prop('readonly', false);
                observaciones.prop('readonly', false).val('');
                detalles.hide();
                componentes.pasos.paso2.poliza.contenedor.children('div.marco-poliza').children('div.mapa').hide();
            }
        } else {
            if (pasos.paso2.poliza.propiedad == null || pasos.paso2.poliza.propiedad.id != pasos.paso2.listaCoincidencias[$(this).index()].id) {
                pasos.paso2.poliza.propiedad = pasos.paso2.listaCoincidencias[$(this).index()];
                $(this).css('background-color', colorFondo);
                cp.prop('readonly', true).val(pasos.paso2.poliza.propiedad.localidad.cp);
                direccion.prop('readonly', true).val(pasos.paso2.poliza.propiedad.direccion);
                numero.prop('readonly', true).val(pasos.paso2.poliza.propiedad.numero);
                piso.prop('readonly', false).val(pasos.paso2.poliza.propiedad.piso);
                observaciones.prop('readonly', false).val('');
                $.get('http://localhost:8080/ReForms_Provider/wr/localidad/buscarLocalidadPorCodigoPostal/' + pasos.paso2.poliza.propiedad.localidad.cp, function(data, status) {
                    if (status == 'success') {
                        pasos.paso2.poliza.propiedad.localidad.nombre = data.nombre;
                    }
                    nombre.prop('readonly', status == 'success').val(pasos.paso2.poliza.propiedad.localidad.nombre);
                }, 'json');
                componentes.pasos.paso2.poliza.contenedor.children('div.marco-poliza').children('div.mapa').children('div.col-12').children('div.mapaGoogle').remove();
                componentes.pasos.paso2.poliza.contenedor.children('div.marco-poliza').children('div.mapa').children('div.col-12').append(generarMapa(pasos.paso2.poliza.propiedad.geolat, pasos.paso2.poliza.propiedad.geolong));
                componentes.pasos.paso2.poliza.contenedor.children('div.marco-poliza').children('div.mapa').show();
            } else {
                pasos.paso2.poliza.propiedad = null;
                cp.prop('readonly', false);
                direccion.prop('readonly', false);
                numero.prop('readonly', false);
                piso.prop('readonly', false);
                observaciones.prop('readonly', false).val('');
                cp.keyup();
                componentes.pasos.paso2.poliza.contenedor.children('div.marco-poliza').children('div.mapa').hide();
            }
            detalles.hide();
        }
        if (pasos.paso2.poliza.cliente != null && pasos.paso2.poliza.propiedad != null) {
            componentes.botones.children('button.btn-continuar').prop('disabled', false);
        } else {
            componentes.botones.children('button.btn-continuar').prop('disabled', true);
        }
    }
    
    function afectado_agregar_click() {
        var cp = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.cp'),
            nombre = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.nombre'),
            direccion = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.direccion'),
            numero = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.numero'),
            piso = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.piso').children('div.col-12').children('div.form-group').children('input.piso');
        componentes.botones.children('button.btn-volver').prop('disabled', true);
        componentes.pasos.paso3.fecha.prop('readonly', true);
        componentes.pasos.paso3.perito.prop('disabled', true);
        componentes.pasos.paso3.original.prop('disabled', true);
        componentes.pasos.paso3.observaciones.prop('readonly', true);
        cp.prop('readonly', false).val(pasos.paso2.poliza.propiedad.localidad.cp);
        nombre.prop('readonly', true).val(pasos.paso2.poliza.propiedad.localidad.nombre);
        direccion.prop('readonly', false).val(pasos.paso2.poliza.propiedad.direccion);
        numero.prop('readonly', false).val(pasos.paso2.poliza.propiedad.numero);
        piso.prop('readonly', false).val('');
        pasos.paso3.afectado.localidad = true;
        pasos.paso3.afectado.direccion = true;
        pasos.paso3.afectado.numero = true;
        cp.keyup();
        componentes.pasos.paso3.afectado.children('div.sin-afectado').hide();
        componentes.pasos.paso3.afectado.children('div.con-afectado').show();
        componentes.botones.children('button.btn-aceptar').prop('disabled', true);
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.sugerencias').hide();
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.sugerencias').children('div.mapa').hide();
    }
    
    function afectado_click() {
        var tbody = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.sugerencias').children('div.table-responsive-md').children('table.table').children('tbody'),
            tfoot = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.sugerencias').children('div.table-responsive-md').children('table.table').children('tfoot'),
            cp = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.cp'),
            nombre = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.nombre'),
            direccion = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.direccion'),
            numero = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.numero'),
            piso = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.piso').children('div.col-12').children('div.form-group').children('input.piso'),
            observaciones = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.observaciones').children('div.col-12').children('div.form-group').children('textarea.observaciones');
        tbody.children('tr.propiedad').css('background-color', sinColor);
        tfoot.children('tr.coincidencia').css('background-color', sinColor);
        if ($(this).hasClass('propiedad')) {
            if (pasos.paso3.propiedadAfectado == null || pasos.paso3.propiedadAfectado.id != pasos.paso3.listaPropiedades[$(this).index()].id) {
                pasos.paso3.propiedadAfectado = pasos.paso3.listaPropiedades[$(this).index()];
                $(this).css('background-color', colorFondo);
                cp.prop('readonly', true).val(pasos.paso3.propiedadAfectado.localidad.cp);
                nombre.prop('readonly', true).val(pasos.paso3.propiedadAfectado.localidad.nombre);
                direccion.prop('readonly', true).val(pasos.paso3.propiedadAfectado.direccion);
                numero.prop('readonly', true).val(pasos.paso3.propiedadAfectado.numero);
                piso.prop('readonly', true).val(pasos.paso3.propiedadAfectado.piso);
                observaciones.prop('readonly', true).val(pasos.paso3.propiedadAfectado.observaciones);
                componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.mapa').children('div.mapaGoogle').remove();
                componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.mapa').append(generarMapaAfectado(pasos.paso3.propiedadAfectado.geolat, pasos.paso3.propiedadAfectado.geolong));
                componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.mapa').show();
            } else {
                pasos.paso3.propiedadAfectado = null;
                cp.prop('readonly', false);
                cp.keyup();
                direccion.prop('readonly', false);
                numero.prop('readonly', false);
                piso.prop('readonly', false);
                observaciones.prop('readonly', false).val('');
                componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.mapa').hide();
            }
        } else {
            if (pasos.paso3.propiedadAfectado == null || pasos.paso3.propiedadAfectado.id != pasos.paso3.listaCoincidencias[$(this).index()].id) {
                pasos.paso3.propiedadAfectado = pasos.paso3.listaCoincidencias[$(this).index()];
                $(this).css('background-color', colorFondo);
                cp.prop('readonly', true).val(pasos.paso3.propiedadAfectado.localidad.cp);
                direccion.prop('readonly', true).val(pasos.paso3.propiedadAfectado.direccion);
                numero.prop('readonly', true).val(pasos.paso3.propiedadAfectado.numero);
                piso.prop('readonly', false).val(pasos.paso3.propiedadAfectado.piso);
                observaciones.prop('readonly', false).val('');
                $.get('http://localhost:8080/ReForms_Provider/wr/localidad/buscarLocalidadPorCodigoPostal/' + pasos.paso3.propiedadAfectado.localidad.cp, function(data, status) {
                    if (status == 'success') {
                        pasos.paso3.propiedadAfectado.localidad = data;
                    }
                    nombre.prop('readonly', status == 'success').val(pasos.paso3.propiedadAfectado.localidad.nombre);
                }, 'json');
                componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.mapa').children('div.mapaGoogle').remove();
                componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.mapa').append(generarMapaAfectado(pasos.paso3.propiedadAfectado.geolat, pasos.paso3.propiedadAfectado.geolong));
                componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.mapa').show();
            } else {
                pasos.paso3.propiedadAfectado = null;
                cp.prop('readonly', false);
                direccion.prop('readonly', false);
                numero.prop('readonly', false);
                piso.prop('readonly', false);
                observaciones.prop('readonly', false).val('');
                cp.keyup();
                componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.mapa').hide();
            }
        }
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('button.btn-aceptar').prop('disabled', pasos.paso3.propiedadAfectado == null);
    }
    
    function afectado_aceptar_click() {
        var direccion_completa, localidad,
            piso = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.piso').children('div.col-12').children('div.form-group').children('input.piso').val(),
            info = componentes.pasos.paso3.afectado.children('div.resumen').children('div.container-fluid').children('div.info');
        componentes.botones.children('button.btn-volver').prop('disabled', false);
        componentes.pasos.paso3.fecha.prop('readonly', false);
        componentes.pasos.paso3.perito.prop('disabled', false);
        componentes.pasos.paso3.original.prop('disabled', false);
        componentes.pasos.paso3.observaciones.prop('readonly', false);
        componentes.pasos.paso3.fecha.change();
        direccion_completa = pasos.paso3.propiedadAfectado.direccion + ', ' + pasos.paso3.propiedadAfectado.numero;
        info.children('div.direccion').text(direccion_completa);
        if (pasos.paso3.propiedadAfectado.piso && pasos.paso3.propiedadAfectado.piso != null && pasos.paso3.propiedadAfectado.piso != '') {
            info.children('div.piso').text(pasos.paso3.propiedadAfectado.piso);
        } else if (piso != '') {
            pasos.paso3.propiedadAfectado.piso = piso;
            info.children('div.piso').text(pasos.paso3.propiedadAfectado.piso);
        } else {
            info.children('div.piso').text('');
        }
        localidad = pasos.paso3.propiedadAfectado.localidad.nombre + ' [ ' + pasos.paso3.propiedadAfectado.localidad.cp + ' ]';
        info.children('div.localidad').text(localidad);
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.mapa').children('div.mapaGoogle').remove();
        componentes.pasos.paso3.afectado.children('div.resumen').children('div.container-fluid').children('div.mapa').append(generarMapaAfectado(pasos.paso3.propiedadAfectado.geolat, pasos.paso3.propiedadAfectado.geolong));
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.mapa').hide();
        componentes.pasos.paso3.afectado.children('div.con-afectado').hide();
        componentes.pasos.paso3.afectado.children('div.resumen').show();
    }
    
    function afectado_cancelar_click() {
        pasos.paso3.afectado.localidad = false;
        pasos.paso3.afectado.direccion = false;
        pasos.paso3.afectado.numero = false;
        pasos.paso3.propiedadAfectado = null;
        componentes.botones.children('button.btn-volver').prop('disabled', false);
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('button.btn-aceptar').prop('disabled', true);
        componentes.pasos.paso3.fecha.prop('readonly', false);
        componentes.pasos.paso3.perito.prop('disabled', false);
        componentes.pasos.paso3.original.prop('disabled', false);
        componentes.pasos.paso3.observaciones.prop('readonly', false);
        componentes.pasos.paso3.afectado.children('div.sin-afectado').show();
        componentes.pasos.paso3.afectado.children('div.con-afectado').hide();
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.mapa').hide();
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.sugerencias').children('div.table-responsive-md').children('table.table').children('tbody').children('tr.propiedad').css('background-color', sinColor);
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.sugerencias').children('div.table-responsive-md').children('table.table').children('tfoot').children('tr.coincidencia').css('background-color', sinColor);
        componentes.pasos.paso3.fecha.change();
    }
    
    function afectado_modificar_click() {
        componentes.botones.children('button.btn-volver').prop('disabled', true);
        componentes.botones.children('button.btn-aceptar').prop('disabled', true);
        componentes.pasos.paso3.fecha.prop('readonly', true);
        componentes.pasos.paso3.perito.prop('disabled', true);
        componentes.pasos.paso3.original.prop('disabled', true);
        componentes.pasos.paso3.observaciones.prop('readonly', true);
        componentes.pasos.paso3.afectado.children('div.resumen').hide();
        componentes.pasos.paso3.afectado.children('div.con-afectado').show();
        componentes.pasos.paso3.afectado.children('div.resumen').children('div.container-fluid').children('div.mapa').children('div.mapaGoogle').remove();
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.mapa').append(generarMapaAfectado(pasos.paso3.propiedadAfectado.geolat, pasos.paso3.propiedadAfectado.geolong));
        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.mapa').show();
    }
    
    function numero_siniestro_keyup() {
        if (componentes.pasos.paso1.numero_siniestro.val() != '') {
            reiniciar_paso_3();
            if (pasos.paso1.numero_siniestro == '') {
                componentes.progreso.porcentaje = 10;
                componentes.progreso.barra.css({width: '10%'});
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
            componentes.progreso.barra.css({width: componentes.progreso.porcentaje + '%'});
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
            reiniciar_paso_3();
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
                        componentes.progreso.porcentaje = 75;
                        componentes.progreso.barra.css({width: '75%'});
                        componentes.botones.children('button.btn-continuar').prop('disabled', false);
                        componentes.pasos.paso2.poliza.contenedor.show();
                    } else {
                        pasos.paso2.poliza = new Poliza();
                        pasos.paso2.poliza.numero = componentes.pasos.paso2.numero_poliza.val();
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
                            componentes.progreso.barra.css({width: '15%'});
                        }
                        componentes.botones.children('button.btn-continuar').prop('disabled', true);
                        componentes.pasos.paso2.poliza.contenedor.show();
                    }
                } else {
                    alert('fallo en el proveedor');
                    componentes.progreso.porcentaje = 10;
                    componentes.progreso.barra.css({width: '10%'});
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
                    componentes.progreso.barra.css({width: '10%'});
                } else {
                    componentes.progreso.porcentaje = 5;
                    componentes.progreso.barra.css({width: '5%'});
                }
            } else {
                componentes.progreso.porcentaje = 0;
                componentes.progreso.barra.css({width: '0px'});
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
        actualizar_barra();
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
                        pasos.paso2.poliza.cliente.aseguradora = pasos.paso1.aseguradoraSeleccionada;
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
            componentes.botones.children('button.btn-continuar').prop('disabled', true);
        }
    }
    
    function editarpoliza_propiedad_keyup() {
        if ($(this).hasClass('cp')) {
            pasos.paso2.propiedad.localidad = $(this).val() != '' && cp_valido($(this).val());
        } else if ($(this).hasClass('direccion')) {
            pasos.paso2.propiedad.direccion = $(this).val() != '';
        } else if ($(this).hasClass('numero')) {
            pasos.paso2.propiedad.numero = $(this).val() != '';
        }
        if (!($(this).hasClass('piso') && pasos.paso2.poliza.propiedad.id < 0)) {
            actualizar_barra();
            if (test(pasos.paso2.propiedad)) {
                var cp = componentes.pasos.paso2.poliza.propiedad.children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.cp'),
                    direccion = componentes.pasos.paso2.poliza.propiedad.children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.direccion'),
                    numero = componentes.pasos.paso2.poliza.propiedad.children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.numero'),
                    piso = componentes.pasos.paso2.poliza.propiedad.children('div.piso').children('div.col-12').children('div.form-group').children('input.piso'),
                    ruta = 'http://localhost:8080/ReForms_Provider/wr/propiedad/buscarCoincidenciasPropiedad/' + cp.val() + '/' + direccion.val() + '/' + numero.val() + '/' + piso.val();
                componentes.botones.children('button.btn-continuar').prop('disabled', true);
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
                                    p.id = (-1)*(i+1);
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
        } else {
            pasos.paso2.poliza.propiedad.piso = $(this).val();
        }
    }
    
    function cp_keyup() {
        var nombre = componentes.pasos.paso2.poliza.propiedad.children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.nombre');
        if ($(this).prop('validity').valid && cp_valido($(this).val())) {
            $.get('http://localhost:8080/ReForms_Provider/wr/localidad/buscarLocalidadPorCodigoPostal/' + $(this).val(), function(data, status) {
                if (status == 'success') {
                    nombre.prop('readonly', true).val(data.nombre);
                } else {
                    nombre.prop('readonly', true).val('');
                }
            }, 'json');
        } else {
            nombre.prop('readonly', true).val('');
        }
    }
    
    function afectado_keyup() {
        if ($(this).hasClass('cp')) {
            pasos.paso3.afectado.localidad = $(this).val() != '' && cp_valido($(this).val());
        } else if ($(this).hasClass('direccion')) {
            pasos.paso3.afectado.direccion = $(this).val() != '';
        } else if ($(this).hasClass('numero')) {
            pasos.paso3.afectado.numero = $(this).val() != '';
        }
        if (test(pasos.paso3.afectado)) {
            var cp = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.cp'),
                direccion = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.direccion'),
                numero = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.numero'),
                piso = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.piso').children('div.col-12').children('div.form-group').children('input.piso'),
                ruta = 'http://localhost:8080/ReForms_Provider/wr/propiedad/buscarCoincidenciasPropiedad/' + cp.val() + '/' + direccion.val() + '/' + numero.val() + '/' + piso.val();
                $.get(ruta, function(data, status) {
                    if (status == 'success') {
                        var x = 0, direccion_completa = direccion.val() + ' ' + numero.val() + ', ' + cp.val();
                        pasos.paso3.listaPropiedades = data;
                        pasos.paso3.propiedadAfectado = null;
                        $.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + direccion_completa + '&key=' + googleKey, function(data) {
                            if (data.results.length > 0) {
                                var i, j, k, p;
                                pasos.paso3.listaCoincidencias = [];
                                for (i = 0; i < data.results.length; i++) {
                                    p = new Propiedad();
                                    p.id = (-1)*(i+1);
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
                                        pasos.paso3.listaCoincidencias.push(p); 
                                    }
                                }
                                mostrar_sugerencias_afectado();
                                componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.sugerencias').show();
                                componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.sugerencias').children('div.mapa').hide();
                            }
                        }, 'json');
                    } else {
                        alert('fallo en el proveedor');
                        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.sugerencias').hide();
                        componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.sugerencias').children('div.mapa').hide();
                    }
                }, 'json');
        } else {
            componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.sugerencias').hide();
            componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.sugerencias').children('div.mapa').hide();
        }
    }
    
    function afectado_cp_keyup() {
        var nombre = componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.nombre');
        if ($(this).prop('validity').valid && cp_valido($(this).val())) {
            $.get('http://localhost:8080/ReForms_Provider/wr/localidad/buscarLocalidadPorCodigoPostal/' + $(this).val(), function(data, status) {
                if (status == 'success') {
                    nombre.prop('readonly', true).val(data.nombre);
                } else {
                    nombre.prop('readonly', true).val('');
                }
            }, 'json');
        } else {
            nombre.prop('readonly', true).val('');
        }
    }
    
    function adicional_siniestro_change() {
        var fecha = componentes.pasos.paso3.fecha.val() != '' ? 8 : 0,
            perito = componentes.pasos.paso3.perito.val() != -1 ? 8 : 0,
            original = componentes.pasos.paso3.original.val() != '' ? 9 : 0;
        componentes.progreso.porcentaje = 75 + fecha + perito + original;
        componentes.progreso.barra.css({width: componentes.progreso.porcentaje + '%'});
        componentes.botones.children('button.btn-aceptar').prop('disabled', componentes.progreso.porcentaje != 100);
    }
    
    function original_change() {
        var entradas = this.files,
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
            pasos.paso3.original = e.target.result.split('base64,')[1];
            if (extension.toLowerCase() == 'pdf') {
                var test = '' + pasos.paso3.original;
                if (test.length <= 16777215) {
                    componentes.pasos.paso3.original_texto.text(nombre);
                    adicional_siniestro_change();
                } else {
                    pasos.paso3.original = null;
                    componentes.pasos.paso3.original_texto.text('Examinar . . .');
                    alerta('Tamaño de fichero invalido', 'debe seleccionar un fichero de tamaño no superior a 16Mb');
                }
            } else {
                pasos.paso3.original = null;
                componentes.pasos.paso3.original_texto.text('Examinar . . .');
                alerta('Tipo de fichero invalido', 'debe seleccionar un fichero .pdf');
            }
        };
        lector.readAsDataURL(entradas[0]);
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
    
    function respuesta_buscarPeritoPorAseguradora(data, status) {
        if (status == 'success') {
            var i;
            pasos.paso3.listaPeritos = data;
            componentes.pasos.paso3.perito.children('option').remove();
            if (pasos.paso3.listaPeritos.length > 0) {
                componentes.pasos.paso3.perito.append('<option value="-1">Seleccione perito</option>');
                for (i = 0; i < pasos.paso3.listaPeritos.length; i++) {
                    componentes.pasos.paso3.perito.append('<option value=' + i + '>' + pasos.paso3.listaPeritos[i].nombre + ' ' + pasos.paso3.listaPeritos[i].apellido1 + '</option>');
                }
            } else {
                componentes.pasos.paso3.perito.append('<option value="-1">Sin peritos registrados</option>');
            }
        } else {
            alert('fallo en el proveedor');
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
    componentes.pasos.paso3.fecha.change(adicional_siniestro_change);
    componentes.pasos.paso3.perito.change(adicional_siniestro_change);
    componentes.pasos.paso3.original.change(original_change);
    componentes.pasos.paso3.afectado.children('div.sin-afectado').children('button.btn').click(afectado_agregar_click);
    componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.cp').keyup(afectado_keyup);
    componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.localidad').children('div.col-12').children('div.form-group').children('div.input-group').children('input.cp').keyup(afectado_cp_keyup);
    componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.direccion').keyup(afectado_keyup);
    componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.numero').keyup(afectado_keyup);
    componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.container-fluid').children('div.direccion').children('div.col-12').children('div.form-group').children('div.input-group').children('input.numero').click(afectado_keyup);
    componentes.pasos.paso3.afectado.children('div.con-afectado').children('button.btn-aceptar').prop('disabled', true).click(afectado_aceptar_click);
    componentes.pasos.paso3.afectado.children('div.con-afectado').children('button.btn-cancelar').click(afectado_cancelar_click);
    componentes.pasos.paso3.afectado.children('div.resumen').children('div.container-fluid').children('button.btn').click(afectado_modificar_click);

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
    componentes.pasos.paso3.afectado.children('div.sin-afectado').children('button.btn').css({'border-color':colorBorde, 'background-color':colorFondo});
    componentes.pasos.paso3.afectado.children('div.resumen').children('div.container-fluid').children('button.btn').css({'border-color':colorBorde, 'background-color':colorFondo});
    componentes.pasos.paso3.afectado.children('div.con-afectado').children('div.sugerencias').children('div.table-responsive-md').children('table.table').children('thead').css('background-color', colorBorde);
    componentes.pasos.paso3.afectado.children('div.con-afectado').css('border-color', colorBorde);
    componentes.pasos.paso3.afectado.children('div.resumen').css('border-color', colorBorde);
    componentes.botones.children('button.btn-aceptar').hide();
    componentes.pasos.paso2.poliza.contenedor.hide();
    componentes.pasos.paso3.afectado.children('div.sin-afectado').show();
    componentes.pasos.paso3.afectado.children('div.con-afectado').hide();
    componentes.pasos.paso3.afectado.children('div.resumen').hide();
});
