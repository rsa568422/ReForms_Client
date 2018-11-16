$(document).ready(function() {
    
    // Variables
    // ====================================================================== //
    var colorBorde = $('#btn-activos').css('background-color'),
        colorFondo = colorBorde.substring(0, colorBorde.length - 1) + ', 0.1)',
        sinColor = 'rgb(0, 0, 0, 0)',
        lt = [], ts = null
        lv = [], vs = null,
        lvm = [], vms = null;
    
    // Funciones auxiliares
    // ====================================================================== //
    function mostrar_tabla_trabajadores(cuerpo) {
        cuerpo.children('.trabajador').remove();
        cuerpo.append('<tr class="trabajador"><td>Prueba</td><td>Prueba Prueba</td></tr>');
        cuerpo.children('.trabajador').click(trabajador_click);
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
    
    function matricula_valida(matriculaStr) {
        // comprobar si la cadena pasada vale como matricula
        return true;
    }
    
    // Funciones controladoras para componentes
    // ====================================================================== //
    function ocultable_click() {
        $(this).siblings('.ocultable-contenido').slideToggle();
        $(this).parent('.ocultable').siblings('.ocultable').children('.ocultable-contenido').slideUp()();
    }
    
    function trabajador_click() {
        $(this).parents('.principal').siblings('.detalles').show();
        $(this).parents('.principal').siblings('.detalles').children('.vista').load('Html/trabajador.html', cargar_trabajador);
    }
    
    function nuevo_trabajador_click() {
        alert('click en boton para nuevo trabajador');
        $(this).siblings('table').find('.trabajador').remove();
        $(this).parents('.principal').siblings('.detalles').show();
    }
    
    function trabajador_tipo_click() {
        var cuerpo = $(this).parent('.filtro').siblings('.tabla').find('tbody');
        alert('click en tipo de trabajador ' + $(this).index());
        mostrar_tabla_trabajadores(cuerpo);
        $(this).siblings('.btn-tipo').css({'border-color':colorBorde, 'background-color':sinColor});
        $(this).css('background-color', colorBorde);
        $(this).parents('.principal').siblings('.detalles').hide();
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
            nv.matricula = matricula.val();
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
            $.get('http://localhost:8080/ReForms_Provider/wr/vehiculo/obtenerVehiculos', function(data, status) {
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
        if (statusTxt == 'success') {
            $(this).children('.marco').children('.dispositivo').find('.vista').css('border-color', colorBorde);
            $(this).children('.marco').children('.capacidades').find('.tabla').find('thead').css('background-color', colorBorde);
            $(this).children('.marco').children('.capacidades').find('.tabla').find('.btn-nuevo').css({'border-color':colorBorde, 'background-color':sinColor});
        }
    }
    
    function cargar_nominas(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            $(this).find('thead').css('background-color', colorBorde);
            $(this).find('.btn-nuevo').css({'border-color':colorBorde, 'background-color':sinColor});
        }
    }
    
    function cargar_trabajador(responseTxt, statusTxt) {
        if (statusTxt == 'success') {
            $(this).find('.cargos').find('thead').css('background-color', colorBorde);
            $(this).find('.cargos').find('.btn-nuevo').css({'border-color':colorBorde, 'background-color':sinColor});
            $(this).find('.detalles').children('.vista').css('border-color', colorBorde).load('Html/operario.html', cargar_operario);
            $(this).find('.nominas').children('.vista').css('border-color', colorBorde).load('Html/nominas.html', cargar_nominas);
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
