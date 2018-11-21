$(document).ready(function() {
    
    // Variables
    // ====================================================================== //
    var colorBorde = $('#btn-activos').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.1)',
        sinColor = 'rgb(0, 0, 0, 0)',
        lt = [], ts = null, cs = null, os = null, ocs = null, loc = [], ln = [], ns = null,
        trabajadores = {
            'listaTrabajadores': [],
            'trabajadorSeleccionado': null,
            'cargoSeleccionado' : null,
            'operarioSeleccionado': null,
            'listaCapacidades': [],
            'capacidadSeleccionada': null,
            'listaNominas': [],
            'nominaSeleccionada': null
        },
        validacionDatos = null,
        lv = [], vs = null, lvm = [], vms = null,
        edicion = false;
    
    // Funciones auxiliares
    // ====================================================================== //
    function mostrar_tabla_trabajadores(cuerpo) {
        var i;
        for (i = 0; i < lt.length; i++) {
            var apellidos = lt[i].apellido1;
            if (lt[i].apellido2 && lt[i].apellido2 !== '') {
                alert(lt[i].apellido2);
                apellidos += ' ' + lt[i].apellido2;
            }
            cuerpo.append('<tr class="trabajador"><td>' + lt[i].nombre + '</td><td>' + apellidos + '</td></tr>');
        }
        cuerpo.children('.trabajador').click(trabajador_click);
    }
    
    function mostrar_tabla_nominas(cuerpo) {
        var i;
        for (i = 0; i < ln.length; i++) {
            var fecha = ln[i].fecha.slice(0, ln[i].fecha.indexOf('T')),
                estado;
            switch (ln[i].estado) {
                case 0: estado = 'pendiente'; break;
                case 1: estado = 'pagada'; break;
                case 2: estado = 'adelanto'; break;
                default: estado = '';
            }
            cuerpo.append('<tr class="nomina"><td>' + fecha + '</td><td>' + estado + '</td><td>' + ln[i].importe + '</td></tr>');
        }
    }
    
    function mostrar_tabla_cargos(cuerpo) {
        var gerente = false,
            operador = false,
            operario = false,
            nuevo = cuerpo.children('.cargo-nuevo').find('select[name="cargo"]');
        cuerpo.parent('table').siblings('.btn').show();
        nuevo.children('option').remove();
        $.get('http://localhost:8080/ReForms_Provider/wr/operador/buscarOperadorPorTrabajador/' + ts.id, function(data, status) {
            if (status == 'success') {
                operador = true;
                if (data.gerente && data.gerente == 1) {
                    gerente = true;
                    cuerpo.append('<tr class="cargo cargo-gerente"><td>Gerente</td></tr>');
                    
                }
                cuerpo.append('<tr class="cargo cargo-operador"><td>Operador</td></tr>');
            }
            $.get('http://localhost:8080/ReForms_Provider/wr/operario/buscarOperarioPorTrabajador/' + ts.id, function(data, status) {
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
        for (i = 0; i < loc.length; i++) {
            var dificultad;
            switch (loc[i].dificultad) {
                case 0: dificultad = 'no cualificado'; break;
                case 1: dificultad = 'ayudante'; break;
                case 2: dificultad = 'profesional'; break;
                case 3: dificultad = 'experto'; break;
            }
            cuerpo.append('<tr class="capacidad"><td>' + loc[i].gremio.nombre + '</td><td>' + dificultad + '</td></tr>');
        }
        cuerpo.children('.capacidad').click(capacidad_click);
    }
    
    function mostrar_tabla_vehiculos(cuerpo) {
        var i;
        for (i = 0; i < lv.length; i++) {
            var marca, modelo;
            if (lv[i].marca && lv[i].marca !== '') {
                marca = lv[i].marca;
            } else {
                marca = '-';
            }
            if (lv[i].modelo && lv[i].modelo !== '') {
                modelo = lv[i].modelo;
            } else {
                modelo = '-';
            }
            cuerpo.append('<tr class="vehiculo"><td>' + marca + '</td><td>' + modelo + '</td><td>' + lv[i].matricula + '</td></tr>');
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
        if (vs.matricula && vs.matricula != null) {
            matricula.val(vs.matricula);
        }
        if (vs.marca && vs.marca != null) {
            marca.val(vs.marca);
        }
        if (vs.modelo && vs.modelo != null) {
            modelo.val(vs.modelo);
        }
        if (vs.matriculacion && vs.matriculacion != null) {
            matriculacion.val(vs.matriculacion.slice(0, vs.matriculacion.indexOf('T')));
        }
        if (vs.adquisicion && vs.adquisicion != null) {
            adquisicion.val(vs.adquisicion.slice(0, vs.adquisicion.indexOf('T')));
        }
        if (vs.km && vs.km != null) {
            km.val(vs.km);
        }
        if (vs.observaciones && vs.observaciones != null) {
            observaciones.val(vs.observaciones);
        }
    }
    
    function dni_valido(dniStr) {
        var patronN = /^\d{8}[a-zA-Z]$/,
            patronE = /^[a-zA-Z]\d{7}[a-zA-Z]$/;
        return patronN.test(dniStr) || patronE.test(dniStr);
    }
    
    function cp_valido(cpStr) {
        var patron = /^\d{5}$/;
        return patron.test(cpStr);
    }
    
    function matricula_valida(matriculaStr) {
        var patron1 = /^\d{4}[ ][a-zA-Z]{3}$/,
            patron2 = /^[a-zA-Z]{1,2}[ ]\d{4}[ ][a-zA-Z]{2,3}$/;
        return patron1.test(matriculaStr) || patron2.test(matriculaStr);
    }
    
    function testValidacion(vd) {
        var test = true;
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
        if (testValidacion(validacionDatos.propiedad)) {
            alert('buscar propiedad');
            coincidencias.show();
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
            cs = null;
            os = null;
            if (ts == null || ts.id != lt[$(this).index()].id) {
                ts = lt[$(this).index()];
                $(this).css('background-color', colorFondo);
                $(this).siblings('.trabajador').css('background-color', sinColor);
                detalles.children('.vista').load('Html/trabajador.html', cargar_trabajador);
                detalles.show();
            } else {
                ts = null;
                $(this).css('background-color', sinColor);
                detalles.hide();
            }
        }
    }
    
    function trabajador_editar_click() {
        edicion = true;
        alert('editar');
        $(this).siblings('.btn-aceptar').show();
        $(this).siblings('.btn-cancelar').show();
        $(this).hide();
    }
    
    function trabajador_aceptar_click() {
        alert('aceptar');
        $(this).siblings('.btn-cancelar').click();
    }
    
    function trabajador_cancelar_click() {
        edicion = false;
        alert('cancelar');
        $(this).siblings('.btn-editar').show();
        $(this).siblings('.btn-aceptar').hide();
        $(this).hide();
    }
    
    function cargo_nuevo_click() {
        var cuerpo = $(this).siblings('table').find('tbody');
        cuerpo.children('.cargo').remove();
        cuerpo.children('.cargo-nuevo').show();
        $(this).siblings('.btn-aceptar').show();
        $(this).siblings('.btn-cancelar').show();
        $(this).hide();
        $(this).parents('.lista').siblings('.detalles').hide();
    }
    
    function cargo_aceptar_click() {
        alert('aceptar');
        $(this).siblings('.btn-cancelar').click();
    }
    
    function cargo_cancelar_click() {
        var cuerpo = $(this).siblings('table').children('tbody');
        cs = null;
        os = null;
        mostrar_tabla_cargos(cuerpo);
        cuerpo.children('.cargo-nuevo').hide();
        $(this).hide();
        $(this).siblings('.btn-aceptar').hide();
        $(this).siblings('.btn-nuevo').show();
    }
    
    function cargo_click() {
        var detalles = $(this).parents('.lista').siblings('.detalles');
        if (!edicion) {
            os = null;
            if (cs == null || cs != $(this).index()) {
                cs = $(this).index();
                $(this).css('background-color', colorFondo);
                $(this).siblings('.cargo').css('background-color', sinColor);
            } else {
                cs = null;
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
            if (cs == null || cs != $(this).index()) {
                detalles.children('.vista').load('Html/operario.html', cargar_operario);
                detalles.show();
            }
        }
    }
    
    function capacidad_click() {
        alert('capacidad_click()');
    }
    
    function nuevo_trabajador_click() {
        var detalles = $(this).parents('.principal').siblings('.detalles');
        edicion = true;
        $(this).siblings('table').find('.trabajador').css('background-color', sinColor);
        $(this).prop('disabled', true);
        detalles.children('.vista').load('Html/trabajador.html', cargar_nuevo_trabajador);
        detalles.show();
    }
    
    function trabajador_dni_change() {
        var dniStr = $(this).val(),
            btn = $(this).parent('div').siblings('.botones').children('.btn-aceptar');
        if ($(this).prop('validity') && dni_valido(dniStr)) {
            $(this).val($(this).val().toUpperCase());
            $.get('http://localhost:8080/ReForms_Provider/wr/trabajador/comprobarDni/' + dniStr, function(data, status) {
                if (status == 'success') {
                    validacionDatos.dni = true;
                } else {
                    alert('ya existe un trabajador con este dni');
                    validacionDatos.dni = false;
                }
                comprobacionDatos(btn);
            }, 'json');
        } else {
            alert('dni incorrecto');
            validacionDatos.dni = false;
            comprobacionDatos(btn);
        }
    }
    
    function trabajador_nombre_change() {
        var btn = $(this).parent('div').siblings('.botones').children('.btn-aceptar');
        if ($(this).prop('validity') && $(this).val() != '') {
            validacionDatos.nombre = true;
        } else {
            validacionDatos.nombre = false;
        }
        comprobacionDatos(btn);
    }
    
    function trabajador_apellido1_change() {
        var btn = $(this).parent('div').parent('div').siblings('.botones').children('.btn-aceptar');
        if ($(this).prop('validity') && $(this).val() != '') {
            validacionDatos.apellido1 = true;
        } else {
            validacionDatos.apellido1 = false;
        }
        comprobacionDatos(btn);
    }
    
    function propiedad_cp_change() {
        var cpStr = $(this).val(),
            btn = $(this).parents('.propiedad').siblings('.trabajador').children('.botones').children('.btn-aceptar'),
            nombreLocalidad = $(this).siblings('input[name="nombreLocalidad"]'),
            coincidencias = $(this).parent('div').parent('.localidad').parent('div').parent('.row').parent('.container-fluid').find('.coincidencias');
        if ($(this).prop('validity') && cp_valido(cpStr)) {
            $.get('http://localhost:8080/ReForms_Provider/wr/localidad/buscarLocalidadPorCodigoPostal/' + $(this).val(), function(data, status) {
                if (status == 'success') {
                    validacionDatos.propiedad.cp = true;
                    nombreLocalidad.val(data.nombre);
                } else {
                    validacionDatos.propiedad.cp = false;
                    nombreLocalidad.prop('readonly', false).val('');
                }
                busquedaPropiedad(coincidencias);
                comprobacionDatos(btn);
            }, 'json');
        } else {
            alert('c.p. incorrecto');
            validacionDatos.cp = false;
            busquedaPropiedad(coincidencias);
            comprobacionDatos(btn);
        }
    }
    
    function propiedad_nombreLocalidad_change() {
        var btn = $(this).parents('.propiedad').siblings('.trabajador').children('.botones').children('.btn-aceptar');
        if ($(this).prop('validity') && $(this).val() != '') {
            validacionDatos.propiedad.cp = true;
        } else {
            validacionDatos.propiedad.cp = false;
        }
        comprobacionDatos(btn);
    }
    
    function propiedad_direccion_change() {
        var btn = $(this).parents('.propiedad').siblings('.trabajador').children('.botones').children('.btn-aceptar'),
            coincidencias = $(this).parent('div').parent('.col-12').parent('.row').parent('.container-fluid').find('.coincidencias');
        if ($(this).prop('validity') && $(this).val() != '') {
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
        if ($(this).prop('validity') && $(this).val() != '') {
            validacionDatos.propiedad.numero = true;
        } else {
            validacionDatos.propiedad.numero = false;
        }
        busquedaPropiedad(coincidencias);
        comprobacionDatos(btn);
    }
    
    function nuevo_trabajador_aceptar_click() {
        alert('nuevo_trabajador_aceptar_click()');
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
            ts = null;
            cs = null;
            os = null;
            cuerpo.children('.trabajador').remove();
            switch ($(this).index()) {
                case 0: // Trabajadores
                    $.get('http://localhost:8080/ReForms_Provider/wr/trabajador/obtenerTrabajadores', function(data, status) {
                        if (status == 'success') {
                            lt = data;
                            mostrar_tabla_trabajadores(cuerpo);
                        }
                    }, 'json');
                    break;
                case 1: // Operadores
                    $.get('http://localhost:8080/ReForms_Provider/wr/trabajador/obtenerOperadores', function(data, status) {
                        if (status == 'success') {
                            lt = data;
                            mostrar_tabla_trabajadores(cuerpo);
                        }
                    }, 'json');
                    break;
                case 2: // Operarios
                    $.get('http://localhost:8080/ReForms_Provider/wr/trabajador/obtenerOperarios', function(data, status) {
                        if (status == 'success') {
                            lt = data;
                            mostrar_tabla_trabajadores(cuerpo);
                        }
                    }, 'json');
                    break;
            }
            $(this).siblings('.btn-tipo').css({'border-color':colorBorde, 'background-color':sinColor});
            $(this).css('background-color', colorBorde);
            $(this).parents('.principal').siblings('.detalles').hide();
        }
    }
    
    function vehiculo_click() {
        var detalles = $(this).parents('.tabla').siblings('.detalles');
        if (vs == null || vs.id != lv[$(this).index()].id) {
            vs = lv[$(this).index()];
            detalles.children('.vista').load('Html/vehiculo.html', cargar_vehiculo);
            $(this).css('background-color', colorFondo);
            $(this).siblings('.vehiculo').css('background-color', sinColor);
        } else {
            vs = null;
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
        if (marca.prop('validity')) {
            vs.marca = marca.val() !== '' ? marca.val() : null;
        }
        if (modelo.prop('validity')) {
            vs.modelo = modelo.val() !== '' ? modelo.val() : null;
        }
        if (matriculacion.prop('validity')) {
            vs.matriculacion = matriculacion.val() !== '' ? new Date(matriculacion.val()) : null;
        }
        if (adquisicion.prop('validity')) {
            vs.adquisicion = adquisicion.val() !== '' ? new Date(adquisicion.val()) : null;
        }
        if (km.prop('validity')) {
            vs.km = km.val() !== '' ? new Number(km.val()) : null;
        }
        if (observaciones.prop('validity')) {
            vs.observaciones = observaciones.val() !== '' ? observaciones.val() : null;
        }
        if (!error) {
            // datos bien, enviar al proveedor
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/vehiculo/actualizarVehiculo/' + vs.id,
                dataType: 'json',
                type: 'put',
                contentType: 'application/json',
                data: JSON.stringify(vs),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    vs = null;
                    $('#vehiculos').load('Html/vehiculos.html', cargar_vehiculos);
                },
                error: function(jqXhr, textStatus, errorThrown){
                    alert('no ha sido posible actualizar el vehiculo');
                }
            });
        } else {
            // problema en datos del cliente
            alert("revise los datos del vehiculo");
        }
    }
    
    function vehiculo_cancelar_click() {
        var detalles = $(this).parents('.marco').parent('.vista').parent('.detalles'),
            tbody = detalles.siblings('.tabla').find('tbody');
        vs = null;
        detalles.hide();
        tbody.children('.vehiculo').css('background-color', sinColor);
    }
    
    function nuevo_vehiculo_click() {
        var detalles = $(this).parents('.tabla').siblings('.detalles');
        vs = null;
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
        if (matricula.prop('validity') && matricula.val() !== '' && matricula_valida(matricula.val())) {
            nv.matricula = matricula.val().toUpperCase();
        } else {
            error = true;
        }
        if (marca.prop('validity')) {
            nv.marca = marca.val() !== '' ? marca.val() : null;
        }
        if (modelo.prop('validity')) {
            nv.modelo = modelo.val() !== '' ? modelo.val() : null;
        }
        if (matriculacion.prop('validity')) {
            nv.matriculacion = matriculacion.val() !== '' ? new Date(matriculacion.val()) : null;
        }
        if (adquisicion.prop('validity')) {
            nv.adquisicion = adquisicion.val() !== '' ? new Date(adquisicion.val()) : null;
        }
        if (km.prop('validity')) {
            nv.km = km.val() !== '' ? new Number(km.val()) : null;
        }
        if (observaciones.prop('validity')) {
            nv.observaciones = observaciones.val() !== '' ? observaciones.val() : null;
        }
        if (!error) {
            // datos bien, enviar al proveedor
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/vehiculo/registrarVehiculo',
                dataType: 'json',
                type: 'post',
                contentType: 'application/json',
                data: JSON.stringify(nv),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    $('#vehiculos').load('Html/vehiculos.html', cargar_vehiculos);
                },
                error: function(jQxhr, textStatus, errorThrown){
                    alert('no ha sido posible registrar el vehiculo');
                }
            });
        } else {
            // problema en datos del cliente
            alert("revise los datos del vehiculo");
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
        vms = lvm[$(this).index()];
        tipo.val(vms.tipo);
        fecha.val(vms.fecha.slice(0, vms.fecha.indexOf('T')));
        coste.val(vms.coste);
        descripcion.val(vms.descripcion);
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
        vms = null;
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
        if (vms != null && vms.id != null) {
            edicion = true;
        } else {
            vms = new Mantenimiento();
        }
        if (tipo.prop('validity')) {
            vms.tipo = tipo.val();
        } else {
            error = true;
        }
        if (fecha.prop('validity') && fecha.val() != '') {
            vms.fecha = new Date(fecha.val());
        } else {
            error = true;
        }
        if (coste.prop('validity')) {
            vms.coste = coste.val() !== '' ? new Number(coste.val()) : 0.0;
        }
        if (descripcion.prop('validity')) {
            vms.descripcion = descripcion.val() !== '' ? descripcion.val() : null;
        }
        if (!error) {
            // datos bien, enviar al proveedor
            if (edicion) {
                // edicion del mantenimiento en el proveedor
                $.ajax({
                    url: 'http://localhost:8080/ReForms_Provider/wr/mantenimiento/actualizarMantenimiento/' + vms.id,
                    dataType: 'json',
                    type: 'put',
                    contentType: 'application/json',
                    data: JSON.stringify(vms),
                    processData: false,
                    success: function(data, textStatus, jQxhr){
                        vs = null;
                        vms = null;
                        $('#vehiculos').load('Html/vehiculos.html', cargar_vehiculos);
                    },
                    error: function(jqXhr, textStatus, errorThrown){
                        alert('no ha sido posible actualizar el mantenimiento');
                    }
                });
            } else {
                // registro del mantenimiento en el proveedor
                vms.vehiculo = vs;
                $.ajax({
                    url: 'http://localhost:8080/ReForms_Provider/wr/mantenimiento/agregarMantenimiento',
                    dataType: 'json',
                    type: 'post',
                    contentType: 'application/json',
                    data: JSON.stringify(vms),
                    processData: false,
                    success: function(data, textStatus, jQxhr){
                        vs = null;
                        vms = null;
                        $('#vehiculos').load('Html/vehiculos.html', cargar_vehiculos);
                    },
                    error: function(jQxhr, textStatus, errorThrown){
                        alert('no ha sido posible registrar el mantenimiento');
                    }
                });
            }
        } else {
            // problema en datos del cliente
            alert("revise los datos del mantenimiento");
            fecha.focus();
        }
    }
    
    function mantenimiento_cancelar_click() {
        var vista = $(this).parents('.marco').parent('.vista');
        vista.load('Html/vehiculo.html', cargar_vehiculo);
    }
    
    // Funciones para cargar paginas y definir su comportamiento
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
                    lt = data;
                    mostrar_tabla_trabajadores(cuerpo);
                }
            }, 'json');
            boton.click(nuevo_trabajador_click);
            filtro.find('.btn-tipo').click(trabajador_tipo_click);
            boton.css({'border-color':colorBorde, 'background-color':sinColor});
            filtro.find('.btn-tipo').css({'border-color':colorBorde, 'background-color':sinColor});
            filtro.find('.btn-tipo').eq(0).css('background-color', colorBorde);
            tabla.find('thead').css('background-color', colorBorde);
            detalles.children('.vista').css('border-color', colorBorde);
            detalles.hide();
        } else {
            alert('Error: no se pudo cargar trabajadores.html');
        }
    }
    
    function cargar_operario(responseTxt, statusTxt) {
        var capacidades = $(this).children('.marco').children('.capacidades'),
            dispositivo = $(this).children('.marco').children('.dispositivo'),
            carnet = $(this).children('.marco').children('.carnet'),
            botones = $(this).children('.marco').children('.botones'),
            vista = $(this).children('.marco').children('.dispositivo').find('.vista'),
            dis = dispositivo.find('input[name="dispositivo"]'),
            telefono = dispositivo.find('input[name="telefono"]'),
            email = dispositivo.find('input[name="email"]'),
            pass = dispositivo.find('input[name="pass"]'),
            car = carnet.find('input[name="carnet"]'),
            tabla = capacidades.find('.tabla');
        if (statusTxt == 'success') {
            $.get('http://localhost:8080/ReForms_Provider/wr/operario/buscarOperarioPorTrabajador/' + ts.id, function(data, status) {
                if (status == 'success') {
                    os = data;
                    dis.val(os.dispositivo).prop('readonly', true);
                    telefono.val(os.telefono).prop('readonly', true);
                    email.val(os.email).prop('readonly', true);
                    pass.val(os.pass).prop('readonly', true);
                    if (os.carnet && os.carnet == 1) {
                        car.prop('checked', true);
                    }
                    car.prop('disabled', true)
                    $.get('http://localhost:8080/ReForms_Provider/wr/capacidad/buscarCapacidadPorOperario/' + os.id, function(data, status) {
                        if (status == 'success') {
                            loc = data;
                            mostrar_tabla_capacidades(tabla.find('tbody'));
                        }
                    }, 'json');
                } else {
                    alert('Error: no ha sido posible obtener los datos del operario');
                }
            }, 'json');
            dispositivo.find('.vista').css('border-color', colorBorde);
            tabla.find('thead').css('background-color', colorBorde);
            tabla.find('.btn-nuevo').css({'border-color':colorBorde, 'background-color':sinColor});
            botones.find('.btn-editar').css({'border-color':colorBorde, 'background-color':sinColor});
            botones.find('.btn-aceptar').hide();
            botones.find('.btn-cancelar').hide();
            tabla.find('.btn-aceptar').hide();
            tabla.find('.btn-cancelar').hide();
            tabla.find('tbody').children('.capacidad-nueva').hide();
        } else {
            alert('Error: no se pudo cargar operario.html');
        }
    }
    
    function cargar_nominas(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var cuerpo = $(this).find('tbody');
            $.get('http://localhost:8080/ReForms_Provider/wr/nomina/buscarNominaPorTrabajador/' + ts.id, function(data, status) {
                if (status == 'success') {
                    ln = data;
                    mostrar_tabla_nominas(cuerpo);
                }
            }, 'json');
            cuerpo.children('.nomina-nueva').hide();
            $(this).find('thead').css('background-color', colorBorde);
            $(this).find('.btn-nuevo').css({'border-color':colorBorde, 'background-color':sinColor});
            $(this).find('.btn-aceptar').hide();
            $(this).find('.btn-cancelar').hide();
        } else {
            alert('Error: no se pudo cargar nominas.html');
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
            dni.val(ts.dni).prop('readonly', true);
            nombre.val(ts.nombre).prop('readonly', true);
            apellido1.val(ts.apellido1).prop('readonly', true);
            apellido2.val(ts.apellido2).prop('readonly', true);
            telefono1.val(ts.telefono1).prop('readonly', true);
            telefono2.val(ts.telefono2).prop('readonly', true);
            propiedad.val(ts.propiedad.direccion + ' ' + ts.propiedad.numero + ', ' + ts.propiedad.localidad.nombre).prop('readonly', true);
            email.parent().remove();
            password.parent().remove();
            trabajador.find('.btn-editar').css({'border-color':colorBorde, 'background-color':sinColor}).click(trabajador_editar_click);
            trabajador.find('.btn-aceptar').hide().click(trabajador_aceptar_click);
            trabajador.find('.btn-cancelar').hide().click(trabajador_cancelar_click);
            mostrar_tabla_cargos(cuerpoCargos);
            cargos.find('thead').css('background-color', colorBorde);
            cargos.find('.btn-nuevo').css({'border-color':colorBorde, 'background-color':sinColor}).click(cargo_nuevo_click);
            cargos.find('.btn-aceptar').hide().click(cargo_aceptar_click);
            cargos.find('.btn-cancelar').hide().click(cargo_cancelar_click);
            cuerpoCargos.children('.cargo-nuevo').hide();
            detalles.children('.vista').css('border-color', colorBorde);
            detalles.hide();
            nominas.children('.vista').css('border-color', colorBorde).load('Html/nominas.html', cargar_nominas);
            nominas.show();
        } else {
            alert('Error: no se pudo cargar trabajador.html');
        }
    }
    
    function cargar_propiedad(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            $(this).find('input[name="cp"]').change(propiedad_cp_change);
            $(this).find('input[name="nombreLocalidad"]').prop('readonly', true).change(propiedad_nombreLocalidad_change);
            $(this).find('input[name="direccion"]').change(propiedad_direccion_change);
            $(this).find('input[name="numero"]').change(propiedad_numero_change);
            $(this).find('.titulo').append('Residencia');
            $(this).find('.coincidencias').css('border-color', colorBorde).hide();
            $(this).find('.mapa').hide();
        } else {
            alert('Error: no se pudo cargar propiedad.html');
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
                'propiedad': {
                    'cp': false,
                    'direccion': false,
                    'numero': false
                }
            };
            trabajador.find('.btn-aceptar').click(nuevo_trabajador_aceptar_click).prop('disabled', true);
            trabajador.find('.btn-cancelar').click(nuevo_trabajador_cancelar_click);
            trabajador.find('input[name="dni"]').change(trabajador_dni_change);
            trabajador.find('input[name="nombre"]').change(trabajador_nombre_change);
            trabajador.find('input[name="apellido1"]').change(trabajador_apellido1_change);
            trabajador.find('.propiedad').remove();
            trabajador.find('.btn-editar').remove();
            cargos.removeClass('cargos').addClass('propiedad');
            cargos.children('.container-fluid').removeClass('container-fluid').addClass('vista');
            cargos.children('.vista').css('border-color', colorBorde).load('Html/propiedad.html', cargar_propiedad);
            $(this).find('.nominas').remove();
        } else {
            alert('Error: no se pudo cargar trabajador.html');
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
            $.get('http://localhost:8080/ReForms_Provider/wr/mantenimiento/buscarMantenimientoPorVehiculo/' + vs.id, function(data, status) {
                if (status == "success") {
                    lvm = data;
                    for (i = 0; i < lvm.length; i++) {
                        var fechaStr = lvm[i].fecha, tipoStr;
                        fechaStr = fechaStr.slice(0, fechaStr.indexOf('T'));
                        switch (lvm[i].tipo) {
                            case 0: tipoStr = 'repostaje'; break;
                            case 1: tipoStr = 'itv'; break;
                            case 2: tipoStr = 'seguro'; break;
                            case 3: tipoStr = 'impuestos'; break;
                            case 4: tipoStr = 'multa'; break;
                            case 5: tipoStr = 'taller'; break;
                            default: tipoStr = '';
                        }
                        cuerpo.append('<tr class="mantenimiento"><td>' + fechaStr + '</td><td>' + tipoStr + '</td><td>' + lvm[i].coste + ' €</td></tr>');
                    }
                    cuerpo.children('.mantenimiento').click(mantenimiento_click);
                }
            }, 'json');
            mantenimientos.find('.btn-nuevo').click(nuevo_mantenimiento_click);
            mantenimientos.find('.btn-aceptar').click(mantenimiento_aceptar_click);
            mantenimientos.find('.btn-cancelar').click(mantenimiento_cancelar_click);
            mantenimientos.find('.btn-nuevo').css({'border-color':colorBorde, 'background-color':sinColor});
            mantenimientos.find('table').children('thead').css('background-color', colorBorde);
            mantenimientos.find('.vista').css('border-color', colorBorde);
            $(this).css('border-color', colorBorde);
            mantenimientos.find('.detalles').hide();
            $(this).parent('.detalles').show();
        } else {
            alert('Error: no se pudo cargar vehiculo.html');
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
            alert('Error: no se pudo cargar vehiculo.html');
        }
    }
    
    function cargar_vehiculos(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            var tabla = $(this).find('.tabla'),
                cuerpo = tabla.children('table').children('tbody'),
                boton = tabla.children('button');
            $.get('http://localhost:8080/ReForms_Provider/wr/vehiculo/obtenerVehiculos', function(data, status) {
                if (status == 'success') {
                    lv = data;
                    mostrar_tabla_vehiculos(cuerpo);
                }
            }, 'json');
            boton.click(nuevo_vehiculo_click);
            boton.css({'border-color':colorBorde, 'background-color':sinColor});
            tabla.children('table').children('thead').css('background-color', colorBorde);
            $(this).find('.detalles').hide();
        } else {
            alert('Error: no se pudo cargar vehiculos.html');
        }
    }
    
    function cargar_materiales(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            //rellenar
        } else {
            alert('Error: no se pudo cargar materiales.html');
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
