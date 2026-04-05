import { guardar, cargar } from './storage.js';
import { calcularResumen } from './modules/resumen.js';

let estado = {
    cuentas: [],
    movimientos: []
};

window.initApp = function () {
    estado = cargar("finanzas") || estado;
    render();
};

window.mostrar = function (id) {
    document.querySelectorAll("section").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
};

window.agregarCuenta = function () {
    const nombre = document.getElementById("nombreCuenta").value;
    const saldo = Number(document.getElementById("saldoCuenta").value);

    estado.cuentas.push({ nombre, saldo });

    guardar("finanzas", estado);
    render();
};

window.agregarMovimiento = function () {
    const tipo = document.getElementById("tipo").value;
    const descripcion = document.getElementById("descripcion").value;
    const monto = Number(document.getElementById("monto").value);
    const fecha = document.getElementById("fecha").value;

    estado.movimientos.push({ tipo, descripcion, monto, fecha });

    guardar("finanzas", estado);
    render();
};

function render() {

    // cuentas
    const ulCuentas = document.getElementById("listaCuentas");
    ulCuentas.innerHTML = "";

    estado.cuentas.forEach(c => {
        ulCuentas.innerHTML += `<li>${c.nombre} - ${c.saldo}€</li>`;
    });

    // movimientos
    const ulMov = document.getElementById("listaMovimientos");
    ulMov.innerHTML = "";

    estado.movimientos.forEach(m => {
        ulMov.innerHTML += `<li>${m.tipo} - ${m.descripcion} - ${m.monto}€</li>`;
    });

    // resumen
    const resumen = calcularResumen(estado.movimientos);

    document.getElementById("totalIngresos").innerText = resumen.ingresos;
    document.getElementById("totalGastos").innerText = resumen.gastos;
    document.getElementById("ahorro").innerText = resumen.ahorro;
}
