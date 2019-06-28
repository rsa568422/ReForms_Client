$(document).ready(function() {
    
    // Variables
    // ====================================================================== //
    var googleKey = sessionStorage.googleKey,
        colorBorde = $('#btn-activos').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.2)',
        sinColor = 'rgb(0, 0, 0, 0)',
        trabajadores = {
            'listaTrabajadores': [],
            'trabajadorSeleccionado': null,
            'cargoSeleccionado' : null,
            'operarioSeleccionado': null,
            'listaCapacidades': [],
            'capacidadSeleccionada': null,
            'listaNominas': [],
            'nominaSeleccionada': null,
            'propiedad' : null,
            'listaCoincidencias': [],
            'coincidenciaSeleccionada' : null
        },
        vehiculos = {
            'listaVehiculos': [],
            'vehiculoSeleccionado': null,
            'listaMantenimientos': [],
            'mantenimientoSeleccionado': null
        },
        materiales = {
            
        },
        validacionDatos = null,
        edicion = false;
    
    // Funciones auxiliares
    // ====================================================================== //
    function alerta(titulo, mensaje) {
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-header').children('.modal-title').html(titulo);
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-body').html(mensaje);
        $('#activador-alerta').click();
    }
    
    function mostrar_tabla_trabajadores(cuerpo) {
        var i;
        for (i = 0; i < trabajadores.listaTrabajadores.length; i++) {
            var apellidos = trabajadores.listaTrabajadores[i].apellido1;
            if (trabajadores.listaTrabajadores[i].apellido2 && trabajadores.listaTrabajadores[i].apellido2 !== '') {
                apellidos += ' ' + trabajadores.listaTrabajadores[i].apellido2;
            }
            cuerpo.append('<tr class="trabajador"><td>' + trabajadores.listaTrabajadores[i].nombre + '</td><td>' + apellidos + '</td></tr>');
        }
        cuerpo.children('.trabajador').click(trabajador_click);
    }
    
    function mostrar_tabla_nominas(cuerpo) {
        var i;
        for (i = 0; i < trabajadores.listaNominas.length; i++) {
            var fecha = trabajadores.listaNominas[i].fecha.slice(0, trabajadores.listaNominas[i].fecha.indexOf('T')),
                estado;
            switch (trabajadores.listaNominas[i].estado) {
                case 0: estado = 'pendiente'; break;
                case 1: estado = 'pagada'; break;
                case 2: estado = 'adelanto'; break;
                default: estado = '';
            }
            cuerpo.append('<tr class="nomina"><td>' + fecha + '</td><td>' + estado + '</td><td>' + trabajadores.listaNominas[i].importe + '</td></tr>');
        }
        cuerpo.children('.nomina').dblclick(nomina_dblclick);
    }
    
    function mostrar_tabla_cargos(cuerpo) {
        var gerente = false,
            operador = false,
            operario = false,
            nuevo = cuerpo.children('.cargo-nuevo').find('select[name="cargo"]');
        cuerpo.parent('table').siblings('.btn').show();
        nuevo.children('option').remove();
        $.get('http://localhost:8080/ReForms_Provider/wr/operador/buscarOperadorPorTrabajador/' + trabajadores.trabajadorSeleccionado.id, function(data, status) {
            if (status == 'success') {
                operador = true;
                if (data.gerente && data.gerente == 1) {
                    gerente = true;
                    cuerpo.append('<tr class="cargo cargo-gerente"><td>Gerente</td></tr>');
                    
                }
                cuerpo.append('<tr class="cargo cargo-operador"><td>Operador</td></tr>');
            }
            $.get('http://localhost:8080/ReForms_Provider/wr/operario/buscarOperarioPorTrabajador/' + trabajadores.trabajadorSeleccionado.id, function(data, status) {
                if (status == 'success') {
                    operario = true;
                    cuerpo.append('<tr class="cargo cargo-operario"><td>Operario</td></tr>');
                }
                if (gerente && operario) {
                    cuerpo.parent('table').siblings('.btn').hide();
                } else if (gerente) {
                    // solo operario
                    nuevo.append('<option value=2 selected>Operario</option>');
                } else if (operador && operario) {
                    // solo gerente
                    nuevo.append('<option value=0 selected>Gerente</option>');
                } else if (operador) {
                    // gerente y operario
                    nuevo.append('<option value=0 selected>Gerente</option>');
                    nuevo.append('<option value=2>Operario</option>');
                } else if (operario) {
                    // gerente y operador
                    nuevo.append('<option value=0 selected>Gerente</option>');
                    nuevo.append('<option value=1>Operador</option>');
                } else {
                    // todos
                    nuevo.append('<option value=0 selected>Gerente</option>');
                    nuevo.append('<option value=2>Operario</option>');
                    nuevo.append('<option value=1>Operador</option>');
                }
                cuerpo.children('.cargo-gerente').click(cargo_gerente_click);
                cuerpo.children('.cargo-operador').click(cargo_operador_click);
                cuerpo.children('.cargo-operario').click(cargo_operario_click);
                cuerpo.children('.cargo').click(cargo_click);
            }, 'json');
        }, 'json');
    }
    
    function mostrar_tabla_capacidades(cuerpo) {
        var i;
        for (i = 0; i < trabajadores.listaCapacidades.length; i++) {
            var dificultad;
            switch (trabajadores.listaCapacidades[i].dificultad) {
                case 0: dificultad = 'no cualificado'; break;
                case 1: dificultad = 'ayudante'; break;
                case 2: dificultad = 'profesional'; break;
                case 3: dificultad = 'experto'; break;
            }
            cuerpo.append('<tr title="haga doble click para editar" class="capacidad"><td>' + trabajadores.listaCapacidades[i].gremio.nombre + '</td><td>' + dificultad + '</td></tr>');
        }
        cuerpo.children('.capacidad').dblclick(capacidad_dblclick);
    }
    
    function buscarDireccionGoogle(direccion, coincidencias, cuerpo) {
        $.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + direccion + '&key=' + googleKey, function(data) {
            if (data.results.length > 0) {
                var i, j, k, p, dir;
                trabajadores.listaCoincidencias = [];
                for (i = 0; i < data.results.length; i++) {
                    p = new Propiedad();
                    p.id = -i - 1;
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
                        trabajadores.listaCoincidencias.push(p); 
                        dir = p.direccion + ' ' + p.numero + ', ' + p.localidad.nombre + ' ' + p.localidad.cp;
                        cuerpo.append('<tr class="coincidencia"><td><p>' + dir + '</p></td></tr>');
                    }
                }
                if (trabajadores.listaCoincidencias.length > 0) {
                    cuerpo.children('.coincidencia').click(coincidencia_click);
                    coincidencias.show();
                } else {
                    coincidencias.hide();
                }
            } else {
                coincidencias.hide();
            }
            coincidencias.parent('.col-12').parent('.row').parent('.container-fluid').find('.mapa').hide();
        });
    }
    
    function mostrar_tabla_coincidencias(cuerpo) {
        var i;
        for (i = 0; i < trabajadores.listaCoincidencias.length; i++) {
            var direccion = trabajadores.listaCoincidencias[i].direccion + ' ' + trabajadores.listaCoincidencias[i].numero + ', ';
            if (trabajadores.listaCoincidencias[i].piso && trabajadores.listaCoincidencias[i].piso != '') {
                direccion += trabajadores.listaCoincidencias[i].piso + ', ';
            }
            direccion += trabajadores.listaCoincidencias[i].localidad.nombre + ' ' + trabajadores.listaCoincidencias[i].localidad.cp;
            cuerpo.append('<tr class="coincidencia"><td><p>' + direccion + '</p></td></tr>');
        }
        cuerpo.children('.coincidencia').mouseenter(coincidencia_mouseenter);
        cuerpo.children('.coincidencia').mouseleave(coincidencia_mouseleave);
        cuerpo.children('.coincidencia').click(coincidencia_click);
    }
    
    function mostrar_tabla_vehiculos(cuerpo) {
        var i;
        for (i = 0; i < vehiculos.listaVehiculos.length; i++) {
            var marca, modelo;
            if (vehiculos.listaVehiculos[i].marca && vehiculos.listaVehiculos[i].marca !== '') {
                marca = vehiculos.listaVehiculos[i].marca;
            } else {
                marca = '-';
            }
            if (vehiculos.listaVehiculos[i].modelo && vehiculos.listaVehiculos[i].modelo !== '') {
                modelo = vehiculos.listaVehiculos[i].modelo;
            } else {
                modelo = '-';
            }
            cuerpo.append('<tr class="vehiculo"><td>' + marca + '</td><td>' + modelo + '</td><td>' + vehiculos.listaVehiculos[i].matricula + '</td></tr>');
        }
        cuerpo.children('.vehiculo').click(vehiculo_click);
    }
    
    function mostrar_datos_vehiculo(vehiculo) {
        var matricula = vehiculo.find('input[name=matricula]'),
            marca = vehiculo.find('input[name=marca]'),
            modelo = vehiculo.find('input[name=modelo]'),
            matriculacion = vehiculo.find('input[name=matriculacion]'),
            adquisicion = vehiculo.find('input[name=adquisicion]'),
            km = vehiculo.find('input[name=km]'),
            observaciones = vehiculo.find('textarea[name=observaciones]');
        if (vehiculos.vehiculoSeleccionado.matricula && vehiculos.vehiculoSeleccionado.matricula != null) {
            matricula.val(vehiculos.vehiculoSeleccionado.matricula);
        }
        if (vehiculos.vehiculoSeleccionado.marca && vehiculos.vehiculoSeleccionado.marca != null) {
            marca.val(vehiculos.vehiculoSeleccionado.marca);
        }
        if (vehiculos.vehiculoSeleccionado.modelo && vehiculos.vehiculoSeleccionado.modelo != null) {
            modelo.val(vehiculos.vehiculoSeleccionado.modelo);
        }
        if (vehiculos.vehiculoSeleccionado.matriculacion && vehiculos.vehiculoSeleccionado.matriculacion != null) {
            matriculacion.val(vehiculos.vehiculoSeleccionado.matriculacion.slice(0, vehiculos.vehiculoSeleccionado.matriculacion.indexOf('T')));
        }
        if (vehiculos.vehiculoSeleccionado.adquisicion && vehiculos.vehiculoSeleccionado.adquisicion != null) {
            adquisicion.val(vehiculos.vehiculoSeleccionado.adquisicion.slice(0, vehiculos.vehiculoSeleccionado.adquisicion.indexOf('T')));
        }
        if (vehiculos.vehiculoSeleccionado.km && vehiculos.vehiculoSeleccionado.km != null) {
            km.val(vehiculos.vehiculoSeleccionado.km);
        }
        if (vehiculos.vehiculoSeleccionado.observaciones && vehiculos.vehiculoSeleccionado.observaciones != null) {
            observaciones.val(vehiculos.vehiculoSeleccionado.observaciones);
        }
    }
    
    function telefono_valido(telefonoStr) {
        return /^[69]\d{8}$/.test(telefonoStr);
    }
    
    function dni_valido(dniStr) {
        var patronN = /^\d{8}[a-zA-Z]$/,
            patronE = /^[a-zA-Z]\d{7}[a-zA-Z]$/;
        return patronN.test(dniStr) || patronE.test(dniStr);
    }
    
    function cp_valido(cpStr) {
        return /^\d{5}$/.test(cpStr);
    }
    
    function matricula_valida(matriculaStr) {
        var patron1 = /^\d{4}[ ][a-zA-Z]{3}$/,
            patron2 = /^[a-zA-Z]{1,2}[ ]\d{4}[ ][a-zA-Z]{2,3}$/;
        return patron1.test(matriculaStr) || patron2.test(matriculaStr);
    }
    
    function testValidacion(vd) {
        var x, test = true;
        for (x in vd) {
            if (typeof vd[x] == 'object') {
                test &= testValidacion(vd[x]);
            } else {
                test &= vd[x];
            }
        }
        return test;
    }
    
    function comprobacionDatos(btn) {
        if (testValidacion(validacionDatos)) {
            btn.prop('disabled', false);
        } else {
            btn.prop('disabled', true);
        }
    }
    
    function busquedaPropiedad(coincidencias) {
        var contenedor = coincidencias.parent('.col-12').parent('.row').parent('.container-fluid'),
            cp = contenedor.find('input[name="cp"]'),
            nombreLocalidad = contenedor.find('input[name="nombreLocalidad"]'),
            direccion = contenedor.find('input[name="direccion"]'),
            numero = contenedor.find('input[name="numero"]'),
            piso = contenedor.find('input[name="piso"]'),
            direccionCompleta = cp.val() + '/' + direccion.val() + '/' + numero.val() + '/' + piso.val(),
            cuerpo = coincidencias.find('tbody');
        if (testValidacion(validacionDatos.propiedad)) {
            cuerpo.children('.coincidencia').remove();
            coincidencias.find('.btn-utilizar').prop('disabled', true);
            $.get('http://localhost:8080/ReForms_Provider/wr/propiedad/buscarPropiedadPorDireccionCompleta/' + direccionCompleta, function(data, status) {
                if (status == 'success') {
                    trabajadores.listaCoincidencias = data;
                    mostrar_tabla_coincidencias(cuerpo);
                    coincidencias.show();
                } else {
                    var direccionStr = direccion.val() + ' ' + numero.val() + ', ' + nombreLocalidad.val();
                    buscarDireccionGoogle(direccionStr, coincidencias, cuerpo);
                }
            }, 'json');
        } else {
            coincidencias.hide();
        }
    }
    
    // Funciones controladoras para componentes
    // ====================================================================== //
    function ocultable_click() {
        if (!edicion) {
            $(this).siblings('.ocultable-contenido').slideToggle();
            $(this).parent('.ocultable').siblings('.ocultable').children('.ocultable-contenido').slideUp()();
        }
    }
    
    function trabajador_click() {
        var detalles = $(this).parents('.principal').siblings('.detalles');
        if (!edicion) {
            trabajadores.cargoSeleccionado = null;
            trabajadores.operarioSeleccionado = null;
            if (trabajadores.trabajadorSeleccionado == null || trabajadores.trabajadorSeleccionado.id != trabajadores.listaTrabajadores[$(this).index()].id) {
                trabajadores.trabajadorSeleccionado = trabajadores.listaTrabajadores[$(this).index()];
                $(this).css('background-color', colorFondo);
                $(this).siblings('.trabajador').css('background-color', sinColor);
                detalles.children('.vista').load('Html/trabajador.html', cargar_trabajador);
                detalles.show();
            } else {
                trabajadores.trabajadorSeleccionado = null;
                $(this).css('background-color', sinColor);
                detalles.hide();
            }
        }
    }
    
    function trabajador_editar_click() {
        var trabajador = $(this).parent('.botones').parent('.trabajador');
        if (!edicion) {
            edicion = true;
            trabajador.find('input[name="nombre"]').prop('readonly', false);
            trabajador.find('input[name="apellido1"]').prop('readonly', false);
            trabajador.find('input[name="apellido2"]').prop('readonly', false);
            trabajador.find('input[name="telefono1"]').prop('readonly', false);
            trabajador.find('input[name="telefono2"]').prop('readonly', false);
            $(this).siblings('.btn-aceptar').show();
            $(this).siblings('.btn-cancelar').show();
            $(this).hide();
        }
    }
    
    function trabajador_aceptar_click() {
        var trabajador = $(this).parent('.botones').parent('.trabajador'),
            vista = trabajador.parent('.row').parent('.marco').parent('.vista'),
            cuerpo = vista.parent('.detalles').siblings('.principal').find('tbody'),
            nombre = trabajador.find('input[name="nombre"]'),
            apellido1 = trabajador.find('input[name="apellido1"]'),
            apellido2 = trabajador.find('input[name="apellido2"]'),
            telefono1 = trabajador.find('input[name="telefono1"]'),
            telefono2 = trabajador.find('input[name="telefono2"]'),
            error = !(nombre.prop('validity').valid && apellido1.prop('validity').valid && apellido2.prop('validity').valid && telefono1.prop('validity').valid && telefono2.prop('validity').valid);
        if (!error && telefono1.val() != '') {
            error = !telefono_valido(telefono1.val());
        }
        if (!error && telefono2.val() != '') {
            error = !telefono_valido(telefono2.val());
        }
        if (!error) {
            trabajadores.trabajadorSeleccionado.nombre = nombre.val() != '' ? nombre.val() : null;
            trabajadores.trabajadorSeleccionado.apellido1 = apellido1.val() != '' ? apellido1.val() : null;
            trabajadores.trabajadorSeleccionado.apellido2 = apellido2.val() != '' ? apellido2.val() : null;
            trabajadores.trabajadorSeleccionado.telefono1 = telefono1.val() != '' ? telefono1.val() : null;
            trabajadores.trabajadorSeleccionado.telefono2 = telefono2.val() != '' ? telefono2.val() : null;
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/trabajador/actualizarTrabajador/' + trabajadores.trabajadorSeleccionado.id,
                dataType: 'json',
                type: 'put',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(trabajadores.trabajadorSeleccionado),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    var i, tr, apellidos;
                    trabajadores.capacidadSeleccionada = null;
                    trabajadores.cargoSeleccionado = null;
                    trabajadores.coincidenciaSeleccionada = null;
                    trabajadores.nominaSeleccionada = null;
                    trabajadores.operarioSeleccionado = null;
                    for (i = 0; i < trabajadores.listaTrabajadores.length; i++) {
                        if (trabajadores.trabajadorSeleccionado.id == trabajadores.listaTrabajadores[i].id) {
                            tr = cuerpo.children('tr').eq(i);
                        }
                    }
                    tr.children('td').remove();
                    apellidos = trabajadores.trabajadorSeleccionado.apellido1;
                    if (trabajadores.trabajadorSeleccionado.apellido2 && trabajadores.trabajadorSeleccionado.apellido2 !== '') {
                        apellidos += ' ' + trabajadores.trabajadorSeleccionado.apellido2;
                    }
                    tr.append('<td>' + trabajadores.trabajadorSeleccionado.nombre + '</td><td>' + apellidos + '</td>');
                    vista.load('Html/trabajador.html', cargar_trabajador);
                },
                error: function(jqXhr, textStatus, errorThrown){
                    alerta('Error en proveedor', 'no ha sido posible actualizar el trabajador');
                }
            });
        } else {
            alerta('Error en los datos', 'revise los datos del trabajador');
        }
        $(this).siblings('.btn-cancelar').click();
    }
    
    function trabajador_cancelar_click() {
        var trabajador = $(this).parent('.botones').parent('.trabajador');
        edicion = false;
        trabajador.find('input[name="nombre"]').prop('readonly', true).val(trabajadores.trabajadorSeleccionado.nombre);
        trabajador.find('input[name="apellido1"]').prop('readonly', true).val(trabajadores.trabajadorSeleccionado.apellido1);
        trabajador.find('input[name="apellido2"]').prop('readonly', true).val(trabajadores.trabajadorSeleccionado.apellido2);
        trabajador.find('input[name="telefono1"]').prop('readonly', true).val(trabajadores.trabajadorSeleccionado.telefono1);
        trabajador.find('input[name="telefono2"]').prop('readonly', true).val(trabajadores.trabajadorSeleccionado.telefono2);
        $(this).siblings('.btn-editar').show();
        $(this).siblings('.btn-aceptar').hide();
        $(this).hide();
    }
    
    function cargo_nuevo_click() {
        var cuerpo = $(this).siblings('table').find('tbody');
        if (!edicion) {
            edicion = true;
            cuerpo.children('.cargo').remove();
            cuerpo.children('.cargo-nuevo').show();
            cuerpo.find('select[name="cargo"]').change();
            $(this).siblings('.btn-aceptar').show();
            $(this).siblings('.btn-cancelar').show();
            $(this).hide();
        }
    }
    
    function cargo_aceptar_click() {
        var cargo = $(this).siblings('table').children('tbody').find('select[name="cargo"]'),
            cancelar = $(this).siblings('.btn-cancelar'),
            vista = $('#trabajadores').children('.marco').children('.row').children('.detalles').children('.vista');
        switch (cargo.val()) {
            case '0':
                $.get('http://localhost:8080/ReForms_Provider/wr/operador/buscarOperadorPorTrabajador/' + trabajadores.trabajadorSeleccionado.id, function(data, status) {
                    if (status == 'success') {
                        var operador = data;
                        operador.gerente = 1;
                        $.ajax({
                            url: 'http://localhost:8080/ReForms_Provider/wr/operador/agregarGerente/' + operador.id,
                            dataType: 'json',
                            type: 'put',
                            contentType: 'application/json;charset=UTF-8',
                            data: JSON.stringify(operador),
                            processData: false,
                            success: function(data, textStatus, jQxhr){
                                vista.load('Html/trabajador.html', cargar_trabajador);
                                edicion = false;
                            },
                            error: function(jqXhr, textStatus, errorThrown){
                                alerta('Error en proveedor', 'no ha sido posible agregar el cargo de gerente');
                            }
                        });
                    } else if (confirm("El cargo de Gerente agregara el cargo de Operador")) {
                        var o = new Operador();
                        o.gerente = 1;
                        o.trabajador = trabajadores.trabajadorSeleccionado;
                        $.ajax({
                            url: 'http://localhost:8080/ReForms_Provider/wr/operador/agregarOperador',
                            dataType: 'json',
                            type: 'post',
                            contentType: 'application/json;charset=UTF-8',
                            data: JSON.stringify(o),
                            processData: false,
                            success: function(data, textStatus, jQxhr){
                                vista.load('Html/trabajador.html', cargar_trabajador);
                                edicion = false;
                            },
                            error: function(jQxhr, textStatus, errorThrown){
                                alerta('Error en proveedor', 'no ha sido posible agregar los cargos de gerente y operador');
                            }
                        });
                    } else {
                        cancelar.click();
                    }
                }, 'json');
                break;
            case '1':
                var o = new Operador();
                o.trabajador = trabajadores.trabajadorSeleccionado;
                $.ajax({
                    url: 'http://localhost:8080/ReForms_Provider/wr/operador/agregarOperador',
                    dataType: 'json',
                    type: 'post',
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify(o),
                    processData: false,
                    success: function(data, textStatus, jQxhr){
                        vista.load('Html/trabajador.html', cargar_trabajador);
                        edicion = false;
                    },
                    error: function(jQxhr, textStatus, errorThrown){
                        alerta('Error en proveedor', 'no ha sido posible agregar el cargo de operador');
                    }
                });
                break;
            case '2':
                var dispositivo = vista.find('input[name="dispositivo"]'),
                    telefono = vista.find('input[name="telefono"]'),
                    email = vista.find('input[name="email"]'),
                    pass = vista.find('input[name="pass"]'),
                    carnet = vista.find('input[name="carnet"]'),
                    error = false,
                    o = new Operario();
                if (dispositivo.val() != '') {
                    if (dispositivo.prop('validity').valid) {
                        o.dispositivo = dispositivo.val();
                    } else {
                        error = true;
                    }
                }
                if (telefono.val() != '') {
                    if (telefono.prop('validity').valid && telefono_valido(telefono.val())) {
                        o.telefono = telefono.val();
                    } else {
                        error = true;
                    }
                }
                if (email.val() != '') {
                    if (email.prop('validity').valid) {
                        o.email = email.val();
                    } else {
                        error = true;
                    }
                }
                if (pass.val() != '') {
                    if (pass.prop('validity').valid) {
                        o.pass = pass.val();
                    } else {
                        error = true;
                    }
                }
                if (carnet.prop('checked')) {
                    o.carnet = 1;
                }
                o.trabajador = trabajadores.trabajadorSeleccionado;
                if (!error) {
                    $.ajax({
                        url: 'http://localhost:8080/ReForms_Provider/wr/operario/agregarOperario',
                        dataType: 'json',
                        type: 'post',
                        contentType: 'application/json;charset=UTF-8',
                        data: JSON.stringify(o),
                        processData: false,
                        success: function(data, textStatus, jQxhr){
                            vista.load('Html/trabajador.html', cargar_trabajador);
                            edicion = false;
                        },
                        error: function(jQxhr, textStatus, errorThrown){
                            alerta('Error en proveedor', 'no ha sido posible agregar el cargo de operario');
                        }
                    });
                } else {
                    alerta('Error en los datos', 'revise los datos del operario');
                }
                o.trabajador = trabajadores.trabajadorSeleccionado;
                break;
        }
    }
    
    function cargo_cancelar_click() {
        var cuerpo = $(this).siblings('table').children('tbody');
        edicion = false;
        trabajadores.cargoSeleccionado = null;
        trabajadores.operarioSeleccionado = null;
        mostrar_tabla_cargos(cuerpo);
        cuerpo.children('.cargo-nuevo').hide();
        $(this).hide();
        $(this).siblings('.btn-aceptar').hide();
        $(this).siblings('.btn-nuevo').show();
        $(this).parent('.tabla').parent('.col-12').parent('.lista').siblings('.detalles').hide();
    }
    
    function trabajador_cargo_change() {
        var detalles = $(this).parent('td').parent('.cargo-nuevo').parent('tbody').parent('table').parent('.tabla').parent('.col-12').parent('.lista').siblings('.detalles');
        if ($(this).val() == '2') {
            detalles.children('.vista').load('Html/operario.html', cargar_nuevo_operario);
            detalles.show();
        } else {
            detalles.hide();
        }
    }
    
    function cargo_click() {
        var detalles = $(this).parents('.lista').siblings('.detalles');
        if (!edicion) {
            trabajadores.operarioSeleccionado = null;
            if (trabajadores.cargoSeleccionado == null || trabajadores.cargoSeleccionado != $(this).index()) {
                trabajadores.cargoSeleccionado = $(this).index();
                $(this).css('background-color', colorFondo);
                $(this).siblings('.cargo').css('background-color', sinColor);
            } else {
                trabajadores.cargoSeleccionado = null;
                $(this).css('background-color', sinColor);
                detalles.hide();
            }
        }
    }
    
    function cargo_gerente_click() {
        var detalles = $(this).parents('.lista').siblings('.detalles');
        if (!edicion) {
            detalles.children('.vista').html('<div class="marco container-fluid"><div class="row"><h3>Gerente</h3></div></div>');
            detalles.show();
        }
    }
    
    function cargo_operador_click() {
        var detalles = $(this).parents('.lista').siblings('.detalles');
        if (!edicion) {
            detalles.children('.vista').html('<div class="marco container-fluid"><div class="row"><h3>Operador</h3></div></div>');
            detalles.show();
        }
    }
    
    function cargo_operario_click() {
        var detalles = $(this).parents('.lista').siblings('.detalles');
        if (!edicion) {
            if (trabajadores.cargoSeleccionado == null || trabajadores.cargoSeleccionado != $(this).index()) {
                detalles.children('.vista').load('Html/operario.html', cargar_operario);
                detalles.show();
            }
        }
    }
    
    function capacidad_dblclick() {
        if (!edicion) {
            var dificultad = trabajadores.listaCapacidades[$(this).index() - 1].dificultad,
                o0 = '<option value=0' + (dificultad == 0 ? ' selected' : '') + '>no cualificado</option>',
                o1 = '<option value=1' + (dificultad == 1 ? ' selected' : '') + '>ayudante</option>',
                o2 = '<option value=2' + (dificultad == 2 ? ' selected' : '') + '>profesional</option>',
                o3 = '<option value=3' + (dificultad == 3 ? ' selected' : '') + '>experto</option>',
                td = '<td><select name="cambioCapacidad" class="form-control custom-select">' + o0 + o1 + o2 + o3 + '</select></td>';
            edicion = true;
            $(this).children('td:last').remove();
            $(this).append(td);
            $(this).children('td:last').children('select[name="cambioCapacidad"]').change(cambio_capacidad_change);
        }
    }
    
    function cambio_capacidad_change() {
        var tr = $(this).parent('td').parent('tr'), dificultad, d = $(this).val();
        switch (d) {
            case '0': dificultad = 'no cualificado'; break;
            case '1': dificultad = 'ayudante'; break;
            case '2': dificultad = 'profesional'; break;
            case '3': dificultad = 'experto'; break;
        }
        trabajadores.listaCapacidades[tr.index() - 1].dificultad = d;
        $.ajax({
            url: 'http://localhost:8080/ReForms_Provider/wr/capacidad/actualizarCapacidad/' + trabajadores.listaCapacidades[tr.index() - 1].id,
            dataType: 'json',
            type: 'put',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(trabajadores.listaCapacidades[tr.index() - 1]),
            processData: false,
            success: function(data, textStatus, jQxhr){
                trabajadores.capacidadSeleccionada = null;
                tr.children('td:last').remove();
                tr.append('<td>' + dificultad + '</td>');
            },
            error: function(jqXhr, textStatus, errorThrown){
                alerta('Error en proveedor', 'no ha sido posible actualizar la capacidad del operario');
            }
        });
        edicion = false;
    }
    
    function capacidad_nueva_click() {
        var cuerpo = $(this).parent('div').siblings('table').children('tbody'),
            nueva = cuerpo.children('.capacidad-nueva'),
            gremio = nueva.find('select[name="gremio"]'),
            boton = $(this);
        if (!edicion) {
            cuerpo.children('.capacidad').remove();
            $.get('http://localhost:8080/ReForms_Provider/wr/gremio/obtenerGremios', function(data, status) {
                if (status == 'success') {
                    var i = 0, j;
                    while (data.length > 0 && i < trabajadores.listaCapacidades.length) {
                        for (j = 0; j < data.length; j++) {
                            if (trabajadores.listaCapacidades[i].gremio.id == data[j].id) {
                                data.splice(j, 1);
                                j--;
                            }
                        }
                        i++;
                    }
                    gremio.children('.gremio').remove();
                    if (data.length > 0) {
                        for (i = 0; i < data.length; i++) {
                            gremio.append('<option class="gremio" value=' + data[i].id + '>' + data[i].nombre + '</option>');
                        }
                        edicion = true;
                        nueva.show();
                        boton.hide();
                        boton.siblings('button').show();
                    } else {
                        alerta('Aviso', 'este operario ya tiene registrada su capacidad en todos los gremios actuales, registre nuevos gremios o actualice su habilidad sobre los existentes');
                        boton.siblings('.btn-cancelar').click();
                    }
                } else {
                    alerta('Error en proveedor', 'no ha sido posible obtener los gremios');
                }
            }, 'json');
            
        }
    }
    
    function capacidades_aceptar_click() {
        var c = new Capacidad(), g = new Gremio(),
            nueva = $(this).parent('div').siblings('table').children('tbody').children('.capacidad-nueva'),
            dificultad = nueva.find('select[name="capacidad"]'),
            gremio = nueva.find('select[name="gremio"]'),
            vista = $(this).parent('div').parent('.tabla').parent('.col-12').parent('.capacidades').parent('.marco').parent('.vista');
        c.dificultad = dificultad.val();
        g.id = gremio.val();
        g.nombre = gremio.children('option[value=' + g.id + ']').html();
        c.gremio = g;
        c.operario = trabajadores.operarioSeleccionado;
        $.ajax({
            url: 'http://localhost:8080/ReForms_Provider/wr/capacidad/agregarCapacidad',
            dataType: 'json',
            type: 'post',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(c),
            processData: false,
            success: function(data, textStatus, jQxhr){
                vista.load('Html/operario.html', cargar_operario);
                edicion = false;
            },
            error: function(jQxhr, textStatus, errorThrown){
                alerta('Error en proveedor', 'no ha sido posible registrar la capacidad');
            }
        });
    }
    
    function capacidades_cancelar_click() {
        var cuerpo = $(this).parent('div').siblings('table').children('tbody');
        edicion = false;
        cuerpo.children('.capacidad-nueva').hide();
        mostrar_tabla_capacidades(cuerpo);
        $(this).hide();
        $(this).siblings('.btn-aceptar').hide();
        $(this).siblings('.btn-nuevo').show();
    }
    
    function operario_editar_click() {
        var botones = $(this).parent('.col-12').parent('.botones'),
            dispositivo = botones.siblings('.dispositivo');
        if (!edicion) {
            edicion = true;
            botones.siblings('.carnet').find('#carnet').prop('disabled', false);
            dispositivo.find('input[name="dispositivo"]').prop('readonly', false).focus();
            dispositivo.find('input[name="telefono"]').prop('readonly', false);
            dispositivo.find('input[name="email"]').prop('readonly', false);
            dispositivo.find('input[name="pass"]').prop('readonly', false);
            $(this).siblings('.btn').show();
            $(this).hide();
        }
    }
    
    function operario_aceptar_click() {
        var botones = $(this).parent('.col-12').parent('.botones'),
            d = botones.siblings('.dispositivo'),
            carnet = botones.siblings('.carnet').find('#carnet'),
            dispositivo = d.find('input[name="dispositivo"]'),
            telefono = d.find('input[name="telefono"]'),
            email = d.find('input[name="email"]'),
            pass = d.find('input[name="pass"]'),
            calcelar = $(this).siblings('.btn-cancelar'),
            error = !(dispositivo.prop('validity').valid && telefono.prop('validity').valid && email.prop('validity').valid && pass.prop('validity').valid);
        if (!error && telefono.val() != '') {
            error = !telefono_valido(telefono.val());
        }
        if (!error) {
            trabajadores.operarioSeleccionado.dispositivo = dispositivo.val() != '' ? dispositivo.val() : null;
            trabajadores.operarioSeleccionado.telefono = telefono.val() != '' ? telefono.val() : null;
            trabajadores.operarioSeleccionado.email = email.val() != '' ? email.val() : null;
            trabajadores.operarioSeleccionado.pass = pass.val() != '' ? pass.val() : null;
            trabajadores.operarioSeleccionado.carnet = carnet.prop('checked') ? 1 : 0;
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/operario/actualizarOperario/' + trabajadores.operarioSeleccionado.id,
                dataType: 'json',
                type: 'put',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(trabajadores.operarioSeleccionado),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    calcelar.click();
                },
                error: function(jqXhr, textStatus, errorThrown){
                    alerta('Error en proveedor', 'no ha sido posible actualizar el operario');
                }
            });
        } else {
            alerta('Error en los datos', 'revise los datos del operario');
        }
    }
    
    function operario_cancelar_click() {
        var botones = $(this).parent('.col-12').parent('.botones'),
            carnet = botones.siblings('.carnet').find('#carnet'),
            dispositivo = botones.siblings('.dispositivo');
        edicion = false;
        dispositivo.find('input[name="dispositivo"]').val(trabajadores.operarioSeleccionado.dispositivo).prop('readonly', true);
        dispositivo.find('input[name="telefono"]').val(trabajadores.operarioSeleccionado.telefono).prop('readonly', true);
        dispositivo.find('input[name="email"]').val(trabajadores.operarioSeleccionado.email).prop('readonly', true);
        dispositivo.find('input[name="pass"]').val(trabajadores.operarioSeleccionado.pass).prop('readonly', true);
        carnet.prop('checked', trabajadores.operarioSeleccionado.carnet && trabajadores.operarioSeleccionado.carnet == 1).prop('disabled', true);
        $(this).hide();
        $(this).siblings('.btn-aceptar').hide();
        $(this).siblings('.btn-editar').show();
    }
    
    function nuevo_trabajador_click() {
        var detalles = $(this).parents('.principal').siblings('.detalles');
        if (!edicion) {
            edicion = true;
            $(this).siblings('table').find('.trabajador').css('background-color', sinColor);
            $(this).prop('disabled', true);
            detalles.children('.vista').load('Html/trabajador.html', cargar_nuevo_trabajador);
            detalles.show();
        }
    }
    
    function trabajador_dni_change() {
        var dniStr = $(this).val(),
            btn = $(this).parent('div').siblings('.botones').children('.btn-aceptar');
        if ($(this).prop('validity').valid && dni_valido(dniStr)) {
            $(this).val($(this).val().toUpperCase());
            $.get('http://localhost:8080/ReForms_Provider/wr/trabajador/comprobarDni/' + dniStr, function(data, status) {
                if (status == 'success') {
                    validacionDatos.dni = true;
                } else {
                    alerta('Error en los datos', 'ya existe un trabajador con este dni');
                    validacionDatos.dni = false;
                }
                comprobacionDatos(btn);
            }, 'json');
        } else {
            alerta('Error en los datos', 'dni incorrecto');
            validacionDatos.dni = false;
            comprobacionDatos(btn);
        }
    }
    
    function trabajador_nombre_change() {
        var btn = $(this).parent('div').siblings('.botones').children('.btn-aceptar');
        if ($(this).prop('validity').valid && $(this).val() != '') {
            validacionDatos.nombre = true;
        } else {
            validacionDatos.nombre = false;
        }
        comprobacionDatos(btn);
    }
    
    function trabajador_apellido1_change() {
        var btn = $(this).parent('div').parent('div').siblings('.botones').children('.btn-aceptar');
        if ($(this).prop('validity').valid && $(this).val() != '') {
            validacionDatos.apellido1 = true;
        } else {
            validacionDatos.apellido1 = false;
        }
        comprobacionDatos(btn);
    }
    
    function propiedad_cp_change() {
        var btn = $(this).parents('.propiedad').siblings('.trabajador').children('.botones').children('.btn-aceptar'),
            nombreLocalidad = $(this).siblings('input[name="nombreLocalidad"]'),
            contenedor = $(this).parent('div').parent('.localidad').parent('div').parent('.row').parent('.container-fluid'),
            coincidencias = contenedor.find('.coincidencias');
        if ($(this).prop('validity').valid && cp_valido($(this).val())) {
            $.get('http://localhost:8080/ReForms_Provider/wr/localidad/buscarLocalidadPorCodigoPostal/' + $(this).val(), function(data, status) {
                validacionDatos.propiedad.cp = true;
                if (status == 'success') {
                    validacionDatos.propiedad.localidad = true;
                    nombreLocalidad.prop('readonly', true).val(data.nombre);
                    contenedor.find('input[name="direccion"]').focus();
                } else {
                    validacionDatos.propiedad.localidad = false;
                    nombreLocalidad.prop('readonly', false).val('');
                }
                busquedaPropiedad(coincidencias);
                comprobacionDatos(btn);
            }, 'json');
        } else {
            alerta('Error en los datos', 'c.p. incorrecto');
            validacionDatos.cp = false;
            busquedaPropiedad(coincidencias);
            comprobacionDatos(btn);
        }
    }
    
    function propiedad_nombreLocalidad_change() {
        var btn = $(this).parents('.propiedad').siblings('.trabajador').children('.botones').children('.btn-aceptar');
        if ($(this).prop('validity').valid && $(this).val() != '') {
            validacionDatos.propiedad.localidad = true;
        } else {
            validacionDatos.propiedad.localidad = false;
        }
        comprobacionDatos(btn);
    }
    
    function propiedad_direccion_change() {
        var btn = $(this).parents('.propiedad').siblings('.trabajador').children('.botones').children('.btn-aceptar'),
            coincidencias = $(this).parent('div').parent('.col-12').parent('.row').parent('.container-fluid').find('.coincidencias');
        if ($(this).prop('validity').valid && $(this).val() != '') {
            validacionDatos.propiedad.direccion = true;
        } else {
            validacionDatos.propiedad.direccion = false;
        }
        busquedaPropiedad(coincidencias);
        comprobacionDatos(btn);
    }
    
    function propiedad_numero_change() {
        var btn = $(this).parents('.propiedad').siblings('.trabajador').children('.botones').children('.btn-aceptar'),
            coincidencias = $(this).parent('div').parent('.col-12').parent('.row').parent('.container-fluid').find('.coincidencias');
        if ($(this).prop('validity').valid && $(this).val() != '') {
            validacionDatos.propiedad.numero = true;
        } else {
            validacionDatos.propiedad.numero = false;
        }
        busquedaPropiedad(coincidencias);
        comprobacionDatos(btn);
    }
    
    function propiedad_piso_change() {
        var btn = $(this).parents('.propiedad').siblings('.trabajador').children('.botones').children('.btn-aceptar'),
            coincidencias = $(this).parent('div').parent('.col-12').parent('.row').parent('.container-fluid').find('.coincidencias');
        if (!validacionDatos.propiedadConfirmada && $(this).prop('validity').valid && $(this).val() != '') {
            busquedaPropiedad(coincidencias);
        }
    }
    
    function coincidencia_mouseenter() {
        var coincidencia = $(this);
        $.get('http://localhost:8080/ReForms_Provider/wr/poliza/buscarPolizaPorPropiedad/' + trabajadores.listaCoincidencias[$(this).index()].id, function(data, status) {
            if (status == 'success') {
                var i, texto = '[' + data[0].cliente.aseguradora.nombre + '] ' + data[0].numero;
                for (i = 1; i < data.length; i++) {
                    texto += ' [' + data[i].cliente.aseguradora.nombre + '] ' + data[i].numero;
                }
                coincidencia.children('td').children('p').text(texto);
            } else {
                coincidencia.children('td').children('p').text('sin poliza asociada');
            }
        }, 'json');
    }
    
    function coincidencia_mouseleave() {
        var direccion = trabajadores.listaCoincidencias[$(this).index()].direccion + ' ' + trabajadores.listaCoincidencias[$(this).index()].numero + ', ';
        if (trabajadores.listaCoincidencias[$(this).index()].piso && trabajadores.listaCoincidencias[$(this).index()].piso != '') {
            direccion += trabajadores.listaCoincidencias[$(this).index()].piso + ', ';
        }
        direccion += trabajadores.listaCoincidencias[$(this).index()].localidad.nombre + ' ' + trabajadores.listaCoincidencias[$(this).index()].localidad.cp;
        $(this).children('td').children('p').text(direccion);
    }
    
    function coincidencia_click() {
        var coincidencias = $(this).parents('.coincidencias'),
            contenedor = coincidencias.parent('.col-12').parent('.row').parent('.container-fluid'),
            mapa = contenedor.find('.mapa'),
            utilizar = coincidencias.find('.btn-utilizar');
        if (trabajadores.coincidenciaSeleccionada == null || trabajadores.coincidenciaSeleccionada.id != trabajadores.listaCoincidencias[$(this).index()].id) {
            trabajadores.coincidenciaSeleccionada = trabajadores.listaCoincidencias[$(this).index()];
            if (trabajadores.coincidenciaSeleccionada.geolat != null && trabajadores.coincidenciaSeleccionada.geolat !== '' &&
                trabajadores.coincidenciaSeleccionada.geolong != null && trabajadores.coincidenciaSeleccionada.geolong !== '') {
                var s = '<iframe id="mapa" allowfullscreen frameborder="0" width="100%" height="320px" src="https://www.google.com/maps/embed/v1/view?key=' + googleKey + '&center=' + trabajadores.coincidenciaSeleccionada.geolat + ',' + trabajadores.coincidenciaSeleccionada.geolong + '&zoom=18"></iframe>';
                mapa.children('#mapa').remove();
                mapa.append(s);
                mapa.show();
            } else {
                mapa.hide();
            }
            utilizar.prop('disabled', false);
            $(this).css('background-color', colorFondo);
            $(this).siblings('.coincidencia').css('background-color', sinColor);
        } else {
            trabajadores.coincidenciaSeleccionada = null;
            $(this).css('background-color', sinColor);
            utilizar.prop('disabled', true);
            mapa.hide();
        }
    }
    
    function coincidencia_utilizar_click() {
        var coincidencias = $(this).parent('div').parent('.coincidencias'),
            contenedor = coincidencias.parent('.col-12').parent('.row').parent('.container-fluid'),
            cp = contenedor.find('input[name="cp"]'),
            nombreLocalidad = contenedor.find('input[name="nombreLocalidad"]'),
            direccion = contenedor.find('input[name="direccion"]'),
            numero = contenedor.find('input[name="numero"]'),
            piso = contenedor.find('input[name="piso"]'),
            observaciones = contenedor.find('textarea[name="observaciones"]'),
            mapa = contenedor.find('.mapa'),
            btn = contenedor.parent('.vista').parent('.propiedad').siblings('.trabajador').children('.botones').children('.btn-aceptar');
        if (trabajadores.coincidenciaSeleccionada.id < 0) {
            // coincidencia de google
            trabajadores.coincidenciaSeleccionada.id = null;
            piso.val('').prop('readonly', false).focus();
        } else {
            // coincidencia de DB
            if (trabajadores.coincidenciaSeleccionada.piso != null && trabajadores.coincidenciaSeleccionada.piso != '') {
                piso.val(trabajadores.coincidenciaSeleccionada.piso);
            } else {
                piso.val('');
            }
            piso.prop('readonly', true);
        }
        trabajadores.propiedad = trabajadores.coincidenciaSeleccionada;
        validacionDatos.propiedadConfirmada = true;
        comprobacionDatos(btn);
        cp.prop('readonly', true);
        nombreLocalidad.prop('readonly', true);
        direccion.val(trabajadores.propiedad.direccion).prop('readonly', true);
        numero.prop('readonly', true);
        if (trabajadores.propiedad.observaciones && trabajadores.propiedad.observaciones != null && trabajadores.propiedad.observaciones != '') {
            observaciones.val(trabajadores.propiedad.observaciones);
        } else {
            observaciones.val('');
        }
        $(this).prop('disabled', true);
        trabajadores.listaCoincidencias = [];
        trabajadores.coincidenciaSeleccionada = null;
        coincidencias.hide();
        mapa.hide();
    }
    
    function nuevo_trabajador_aceptar_click() {
        var trabajador = $(this).parent('.botones').parent('.trabajador'),
            dni = trabajador.find('input[name="dni"]'),
            nombre = trabajador.find('input[name="nombre"]'),
            apellido1 = trabajador.find('input[name="apellido1"]'),
            apellido2 = trabajador.find('input[name="apellido2"]'),
            telefono1 = trabajador.find('input[name="telefono1"]'),
            telefono2 = trabajador.find('input[name="telefono2"]'),
            email = trabajador.find('input[name="email"]'),
            password = trabajador.find('input[name="password"]'),
            propiedad = trabajador.siblings('.propiedad'),
            piso = propiedad.find('input[name="piso"]'),
            observaciones = propiedad.find('textarea[name="observaciones"]'),
            error = false,
            t = new Trabajador();
        if (dni.prop('validity').valid && dni.val() != '' && dni_valido(dni.val())) {
            t.dni = dni.val();
        } else {
            error = true;
        }
        if (nombre.prop('validity').valid && nombre.val() != '') {
            t.nombre = nombre.val();
        } else {
            error = true;
        }
        if (apellido1.prop('validity').valid && apellido1.val() != '') {
            t.apellido1 = apellido1.val();
        } else {
            error = true;
        }
        if (apellido2.prop('validity').valid) {
            t.apellido2 = apellido2.val() !== '' ? apellido2.val() : null;
        }
        if (telefono1.prop('validity').valid && telefono1.val() !== '') {
            if (telefono_valido(telefono1.val())) {
                t.telefono1 = telefono1.val();
            } else {
                error = true;
            }
        }
        if (telefono2.prop('validity').valid && telefono2.val() !== '') {
            if (telefono_valido(telefono2.val())) {
                t.telefono2 = telefono2.val();
            } else {
                error = true;
            }
        }
        if (email.val() !== '') {
            if (email.prop('validity').valid) {
                t.email = email.val();
            } else {
                error = true;
            }
        }
        if (password.prop('validity').valid) {
            t.password = password.val() !== '' ? password.val() : null;
        }
        if (piso.prop('validity').valid) {
            trabajadores.propiedad.piso = piso.val() !== '' ? piso.val() : null;
        }
        if (observaciones.prop('validity').valid) {
            trabajadores.propiedad.observaciones = observaciones.val() !== '' ? observaciones.val() : null;
        }
        if (!error) {
            t.propiedad = trabajadores.propiedad;
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/trabajador/registrarTrabajador',
                dataType: 'json',
                type: 'post',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(t),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    $('#trabajadores').load('Html/trabajadores.html', cargar_trabajadores);
                    edicion = false;
                },
                error: function(jQxhr, textStatus, errorThrown){
                    alerta('Error en proveedor', 'no ha sido posible registrar el trabajador');
                }
            });
        } else {
            alerta('Error en los datos', 'revise los datos del trabajador');
        }
    }
    
    function nuevo_trabajador_cancelar_click() {
        var detalles = $(this).parents('.detalles');
        edicion = false;
        detalles.children('.vista').html('');
        detalles.siblings('.principal').find('.btn').prop('disabled', false);
        detalles.hide();
    }
    
    function trabajador_tipo_click() {
        var cuerpo = $(this).parent('.filtro').siblings('.tabla').find('tbody');
        if (!edicion) {
            trabajadores.trabajadorSeleccionado = null;
            trabajadores.cargoSeleccionado = null;
            trabajadores.operarioSeleccionado = null;
            cuerpo.children('.trabajador').remove();
            switch ($(this).index()) {
                case 0: // Trabajadores
                    $.get('http://localhost:8080/ReForms_Provider/wr/trabajador/obtenerTrabajadores', function(data, status) {
                        if (status == 'success') {
                            trabajadores.listaTrabajadores = data;
                            mostrar_tabla_trabajadores(cuerpo);
                        }
                    }, 'json');
                    break;
                case 1: // Operadores
                    $.get('http://localhost:8080/ReForms_Provider/wr/trabajador/obtenerOperadores', function(data, status) {
                        if (status == 'success') {
                            trabajadores.listaTrabajadores = data;
                            mostrar_tabla_trabajadores(cuerpo);
                        }
                    }, 'json');
                    break;
                case 2: // Operarios
                    $.get('http://localhost:8080/ReForms_Provider/wr/trabajador/obtenerOperarios', function(data, status) {
                        if (status == 'success') {
                            trabajadores.listaTrabajadores = data;
                            mostrar_tabla_trabajadores(cuerpo);
                        }
                    }, 'json');
                    break;
            }
            $(this).siblings('.btn-tipo').css({'border-color':colorBorde, 'background-color':colorFondo});
            $(this).css('background-color', colorBorde);
            $(this).parents('.principal').siblings('.detalles').hide();
        }
    }
    
    function nomina_nueva_click() {
        if (!edicion) {
            edicion = true;
            $(this).hide();
            $(this).siblings('.btn').show();
            $(this).parent('div').siblings('table').children('tbody').children('.nomina-nueva').show();
        }
    }
    
    function nomina_aceptar_click() {
        var nueva = $(this).parent('div').siblings('table').children('tbody').children('.nomina-nueva'),
            fecha = nueva.find('input[name="fecha"]'),
            importe = nueva.find('input[name="importe"]'),
            error = !(fecha.prop('validity').valid && importe.prop('validity').valid);
        if (!error) {
            var n =  new Nomina();
            n.fecha = new Date(fecha.val());
            n.importe = importe.val();
            n.estado = nueva.find('select[name="estado"]').val();
            n.trabajador = trabajadores.trabajadorSeleccionado;
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/nomina/agregarNomina',
                dataType: 'json',
                type: 'post',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(n),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    $('#trabajadores').load('Html/trabajadores.html', cargar_trabajadores);
                    edicion = false;
                },
                error: function(jQxhr, textStatus, errorThrown){
                    alerta('Error en proveedor', 'no ha sido posible registrar la nomina');
                }
            });
        } else {
            alerta('Error en los datos', 'revise los datos de la nomina');
        }
    }
    
    function nomina_cancelar_click() {
        var nueva = $(this).parent('div').siblings('table').children('tbody').children('.nomina-nueva');
        edicion = false;
        $(this).hide();
        $(this).siblings('.btn-aceptar').hide();
        $(this).siblings('.btn-nuevo').show();
        nueva.find('input[name="fecha"]').val('');
        nueva.find('select[name="estado"]').val(0);
        nueva.find('input[name="importe"]').val(0);
        nueva.hide();
    }
    
    function nomina_dblclick() {
        if (!edicion) {
            var estado = trabajadores.listaNominas[$(this).index() - 1].estado,
                o0 = '<option value=0' + (estado == 0 ? ' selected' : '') + '>pendiente</option>',
                o1 = '<option value=1' + (estado == 1 ? ' selected' : '') + '>pagada</option>',
                o2 = '<option value=2' + (estado == 2 ? ' selected' : '') + '>adelanto</option>',
                td = '<td><select name="cambioEstado" class="form-control custom-select">' + o0 + o1 + o2 + '</select></td>';
            edicion = true;
            $(this).children('td').eq(1).remove();
            $(this).children('td:last').before(td);
            $(this).find('select[name="cambioEstado"]').change(cambio_estado_change);
        }
    }
    
    function cambio_estado_change() {
        var tr = $(this).parent('td').parent('tr'), estado, e = $(this).val();
        switch (e) {
            case '0': estado = 'pendiente'; break;
            case '1': estado = 'pagada'; break;
            case '2': estado = 'adelanto'; break;
        }
        trabajadores.listaNominas[tr.index() - 1].estado = e;
        $.ajax({
            url: 'http://localhost:8080/ReForms_Provider/wr/nomina/actualizarNomina/' + trabajadores.listaNominas[tr.index() - 1].id,
            dataType: 'json',
            type: 'put',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify(trabajadores.listaNominas[tr.index() - 1]),
            processData: false,
            success: function(data, textStatus, jQxhr){
                trabajadores.nominaSeleccionada = null;
                tr.children('td').eq(1).remove();
                tr.children('td:last').before('<td>' + estado + '</td>');
            },
            error: function(jqXhr, textStatus, errorThrown){
                alerta('Error en proveedor', 'no ha sido posible actualizar el estado de la nomina');
            }
        });
        edicion = false;
    }
    
    function vehiculo_click() {
        var detalles = $(this).parents('.tabla').siblings('.detalles');
        if (vehiculos.vehiculoSeleccionado == null || vehiculos.vehiculoSeleccionado.id != vehiculos.listaVehiculos[$(this).index()].id) {
            vehiculos.vehiculoSeleccionado = vehiculos.listaVehiculos[$(this).index()];
            detalles.children('.vista').load('Html/vehiculo.html', cargar_vehiculo);
            $(this).css('background-color', colorFondo);
            $(this).siblings('.vehiculo').css('background-color', sinColor);
        } else {
            vehiculos.vehiculoSeleccionado = null;
            $(this).css('background-color', sinColor);
            detalles.hide();
        }
    }
    
    function vehiculo_aceptar_click() {
        var error = false,
            form = $(this).parent('form'),
            marca = form.find('input[name="marca"]'),
            modelo = form.find('input[name="modelo"]'),
            matriculacion = form.find('input[name="matriculacion"]'),
            adquisicion = form.find('input[name="adquisicion"]'),
            km = form.find('input[name="km"]'),
            observaciones = form.find('textarea[name="observaciones"]');
        if (marca.prop('validity').valid) {
            vehiculos.vehiculoSeleccionado.marca = marca.val() !== '' ? marca.val() : null;
        }
        if (modelo.prop('validity').valid) {
            vehiculos.vehiculoSeleccionado.modelo = modelo.val() !== '' ? modelo.val() : null;
        }
        if (matriculacion.prop('validity').valid) {
            vehiculos.vehiculoSeleccionado.matriculacion = matriculacion.val() !== '' ? new Date(matriculacion.val()) : null;
        }
        if (adquisicion.prop('validity').valid) {
            vehiculos.vehiculoSeleccionado.adquisicion = adquisicion.val() !== '' ? new Date(adquisicion.val()) : null;
        }
        if (km.prop('validity').valid) {
            vehiculos.vehiculoSeleccionado.km = km.val() !== '' ? new Number(km.val()) : null;
        }
        if (observaciones.prop('validity').valid) {
            vehiculos.vehiculoSeleccionado.observaciones = observaciones.val() !== '' ? observaciones.val() : null;
        }
        if (!error) {
            // datos bien, enviar al proveedor
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/vehiculo/actualizarVehiculo/' + vehiculos.vehiculoSeleccionado.id,
                dataType: 'json',
                type: 'put',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(vehiculos.vehiculoSeleccionado),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    vehiculos.vehiculoSeleccionado = null;
                    $('#vehiculos').load('Html/vehiculos.html', cargar_vehiculos);
                },
                error: function(jqXhr, textStatus, errorThrown){
                    alerta('Error en proveedor', 'no ha sido posible actualizar el vehiculo');
                }
            });
        } else {
            // problema en datos del cliente
            alerta('Error en los datos', 'revise los datos del vehiculo');
        }
    }
    
    function vehiculo_cancelar_click() {
        var detalles = $(this).parents('.marco').parent('.vista').parent('.detalles'),
            tbody = detalles.siblings('.tabla').find('tbody');
        vehiculos.vehiculoSeleccionado = null;
        detalles.hide();
        tbody.children('.vehiculo').css('background-color', sinColor);
    }
    
    function nuevo_vehiculo_click() {
        var detalles = $(this).parents('.tabla').siblings('.detalles');
        vehiculos.vehiculoSeleccionado = null;
        $(this).parents('.tabla').find('.vehiculo').remove();
        $(this).prop('disabled', true);
        detalles.children('.vista').load('Html/vehiculo.html', cargar_nuevo_vehiculo);
    }
    
    function nuevo_vehiculo_aceptar_click() {
        var nv = new Vehiculo(),
            error = false,
            form = $(this).parent('form'),
            matricula = form.find('input[name="matricula"]'),
            marca = form.find('input[name="marca"]'),
            modelo = form.find('input[name="modelo"]'),
            matriculacion = form.find('input[name="matriculacion"]'),
            adquisicion = form.find('input[name="adquisicion"]'),
            km = form.find('input[name="km"]'),
            observaciones = form.find('textarea[name="observaciones"]');
        if (matricula.prop('validity').valid && matricula.val() !== '' && matricula_valida(matricula.val())) {
            nv.matricula = matricula.val().toUpperCase();
        } else {
            error = true;
        }
        if (marca.prop('validity').valid) {
            nv.marca = marca.val() !== '' ? marca.val() : null;
        }
        if (modelo.prop('validity').valid) {
            nv.modelo = modelo.val() !== '' ? modelo.val() : null;
        }
        if (matriculacion.prop('validity').valid) {
            nv.matriculacion = matriculacion.val() !== '' ? new Date(matriculacion.val()) : null;
        }
        if (adquisicion.prop('validity').valid) {
            nv.adquisicion = adquisicion.val() !== '' ? new Date(adquisicion.val()) : null;
        }
        if (km.prop('validity').valid) {
            nv.km = km.val() !== '' ? new Number(km.val()) : null;
        }
        if (observaciones.prop('validity').valid) {
            nv.observaciones = observaciones.val() !== '' ? observaciones.val() : null;
        }
        if (!error) {
            // datos bien, enviar al proveedor
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/vehiculo/registrarVehiculo',
                dataType: 'json',
                type: 'post',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(nv),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    $('#vehiculos').load('Html/vehiculos.html', cargar_vehiculos);
                },
                error: function(jQxhr, textStatus, errorThrown){
                    alerta('Error en proveedor', 'no ha sido posible registrar el vehiculo');
                }
            });
        } else {
            // problema en datos del cliente
            alerta('Error en los datos', 'revise los datos del vehiculo');
            matricula.focus();
        }
    }
    
    function nuevo_vehiculo_cancelar_click() {
        var detalles = $(this).parents('.marco').parent('.vista').parent('.detalles'),
            tabla = detalles.siblings('.tabla');
        $('.tabla').find('button').prop('disabled', false);
        mostrar_tabla_vehiculos(tabla.find('tbody'));
        detalles.hide();
    }
    
    function mantenimiento_click() {
        var mantenimientos = $(this).parents('.mantenimientos'),
            detalles = mantenimientos.find('.detalles'),
            tipo = detalles.find('select[name="tipo"]'),
            fecha = detalles.find('input[name="fecha"]'),
            coste = detalles.find('input[name="coste"]'),
            descripcion = detalles.find('textarea[name="descripcion"]');
        vehiculos.mantenimientoSeleccionado = vehiculos.listaMantenimientos[$(this).index()];
        tipo.val(vehiculos.mantenimientoSeleccionado.tipo);
        fecha.val(vehiculos.mantenimientoSeleccionado.fecha.slice(0, vehiculos.mantenimientoSeleccionado.fecha.indexOf('T')));
        coste.val(vehiculos.mantenimientoSeleccionado.coste);
        descripcion.val(vehiculos.mantenimientoSeleccionado.descripcion);
        mantenimientos.find('.btn-nuevo').prop('disabled', true);
        mantenimientos.children('.detalles').show();
    }
    
    function nuevo_mantenimiento_click() {
        var mantenimientos = $(this).parents('.mantenimientos'),
            detalles = mantenimientos.find('.detalles'),
            tipo = detalles.find('select[name="tipo"]'),
            fecha = detalles.find('input[name="fecha"]'),
            coste = detalles.find('input[name="coste"]'),
            descripcion = detalles.find('textarea[name="descripcion"]');
        vehiculos.mantenimientoSeleccionado = null;
        tipo.val(0);
        fecha.val('');
        coste.val(0.0);
        descripcion.val('');
        detalles.show();
        mantenimientos.find('.mantenimiento').remove();
        $(this).prop('disabled', true);
    }
    
    function mantenimiento_aceptar_click() {
        var detalles = $(this).parents('.detalles'),
            tipo = detalles.find('select[name="tipo"]'),
            fecha = detalles.find('input[name="fecha"]'),
            coste = detalles.find('input[name="coste"]'),
            descripcion = detalles.find('textarea[name="descripcion"]'),
            edicion = false, error = false;
        if (vehiculos.mantenimientoSeleccionado != null && vehiculos.mantenimientoSeleccionado.id != null) {
            edicion = true;
        } else {
            vehiculos.mantenimientoSeleccionado = new Mantenimiento();
        }
        if (tipo.prop('validity').valid) {
            vehiculos.mantenimientoSeleccionado.tipo = tipo.val();
        } else {
            error = true;
        }
        if (fecha.prop('validity').valid && fecha.val() != '') {
            vehiculos.mantenimientoSeleccionado.fecha = new Date(fecha.val());
        } else {
            error = true;
        }
        if (coste.prop('validity').valid) {
            vehiculos.mantenimientoSeleccionado.coste = coste.val() !== '' ? new Number(coste.val()) : 0.0;
        }
        if (descripcion.prop('validity').valid) {
            vehiculos.mantenimientoSeleccionado.descripcion = descripcion.val() !== '' ? descripcion.val() : null;
        }
        if (!error) {
            // datos bien, enviar al proveedor
            if (edicion) {
                // edicion del mantenimiento en el proveedor
                $.ajax({
                    url: 'http://localhost:8080/ReForms_Provider/wr/mantenimiento/actualizarMantenimiento/' + vehiculos.mantenimientoSeleccionado.id,
                    dataType: 'json',
                    type: 'put',
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify(vehiculos.mantenimientoSeleccionado),
                    processData: false,
                    success: function(data, textStatus, jQxhr){
                        vehiculos.vehiculoSeleccionado = null;
                        vehiculos.mantenimientoSeleccionado = null;
                        $('#vehiculos').load('Html/vehiculos.html', cargar_vehiculos);
                    },
                    error: function(jqXhr, textStatus, errorThrown){
                        alerta('Error en proveedor', 'no ha sido posible actualizar el mantenimiento');
                    }
                });
            } else {
                // registro del mantenimiento en el proveedor
                vehiculos.mantenimientoSeleccionado.vehiculo = vehiculos.vehiculoSeleccionado;
                $.ajax({
                    url: 'http://localhost:8080/ReForms_Provider/wr/mantenimiento/agregarMantenimiento',
                    dataType: 'json',
                    type: 'post',
                    contentType: 'application/json;charset=UTF-8',
                    data: JSON.stringify(vehiculos.mantenimientoSeleccionado),
                    processData: false,
                    success: function(data, textStatus, jQxhr){
                        vehiculos.vehiculoSeleccionado = null;
                        vehiculos.mantenimientoSeleccionado = null;
                        $('#vehiculos').load('Html/vehiculos.html', cargar_vehiculos);
                    },
                    error: function(jQxhr, textStatus, errorThrown){
                        alerta('Error en proveedor', 'no ha sido posible registrar el mantenimiento');
                    }
                });
            }
        } else {
            // problema en datos del cliente
            alerta('Error en los datos', 'revise los datos del mantenimiento');
            fecha.focus();
        }
    }
    
    function mantenimiento_cancelar_click() {
        var vista = $(this).parents('.marco').parent('.vista');
        vista.load('Html/vehiculo.html', cargar_vehiculo);
    }
    
    // Funciones para cargar paginas y controlar respuestas del proveedor
    // ====================================================================== //
    function cargar_trabajadores(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var principal = $(this).find('.principal'),
                detalles = $(this).find('.detalles'),
                filtro = principal.find('.filtro'),
                tabla = principal.find('.tabla'),
                cuerpo = tabla.children('table').children('tbody'),
                boton = tabla.children('button');
            $.get('http://localhost:8080/ReForms_Provider/wr/trabajador/obtenerTrabajadores', function(data, status) {
                if (status == 'success') {
                    trabajadores.listaTrabajadores = data;
                    mostrar_tabla_trabajadores(cuerpo);
                }
            }, 'json');
            boton.click(nuevo_trabajador_click);
            filtro.find('.btn-tipo').click(trabajador_tipo_click);
            boton.css({'border-color':colorBorde, 'background-color':colorFondo});
            filtro.find('.btn-tipo').css({'border-color':colorBorde, 'background-color':colorFondo});
            filtro.find('.btn-tipo').eq(0).css('background-color', colorBorde);
            tabla.find('thead').css('background-color', colorBorde);
            detalles.children('.vista').css('border-color', colorBorde);
            detalles.hide();
        } else {
            alerta('Error 404', 'no se pudo cargar trabajadores.html');
        }
    }
    
    function cargar_operario(responseTxt, statusTxt) {
        var capacidades = $(this).children('.marco').children('.capacidades'),
            dispositivo = $(this).children('.marco').children('.dispositivo'),
            carnet = $(this).children('.marco').children('.carnet'),
            botones = $(this).children('.marco').children('.botones'),
            dis = dispositivo.find('input[name="dispositivo"]'),
            telefono = dispositivo.find('input[name="telefono"]'),
            email = dispositivo.find('input[name="email"]'),
            pass = dispositivo.find('input[name="pass"]'),
            car = carnet.find('input[name="carnet"]'),
            tabla = capacidades.find('.tabla');
        if (statusTxt == 'success') {
            $.get('http://localhost:8080/ReForms_Provider/wr/operario/buscarOperarioPorTrabajador/' + trabajadores.trabajadorSeleccionado.id, function(data, status) {
                if (status == 'success') {
                    trabajadores.operarioSeleccionado = data;
                    dis.val(trabajadores.operarioSeleccionado.dispositivo).prop('readonly', true);
                    telefono.val(trabajadores.operarioSeleccionado.telefono).prop('readonly', true);
                    email.val(trabajadores.operarioSeleccionado.email).prop('readonly', true);
                    pass.val(trabajadores.operarioSeleccionado.pass).prop('readonly', true);
                    if (trabajadores.operarioSeleccionado.carnet && trabajadores.operarioSeleccionado.carnet == 1) {
                        car.prop('checked', true);
                    }
                    car.prop('disabled', true);
                    $.get('http://localhost:8080/ReForms_Provider/wr/capacidad/buscarCapacidadPorOperario/' + trabajadores.operarioSeleccionado.id, function(data, status) {
                        if (status == 'success') {
                            trabajadores.listaCapacidades = data;
                            mostrar_tabla_capacidades(tabla.find('tbody'));
                        } else {
                            trabajadores.listaCapacidades = [];
                        }
                    }, 'json');
                } else {
                    alerta('Error en proveedor', 'no ha sido posible obtener los datos del operario');
                }
            }, 'json');
            dispositivo.find('.vista').css('border-color', colorBorde);
            tabla.find('thead').css('background-color', colorBorde);
            tabla.find('.btn-nuevo').css({'border-color':colorBorde, 'background-color':colorFondo}).click(capacidad_nueva_click);
            tabla.find('.btn-aceptar').click(capacidades_aceptar_click);
            tabla.find('.btn-cancelar').click(capacidades_cancelar_click);
            botones.find('.btn-editar').css({'border-color':colorBorde, 'background-color':colorFondo}).click(operario_editar_click);
            botones.find('.btn-aceptar').hide().click(operario_aceptar_click);
            botones.find('.btn-cancelar').hide().click(operario_cancelar_click);
            tabla.find('.btn-aceptar').hide();
            tabla.find('.btn-cancelar').hide();
            tabla.find('tbody').children('.capacidad-nueva').hide();
        } else {
            alerta('Error 404', 'no se pudo cargar operario.html');
        }
    }
    
    function cargar_nuevo_operario(responseTxt, statusTxt) {
        var marco = $(this).children('.marco'),
            dispositivo = marco.children('.dispositivo');
        marco.children('.capacidades').remove();
        marco.children('.botones').remove();
        dispositivo.children('.col-12').children('.vista').css('border-color', colorBorde);
        dispositivo.find('input[name="dispositivo"]').focus();
    }
    
    function cargar_nominas(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var cuerpo = $(this).find('tbody');
            $.get('http://localhost:8080/ReForms_Provider/wr/nomina/buscarNominaPorTrabajador/' + trabajadores.trabajadorSeleccionado.id, function(data, status) {
                if (status == 'success') {
                    trabajadores.listaNominas = data;
                    mostrar_tabla_nominas(cuerpo);
                }
            }, 'json');
            cuerpo.children('.nomina-nueva').hide();
            $(this).find('thead').css('background-color', colorBorde);
            $(this).find('.btn-nuevo').css({'border-color':colorBorde, 'background-color':colorFondo}).click(nomina_nueva_click);
            $(this).find('.btn-aceptar').hide().click(nomina_aceptar_click);
            $(this).find('.btn-cancelar').hide().click(nomina_cancelar_click);
        } else {
            alerta('Error 404', 'no se pudo cargar nominas.html');
        }
    }
    
    function cargar_trabajador(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var trabajador = $(this).find('.trabajador'),
                dni = trabajador.find('input[name="dni"]'),
                nombre = trabajador.find('input[name="nombre"]'),
                apellido1 = trabajador.find('input[name="apellido1"]'),
                apellido2 = trabajador.find('input[name="apellido2"]'),
                telefono1 = trabajador.find('input[name="telefono1"]'),
                telefono2 = trabajador.find('input[name="telefono2"]'),
                email = trabajador.find('input[name="email"]'),
                password = trabajador.find('input[name="password"]'),
                propiedad = trabajador.find('input[name="propiedad"]'),
                cargos = $(this).find('.cargos'),
                cuerpoCargos = cargos.find('tbody'),
                detalles = $(this).find('.detalles'),
                nominas = $(this).find('.nominas');
            dni.val(trabajadores.trabajadorSeleccionado.dni).prop('readonly', true);
            nombre.val(trabajadores.trabajadorSeleccionado.nombre).prop('readonly', true);
            apellido1.val(trabajadores.trabajadorSeleccionado.apellido1).prop('readonly', true);
            apellido2.val(trabajadores.trabajadorSeleccionado.apellido2).prop('readonly', true);
            telefono1.val(trabajadores.trabajadorSeleccionado.telefono1).prop('readonly', true);
            telefono2.val(trabajadores.trabajadorSeleccionado.telefono2).prop('readonly', true);
            propiedad.val(trabajadores.trabajadorSeleccionado.propiedad.direccion + ' ' + trabajadores.trabajadorSeleccionado.propiedad.numero + ', ' + trabajadores.trabajadorSeleccionado.propiedad.localidad.nombre).prop('readonly', true);
            email.parent().remove();
            password.parent().remove();
            trabajador.find('.btn-editar').css({'border-color':colorBorde, 'background-color':colorFondo}).click(trabajador_editar_click);
            trabajador.find('.btn-aceptar').hide().click(trabajador_aceptar_click);
            trabajador.find('.btn-cancelar').hide().click(trabajador_cancelar_click);
            mostrar_tabla_cargos(cuerpoCargos);
            cargos.find('thead').css('background-color', colorBorde);
            cargos.find('.btn-nuevo').css({'border-color':colorBorde, 'background-color':colorFondo}).click(cargo_nuevo_click);
            cargos.find('.btn-aceptar').hide().click(cargo_aceptar_click);
            cargos.find('.btn-cancelar').hide().click(cargo_cancelar_click);
            cuerpoCargos.children('.cargo-nuevo').find('select[name="cargo"]').change(trabajador_cargo_change);
            cuerpoCargos.children('.cargo-nuevo').hide();
            detalles.children('.vista').css('border-color', colorBorde);
            detalles.hide();
            nominas.children('.vista').css('border-color', colorBorde).load('Html/nominas.html', cargar_nominas);
            nominas.show();
        } else {
            alerta('Error 404', 'no se pudo cargar trabajador.html');
        }
    }
    
    function cargar_propiedad(responseTxt, statusTxt) {
        var coincidencias = $(this).find('.coincidencias');
        if (statusTxt == 'success') {
            $(this).find('input[name="cp"]').change(propiedad_cp_change);
            $(this).find('input[name="nombreLocalidad"]').prop('readonly', true).change(propiedad_nombreLocalidad_change);
            $(this).find('input[name="direccion"]').change(propiedad_direccion_change);
            $(this).find('input[name="numero"]').change(propiedad_numero_change);
            $(this).find('input[name="piso"]').change(propiedad_piso_change);
            $(this).find('.titulo').append('Residencia');
            coincidencias.css('border-color', colorBorde).hide();
            coincidencias.find('thead').css('background-color', colorBorde);
            coincidencias.find('.btn-utilizar').css({'border-color':colorBorde, 'background-color':colorFondo}).prop('disabled', true).click(coincidencia_utilizar_click);
            $(this).find('.mapa').hide();
        } else {
            alerta('Error 404', 'no se pudo cargar propiedad.html');
        }
    }
    
    function cargar_nuevo_trabajador(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var trabajador = $(this).find('.trabajador'),
                cargos = $(this).find('.cargos');
            validacionDatos = {
                'dni': false,
                'nombre': false,
                'apellido1': false,
                'propiedadConfirmada': false,
                'propiedad': {
                    'cp': false,
                    'direccion': false,
                    'numero': false,
                    'localidad': false
                }
            };
            trabajador.find('.btn-aceptar').click(nuevo_trabajador_aceptar_click).prop('disabled', true);
            trabajador.find('.btn-cancelar').click(nuevo_trabajador_cancelar_click);
            trabajador.find('input[name="dni"]').change(trabajador_dni_change).focus();
            trabajador.find('input[name="nombre"]').change(trabajador_nombre_change);
            trabajador.find('input[name="apellido1"]').change(trabajador_apellido1_change);
            trabajador.find('.propiedad').remove();
            trabajador.find('.btn-editar').remove();
            cargos.removeClass('cargos').addClass('propiedad');
            cargos.children('.container-fluid').removeClass('container-fluid').addClass('vista');
            cargos.children('.vista').css('border-color', colorBorde).load('Html/propiedad.html', cargar_propiedad);
            $(this).find('.nominas').remove();
        } else {
            alerta('Error 404', 'no se pudo cargar trabajador.html');
        }
    }
    
    function cargar_vehiculo(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var vehiculo = $(this).find('.vehiculo'),
                mantenimientos = $(this).find('.mantenimientos'),
                cuerpo = mantenimientos.find('table').children('tbody');
            mostrar_datos_vehiculo(vehiculo);
            vehiculo.find('.btn-aceptar').click(vehiculo_aceptar_click);
            vehiculo.find('.btn-cancelar').click(vehiculo_cancelar_click);
            vehiculo.find('input[name="matricula"]').prop('readonly', true);
            cuerpo.children('.mantenimiento').remove();
            $.get('http://localhost:8080/ReForms_Provider/wr/mantenimiento/buscarMantenimientoPorVehiculo/' + vehiculos.vehiculoSeleccionado.id, function(data, status) {
                if (status == 'success') {
                    vehiculos.listaMantenimientos = data;
                    for (i = 0; i < vehiculos.listaMantenimientos.length; i++) {
                        var fechaStr = vehiculos.listaMantenimientos[i].fecha, tipoStr;
                        fechaStr = fechaStr.slice(0, fechaStr.indexOf('T'));
                        switch (vehiculos.listaMantenimientos[i].tipo) {
                            case 0: tipoStr = 'repostaje'; break;
                            case 1: tipoStr = 'itv'; break;
                            case 2: tipoStr = 'seguro'; break;
                            case 3: tipoStr = 'impuestos'; break;
                            case 4: tipoStr = 'multa'; break;
                            case 5: tipoStr = 'taller'; break;
                            default: tipoStr = '';
                        }
                        cuerpo.append('<tr class="mantenimiento"><td>' + fechaStr + '</td><td>' + tipoStr + '</td><td>' + vehiculos.listaMantenimientos[i].coste + ' €</td></tr>');
                    }
                    cuerpo.children('.mantenimiento').click(mantenimiento_click);
                }
            }, 'json');
            mantenimientos.find('.btn-nuevo').click(nuevo_mantenimiento_click);
            mantenimientos.find('.btn-aceptar').click(mantenimiento_aceptar_click);
            mantenimientos.find('.btn-cancelar').click(mantenimiento_cancelar_click);
            mantenimientos.find('.btn-nuevo').css({'border-color':colorBorde, 'background-color':colorFondo});
            mantenimientos.find('table').children('thead').css('background-color', colorBorde);
            mantenimientos.find('.vista').css('border-color', colorBorde);
            $(this).css('border-color', colorBorde);
            mantenimientos.find('.detalles').hide();
            $(this).parent('.detalles').show();
        } else {
            alerta('Error 404', 'no se pudo cargar vehiculo.html');
        }
    }
    
    function cargar_nuevo_vehiculo(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var vehiculo = $(this).find('.vehiculo'),
                mantenimientos = $(this).find('.mantenimientos');
            vehiculo.find('.btn-aceptar').click(nuevo_vehiculo_aceptar_click);
            vehiculo.find('.btn-cancelar').click(nuevo_vehiculo_cancelar_click);
            mantenimientos.hide();
            $(this).css('border-color', colorBorde);
            $(this).parent('.detalles').show();
        } else {
            alerta('Error 404', 'no se pudo cargar vehiculo.html');
        }
    }
    
    function cargar_vehiculos(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var tabla = $(this).find('.tabla'),
                cuerpo = tabla.children('table').children('tbody'),
                boton = tabla.children('button');
            $.get('http://localhost:8080/ReForms_Provider/wr/vehiculo/obtenerVehiculos', function(data, status) {
                if (status == 'success') {
                    vehiculos.listaVehiculos = data;
                    mostrar_tabla_vehiculos(cuerpo);
                }
            }, 'json');
            boton.click(nuevo_vehiculo_click);
            boton.css({'border-color':colorBorde, 'background-color':colorFondo});
            tabla.children('table').children('thead').css('background-color', colorBorde);
            $(this).find('.detalles').hide();
        } else {
            alerta('Error 404', 'no se pudo cargar vehiculos.html');
        }
    }
    
    function cargar_materiales(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            //rellenar
        } else {
            alerta('Error 404', 'no se pudo cargar materiales.html');
        }
    }
    
    // Cargar paginas y aplicar controles
    // ====================================================================== //
    $('#trabajadores').load('Html/trabajadores.html', cargar_trabajadores);
    $('#vehiculos').load('Html/vehiculos.html', cargar_vehiculos);
    $('#materiales').load('Html/materiales.html', cargar_materiales);
    $('.ocultable-titulo').click(ocultable_click);
    
    // Inicializacion de aspecto y colores
    // ====================================================================== //
    $('#ventana').css('border-color', colorBorde);
    $('#ventana').css('background-color', colorFondo);
    $('.ocultable').css('border-color', colorBorde);
    $('.ocultable-contenido').hide();
});
