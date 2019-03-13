$(document).ready(function() {
    
    var peritos, gremios, trabajos,
        la, aseguradora = null, gremio = null, logoGif = null,
        color = $("#btn-aseguradoras").css("background-color");
    
    function alerta(titulo, mensaje) {
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-header').children('.modal-title').html(titulo);
        $('#alerta').children('div.modal-dialog').children('div.modal-content').children('div.modal-body').html(mensaje);
        $('#activador-alerta').click();
    }
    
    function generarLogo(aseguradora) {
        return i = "<img class='logo' src='data:image/gif;base64," + aseguradora.logo + "' width='480' height='360' alt='" + aseguradora.nombre + "'/>";
    }
    
    function cargarTrabajos(gremio) {
        $("#btnNuevoTrabajoAceptar").hide();
        $("#btnNuevoTrabajoCancelar").hide();
        $(".trabajo").remove();
        $.get("http://localhost:8080/ReForms_Provider/wr/trabajo/obtenerTrabajosPorGremio/" + aseguradora.id + "/" + gremio.id, function(data, status) {
            if (status == 'success') {
                var i;
                trabajos = data;
                for (i = 0; i < trabajos.length; i++) {
                    var codigo = "<td>" + trabajos[i].codigo + "</td>",
                        descripcion = "<td>" + trabajos[i].descripcion + "</td>",
                        dificultad = "<td>";
                    switch (trabajos[i].dificultad) {
                        case 0: dificultad += "facil</td>"; break;
                        case 1: dificultad += "ayudante</td>"; break;
                        case 2: dificultad += "profesional</td>"; break;
                        case 3: dificultad += "experto</td>"; break;
                        default: dificultad += "desconocida</td>"; break;
                    }
                    $("#trabajos").find("tbody").append("<tr class='trabajo'>" + codigo + descripcion + dificultad + "</tr>");
                }
                $(".trabajo").dblclick(function() {
                    var aux = trabajos[$(this).index()];
                    aux.aseguradora.logo = null;
                    alert(JSON.stringify(aux));
                });
            }
        }, "json");
    }
    
    function cargarPeritosTrabajos() {
        $.get("http://localhost:8080/ReForms_Provider/wr/perito/buscarPeritoPorAseguradora/" + aseguradora.id, function(data, status) {
            var tbody = $("#peritos").find("table").children("tbody");
            tbody.children("tr").remove();
            if (status == 'success') {
                var i;
                peritos = data;
                for (i = 0; i < peritos.length; i++) {
                    var nombre = "<td>" + peritos[i].nombre + "</td>",
                        apellidos = "<td>" + peritos[i].apellido1,
                        telefonos = "<td>" + peritos[i].telefono1,
                        fax = "<td>",
                        email = "<td>";
                    if (peritos[i].apellido2 && peritos[i].apellido2 != "") {
                        apellidos += " " + peritos[i].apellido2 + "</td>";
                    } else {
                        apellidos += "</td>";
                    }
                    if (peritos[i].telefono2 && peritos[i].telefono1 != peritos[i].telefono2) {
                        telefonos += " " + peritos[i].telefono2 + "</td>";
                    } else {
                        telefonos += "</td>";
                    }
                    if (peritos[i].fax) {
                        fax += peritos[i].fax + "</td>";
                    } else {
                        fax += "</td>";
                    }
                    if (peritos[i].email) {
                        email += peritos[i].email + "</td>";
                    } else {
                        email += "</td>";
                    }
                    tbody.append("<tr>" + nombre + apellidos + telefonos + fax + email + "</tr>");
                }
                tbody.children("tr").not("#trNuevoPerito").dblclick(function() {
                    alert(JSON.stringify(peritos[$(this).index()]));
                    $("#btnNuevoPerito").prop("disabled", false);
                    $("#btnNuevoPeritoAceptar").hide();
                    $("#btnNuevoPeritoCancelar").hide();
                    $(this).siblings("#trNuevoPerito").remove();
                });
            }
        }, "json");
        $.get("http://localhost:8080/ReForms_Provider/wr/gremio/obtenerGremios", function(data, status) {
            if (status == 'success') {
                var i;
                gremios = data;
                $(".gremio").remove();
                $("#nuevoTrabajo").html("");
                $("#btnNuevaAseguradora").prop("disabled", false);
                $("#btnNuevoPerito").prop("disabled", false);
                $("#btnNuevoTrabajo").show();
                for (i = 0; i < gremios.length; i++) {
                    $("#gremios").append("<button type='button' class='btn gremio'>" + gremios[i].nombre + "</button>");
                }
                $("#gremios").append("<button id='btnNuevoGremio' type='button' class='btn gremio'><i class='material-icons'>add_circle</i></button>");
                $("#btnNuevoGremio").css("color", $("#btn-aseguradoras").css("background-color"));
                $(".gremio").css("border-color", $("#btn-aseguradoras").css("background-color")).css("background-color", "rgb(0, 0, 0, 0)");
                $(".gremio").eq(0).css("background-color", $("#btn-aseguradoras").css("background-color"));
                $(".gremio").not("#btnNuevoGremio").click(function() {
                    $(this).css("background-color", $("#btn-aseguradoras").css("background-color"));
                    $(this).siblings(".gremio").css("background-color", "rgb(0, 0, 0, 0)");
                    gremio = gremios[$(this).index()];
                    cargarTrabajos(gremio);
                });
                $("#btnNuevoGremio").click(function() {
                    var nombreGremio = "<input id='nombreGremio' type='text' class='form-control' maxlength='20' required>",
                        btnNuevoGremioAceptar = "<button id='btnNuevoGremioAceptar' type='button' class='btn'>aceptar</button>",
                        btnNuevoGremioCancelar = "<button id='btnNuevoGremioCancelar' type='button' class='btn'>cancelar</button>";
                    $(".gremio").prop("disabled", true);
                    $(this).css("background-color", $("#btn-aseguradoras").css("background-color"));
                    $(this).siblings(".gremio").css("background-color", "rgb(0, 0, 0, 0)");
                    $("#btnNuevoTrabajo").prop("disabled", true);
                    $(".trabajo").remove();
                    $("#gremios").append("<div class='form-inline'>" + nombreGremio + "</div>" + btnNuevoGremioAceptar + btnNuevoGremioCancelar);
                    $("#btnNuevoGremioAceptar").css("border-color", "green");
                    $("#btnNuevoGremioAceptar").css("color", "green");
                    $("#btnNuevoGremioAceptar").css("background-color", "rgb(0, 0, 0, 0)");
                    $("#btnNuevoGremioCancelar").css("border-color", "red");
                    $("#btnNuevoGremioCancelar").css("color", "red");
                    $("#btnNuevoGremioCancelar").css("background-color", "rgb(0, 0, 0, 0)");
                    $("#nombreGremio").focus();
                    $("#btnNuevoGremioAceptar").click(function() {
                        var g = new Gremio(),
                            nombre = $("#nombreGremio");
                        if (nombre.prop("validity").valid) {
                            g.nombre = nombre.val();
                            $.ajax({
                                url: 'http://localhost:8080/ReForms_Provider/wr/gremio/registrarGremio',
                                dataType: 'json',
                                type: 'post',
                                contentType: 'application/json;charset=UTF-8',
                                data: JSON.stringify(g),
                                processData: false,
                                success: function(data, textStatus, jQxhr){
                                    $("#btn-aseguradoras").click();
                                },
                                error: function(jQxhr, textStatus, errorThrown){
                                    alerta('Error en proveedor', 'no ha sido posible crear el gremio');
                                    $("#btnNuevoGremioCancelar").click();
                                }
                            });
                        } else {
                            alerta('Error en los datos', 'revise el nombre del gremio');
                            $("#nombreGremio").focus();
                        }
                    });
                    $("#btnNuevoGremioCancelar").click(function() {
                        $(this).remove();
                        $("#nombreGremio").remove();
                        $("#btnNuevoGremioAceptar").remove();
                        $(".gremio").prop("disabled", false);
                        $("#btnNuevoPerito").prop("disabled", false);
                        $("#btnNuevoTrabajo").prop("disabled", false);
                        $("#btnNuevoGremio").css("background-color", "rgb(0, 0, 0, 0)");
                        $(".gremio").eq(0).css("background-color", $("#btn-aseguradoras").css("background-color"));
                        gremio = gremios[0];
                        cargarTrabajos(gremio);
                    });
                });
                gremio = gremios[0];
                cargarTrabajos(gremio);
            }
        }, "json");
        $("#peritos").show();
        $("#trabajos").show();
        $("#btnNuevoPeritoAceptar").hide();
        $("#btnNuevoPeritoCancelar").hide();
    }
    
    function logo_click() {
        aseguradora = la[$(this).index()];
        $(this).siblings(".seleccionada").removeClass("seleccionada");
        $(this).addClass("seleccionada");
        $("#nuevaAseguradora").hide();
        $("#btnNuevoPerito").prop("disabled", false);
        $("#btnNuevoTrabajo").prop("disabled", false);
        $("#btnNuevoGremio").prop("disabled", false);
        $("#nombreGremio").remove();
        $("#btnNuevoGremioAceptar").remove();
        $("#btnNuevoGremioCancelar").remove();
        cargarPeritosTrabajos();
    }
    
    function nuevaAseguradora_aceptar_click() {
        var error = false,
            a = new Aseguradora(),
            marco = $(this).parents(".marco"),
            nombre = marco.find("input[name='nombre']"),
            telefono1 = marco.find("input[name='telefono1']"),
            telefono2 = marco.find("input[name='telefono2']"),
            fax = marco.find("input[name='fax']"),
            email = marco.find("input[name='email']"),
            logo = marco.find("input[name='logo']"),
            extension = logo.val().slice(logo.val().length - 4, logo.val().length);
        if (nombre.prop("validity").valid) {
            a.nombre = nombre.val();
        } else {
            error = true;
        }
        if (telefono1.prop("validity").valid) {
            a.telefono1 = telefono1.val();
        } else {
            error = true;
        }
        if (telefono2.prop("validity").valid) {
            a.telefono2 = telefono2.val() != "" ? telefono2.val() : null;
        } else {
            error = true;
        }
        if (fax.prop("validity").valid) {
            a.fax = fax.val() != "" ? fax.val() : null;
        } else {
            error = true;
        }
        if (email.prop("validity").valid) {
            a.email = email.val();
        } else {
            error = true;
        }
        if (extension.toLowerCase() === ".gif") {
            a.logo = logoGif; 
        } else {
            error = true;
        }
        if (!error) {
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/aseguradora/registrarAseguradora',
                dataType: 'json',
                type: 'post',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(a),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    $("#btn-aseguradoras").click();
                },
                error: function(jQxhr, textStatus, errorThrown){
                    alerta('Error en proveedor', 'no ha sido posible crear la aseguradora');
                }
            });
        } else {
            alerta('Error en los datos', 'revise los datos de la aseguradora');
            nombre.focus();
        }
    }
    
    function nuevaAseguradora_cancelar_click() {
        $(".logo").eq(0).click();
    }
    
    function input_logo_change() {
        var entrada = this.files,
            lector = new FileReader();
        lector.onloadend = function (e) {
            logoGif = e.target.result.split("base64,")[1];
        }
        lector.readAsDataURL(entrada[0]);
    }
        
    $("#ventana").css("border-color", color);
    $("#aseguradoras").css("border-color", color);
    $("#logos").css("border-color", color);
    $("#peritos").css("border-color", color);
    $("#peritos").find("thead").children("tr").css("background-color", color);
    $("#btnNuevoPerito").css("border-color", $("#btn-aseguradoras").css("background-color"));
    $("#btnNuevoPerito").css("color", $("h2").css("color"));
    $("#btnNuevoPerito").css("background-color", "rgb(0, 0, 0, 0)");
    $("#btnNuevoPeritoAceptar").css("border-color", "green");
    $("#btnNuevoPeritoAceptar").css("color", "green");
    $("#btnNuevoPeritoAceptar").css("background-color", "rgb(0, 0, 0, 0)");
    $("#btnNuevoPeritoCancelar").css("border-color", "red");
    $("#btnNuevoPeritoCancelar").css("color", "red");
    $("#btnNuevoPeritoCancelar").css("background-color", "rgb(0, 0, 0, 0)");
    $("#trabajos").css("border-color", color);
    $("#trabajos").find("thead").children("tr").css("background-color", color);
    $("#btnNuevoTrabajo").css("border-color", $("#btn-aseguradoras").css("background-color"));
    $("#btnNuevoTrabajo").css("color", $("h2").css("color"));
    $("#btnNuevoTrabajo").css("background-color", "rgb(0, 0, 0, 0)");
    $("#btnNuevoTrabajoAceptar").css("border-color", "green");
    $("#btnNuevoTrabajoAceptar").css("color", "green");
    $("#btnNuevoTrabajoAceptar").css("background-color", "rgb(0, 0, 0, 0)");
    $("#btnNuevoTrabajoCancelar").css("border-color", "red");
    $("#btnNuevoTrabajoCancelar").css("color", "red");
    $("#btnNuevoTrabajoCancelar").css("background-color", "rgb(0, 0, 0, 0)");
    $("#nuevaAseguradora").css("border-color", color);
    color = color.substring(0, color.length - 1) + ", 0.1)";
    $("#ventana").css("background-color", color);
    
    $("#peritos").hide();
    $("#trabajos").hide();
    $("#nuevaAseguradora").hide();
    
    $.get("http://localhost:8080/ReForms_Provider/wr/aseguradora/obtenerAseguradoras", function(data, status) {
        if (status == 'success') {
            var i, a = null;
            la = data;
            if (localStorage.aseguradoraPredeterminada) {
                a = JSON.parse(localStorage.aseguradoraPredeterminada);
            }
            for (i = 0; i < la.length; i++) {
                var logo = generarLogo(la[i]);
                if (a != null && a.id == la[i].id) {
                    logo = logo.replace("logo", "logo seleccionada");
                    aseguradora = la[i];
                    cargarPeritosTrabajos();
                }
                $("#logos").append(logo);
            }
            $("#logos").append("<button id='btnNuevaAseguradora' type='button' class='btn'><i class='material-icons md-48'>add_circle</i></button>");
            $(".logo").css("border-color", $("#btn-aseguradoras").css("background-color"));
            $("#btnNuevaAseguradora").css("border-color", $("#btn-aseguradoras").css("background-color"));
            $("#btnNuevaAseguradora").css("color", $("#btn-aseguradoras").css("background-color"));
            $("#btnNuevaAseguradora").css("background-color", "rgb(0, 0, 0, 0)");
            $(".logo").click(logo_click);
            $(".logo").dblclick(function() {
                aseguradora = la[$(this).index()];
                alert(JSON.stringify(aseguradora));
            });
            $("#btnNuevaAseguradora").click(function() {
                aseguradora = null;
                $(".seleccionada").removeClass("seleccionada");
                $("#peritos").hide();
                $("#trabajos").hide();
                $("#nuevaAseguradora").load("Html/aseguradora.html", function(responseTxt, statusTxt) {
                    if(statusTxt === 'success') {
                        //comportamiento de los controles
                        $(this).find(".btn-aceptar").click(nuevaAseguradora_aceptar_click);
                        $(this).find(".btn-cancelar").click(nuevaAseguradora_cancelar_click);
                        $(this).find("input[name='logo']").change(input_logo_change);
                    } else {
                        alerta('Error 404', 'no se pudo cargar aseguradora.html');
                    }
                });
                $("#nuevaAseguradora").show();
            });
        }
    }, "json");
    
    $("#btnNuevoPerito").click(function() {
        var tbody = $("#peritos").find("table").children("tbody");
        $(this).prop("disabled", true);
        $("#btnNuevoGremio").prop("disabled", true);
        $("#btnNuevoTrabajo").prop("disabled", true);
        $("#btnNuevoPeritoAceptar").show();
        $("#btnNuevoPeritoCancelar").show();
        var nombre = "<td><input type='text' class='form-control' maxlength='50' required/></td>",
            apellidos = "<td><input type='text' class='form-control' maxlength='50' required/><input type='text' class='form-control' maxlength='50'/></td>",
            telefonos = "<td><input type='tel' class='form-control' maxlength='9' required/><input type='tel' class='form-control' maxlength='9'/></td>",
            fax = "<td><input type='tel' class='form-control' maxlength='9'/></td>",
            email = "<td><input type='email' class='form-control' maxlength='100'/></td>";
        tbody.append("<tr id='trNuevoPerito'>" + nombre + apellidos + telefonos + fax + email + "</tr>");
        tbody.children("#trNuevoPerito").children("td").eq(0).children("input").focus();
    });
    
    $("#btnNuevoPeritoAceptar").click(function() {
        var p = new Perito(), error = false,
            tr = $(this).siblings("table").children("tbody").children("#trNuevoPerito"),
            nombre = tr.children("td").eq(0).children("input"),
            apellido1 = tr.children("td").eq(1).children("input").eq(0),
            apellido2 = tr.children("td").eq(1).children("input").eq(1),
            telefono1 = tr.children("td").eq(2).children("input").eq(0),
            telefono2 = tr.children("td").eq(2).children("input").eq(1),
            fax = tr.children("td").eq(3).children("input"),
            email = tr.children("td").eq(4).children("input");
        if (nombre.prop("validity").valid) {
            p.nombre = nombre.val();
        } else {
            error = true;
        }
        if (apellido1.prop("validity").valid) {
            p.apellido1 = apellido1.val();
        } else {
            error = true;
        }
        if (apellido2.prop("validity").valid) {
            p.apellido2 = apellido2.val() != "" ? apellido2.val() : null;
        } else {
            error = true;
        }
        if (telefono1.prop("validity").valid) {
            p.telefono1 = telefono1.val();
        } else {
            error = true;
        }
        if (telefono2.prop("validity").valid) {
            p.telefono2 = telefono2.val() != "" ? telefono2.val() : null;
        } else {
            error = true;
        }
        if (fax.prop("validity").valid) {
            p.fax = fax.val() != "" ? fax.val() : null;
        } else {
            error = true;
        }
        if (email.prop("validity").valid) {
            p.email = email.val() != "" ? email.val() : null;
        } else {
            error = true;
        }
        if (!error) {
            p.aseguradora = aseguradora;
            $.ajax({
                url: 'http://localhost:8080/ReForms_Provider/wr/perito/agregarPerito',
                dataType: 'json',
                type: 'post',
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(p),
                processData: false,
                success: function(data, textStatus, jQxhr){
                    $("#btnNuevoPeritoCancelar").click();
                    cargarPeritosTrabajos();
                },
                error: function(jQxhr, textStatus, errorThrown){
                    alerta('Error en proveedor', 'no ha sido posible crear el perito');
                }
            });
        } else {
            alerta('Error en los datos', 'revise los datos del perito');
            nombre.focus();
        }
    });
    
    $("#btnNuevoPeritoCancelar").click(function() {
        $(this).hide();
        $("#btnNuevoPerito").prop("disabled", false);
        $("#btnNuevoGremio").prop("disabled", false);
        $("#btnNuevoTrabajo").prop("disabled", false);
        $("#btnNuevoPeritoAceptar").hide();
        $("#peritos").find("table").children("tbody").children("#trNuevoPerito").remove();
    });
    
    $("#btnNuevoTrabajo").click(function() {
        $("#nuevoTrabajo").load("Html/trabajo.html", function(responseTxt, statusTxt) {
            if(statusTxt === 'success') {
                $(this).find(".input-aceptar").click(function() {
                    var error = false,
                        t = new Trabajo(),
                        marco = $(this).parents(".marco"),
                        codigo = marco.find(".input-codigo"),
                        descripcion = marco.find(".input-descripcion"),
                        cantidadMin = marco.find(".input-cantidadMin"),
                        precioMin = marco.find(".input-precioMin"),
                        cantidadMed = marco.find(".input-cantidadMed"),
                        precioMed = marco.find(".input-precioMed"),
                        precioExtra = marco.find(".input-precioExtra"),
                        dificultad = marco.find(".input-dificultad"),
                        medida = marco.find(".input-medida");
                    if (codigo.prop("validity").valid) {
                        t.codigo = codigo.val();
                    } else {
                        error = true;
                    }
                    if (descripcion.prop("validity").valid) {
                        t.descripcion = descripcion.val() != "" ? descripcion.val() : null;
                    } else {
                        error = true;
                    }
                    if (cantidadMin.prop("validity").valid) {
                        t.cantidadMin = cantidadMin.val() != "" ? cantidadMin.val() : 0.0;
                    } else {
                        error = true;
                    }
                    if (precioMin.prop("validity").valid) {
                        t.precioMin = precioMin.val() != "" ? precioMin.val() : 0.0;
                    } else {
                        error = true;
                    }
                    if (cantidadMed.prop("validity").valid) {
                        t.cantidadMed = cantidadMed.val() != "" ? cantidadMed.val() : 0.0;
                    } else {
                        error = true;
                    }
                    if (precioMed.prop("validity").valid) {
                        t.precioMed = precioMed.val() != "" ? precioMed.val() : 0.0;
                    } else {
                        error = true;
                    }
                    if (precioExtra.prop("validity").valid) {
                        t.precioExtra = precioExtra.val() != "" ? precioExtra.val() : 0.0;
                    } else {
                        error = true;
                    }
                    if (!error) {
                        t.aseguradora = aseguradora;
                        t.gremio = gremio;
                        t.dificultad = dificultad.val();
                        t.medida = medida.val();
                        $.ajax({
                            url: 'http://localhost:8080/ReForms_Provider/wr/trabajo/agregarTrabajo',
                            dataType: 'json',
                            type: 'post',
                            contentType: 'application/json;charset=UTF-8',
                            data: JSON.stringify(t),
                            processData: false,
                            success: function(data, textStatus, jQxhr){
                                $("#nuevoTrabajo").find(".input-cancelar").click();
                                cargarPeritosTrabajos();
                            },
                            error: function(jQxhr, textStatus, errorThrown){
                                alerta('Error en proveedor', 'no ha sido posible crear el trabajo');
                            }
                        });
                    } else {
                        alerta('Error en los datos', 'revise los datos del trabajo');
                        codigo.focus();
                    }
                });
                $(this).find(".input-cancelar").click(function() {
                    $("#nuevoTrabajo").html("");
                    $("#btnNuevaAseguradora").prop("disabled", false);
                    $("#btnNuevoPerito").prop("disabled", false);
                    $(".gremio").prop("disabled", false);
                    $("#btnNuevoTrabajo").show();
                });
            } else {
                alerta('Error 404', 'no se pudo cargar nuevoTrabajo.html');
            }
        });
        $(this).hide();
        $("#btnNuevaAseguradora").prop("disabled", true);
        $("#btnNuevoPerito").prop("disabled", true);
        $(".gremio").prop("disabled", true);
    });
});
