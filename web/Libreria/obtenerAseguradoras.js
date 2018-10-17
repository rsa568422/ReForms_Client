function obtenerAseguradoras() {
    var resultado = [];
    $.get("http://localhost:8080/ReForms_Provider/wr/aseguradora/obtenerAseguradoras", function(data, status) {
        if (status == "success" && data.length > 0) {
            var i;
            for (i = 0; i < data.length; i++) {
                var aseguradora = new Aseguradora();
                for (a in data[i]) {
                    aseguradora[a] = data[i][a];
                }
                resultado.push(aseguradora);
            }
        }
        else {
            resultado = null;
        }
    }, "json");
    return resultado;
}