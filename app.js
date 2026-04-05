import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Configuración de Firebase (Tus credenciales)
const firebaseConfig = {
    apiKey: "AIzaSyD2iWa3ScvMiqiPpic86o-jj95RRH1dWyU",
    authDomain: "finanzas-m-y-l.firebaseapp.com",
    databaseURL: "https://finanzas-m-y-l-default-rtdb.firebaseio.com",
    projectId: "finanzas-m-y-l",
    storageBucket: "finanzas-m-y-l.firebasestorage.app",
    messagingSenderId: "590213560036",
    appId: "1:590213560036:web:c03a20e0e207b3f60fdef1"
};

// Inicializar Firebase y la Base de Datos
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ------------------------------------------------------------------
// LÓGICA DE LOGIN ESTÁTICO
// ------------------------------------------------------------------
window.login = function() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    
    if (user === "admin" && pass === "1234") {
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("app-screen").style.display = "flex";
        cargarDatosFirebase(); // Carga los datos cuando entra
    } else {
        document.getElementById("login-error").style.display = "block";
    }
}

window.logout = function() {
    document.getElementById("app-screen").style.display = "none";
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("login-error").style.display = "none";
}

// ------------------------------------------------------------------
// LÓGICA DE PESTAÑAS (TABS)
// ------------------------------------------------------------------
window.showTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).style.display = 'block';
    event.currentTarget.classList.add('active');
}

// ------------------------------------------------------------------
// LÓGICA DE NEGOCIO Y CÁLCULOS (Recreando el Excel)
// ------------------------------------------------------------------

// 1. TENEMOS
window.guardarTenemos = function() {
    const tasaUsd = parseFloat(document.getElementById("tasa-usd").value);
    const baseDanye = parseFloat(document.getElementById("base-danye").value);
    const baseLuis = parseFloat(document.getElementById("base-luis").value);
    
    // Fórmula basada en el Excel (Sueldo + Alimentación aproximada)
    const total = baseDanye + baseLuis + 181.71; // Alimentacion y otros de tus celdas
    document.getElementById("total-sueldos").innerText = total.toFixed(2);

    // Guardar en Firebase
    set(ref(db, 'finanzas/tenemos'), {
        tasaUsd: tasaUsd,
        baseDanye: baseDanye,
        baseLuis: baseLuis,
        total: total
    });
    alert("Datos de sueldos guardados en la nube.");
}

// 2. CASTA (GASTOS E INGRESOS)
window.agregarGasto = function() {
    const desc = document.getElementById("gasto-desc").value;
    const monto = parseFloat(document.getElementById("gasto-monto").value);
    
    if(desc && !isNaN(monto)) {
        // Enviar historial a Firebase
        const gastosRef = ref(db, 'finanzas/casta/gastos');
        push(gastosRef, { descripcion: desc, monto: monto });
        
        document.getElementById("gasto-desc").value = "";
        document.getElementById("gasto-monto").value = "";
    }
}

// 3. METAS
let mesesAhorrados = 0;
window.registrarMes = function() {
    mesesAhorrados++;
    const totalAhorro = mesesAhorrados * (645 + 183); // Ahorro + Vacaciones mensual
    
    set(ref(db, 'finanzas/metas'), {
        meses: mesesAhorrados,
        total: totalAhorro
    });
}

// 4. VACACIONES VENEZUELA
window.calcularVacaciones = function() {
    const fondos = parseFloat(document.getElementById("fondos-vacaciones").value);
    const pasaje1 = parseFloat(document.getElementById("pasaje-lis-car").value);
    const pasaje2 = parseFloat(document.getElementById("pasaje-car-val").value);
    
    const totalGastado = pasaje1 + pasaje2;
    const quedan = fondos - totalGastado;
    
    document.getElementById("total-vacaciones").innerText = totalGastado.toFixed(2);
    document.getElementById("quedan-vacaciones").innerText = quedan.toFixed(2);

    set(ref(db, 'finanzas/vacaciones'), { fondos, pasaje1, pasaje2, totalGastado, quedan });
}

// ------------------------------------------------------------------
// LECTURA DE FIREBASE EN TIEMPO REAL
// ------------------------------------------------------------------
function cargarDatosFirebase() {
    // Escuchar "Tenemos"
    onValue(ref(db, 'finanzas/tenemos'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById("tasa-usd").value = data.tasaUsd;
            document.getElementById("base-danye").value = data.baseDanye;
            document.getElementById("base-luis").value = data.baseLuis;
            document.getElementById("total-sueldos").innerText = data.total.toFixed(2);
        }
    });

    // Escuchar "Casta (Gastos)"
    onValue(ref(db, 'finanzas/casta/gastos'), (snapshot) => {
        const lista = document.getElementById("lista-gastos");
        lista.innerHTML = "";
        let sumaGastos = 0;
        
        snapshot.forEach((childSnapshot) => {
            const gasto = childSnapshot.val();
            sumaGastos += gasto.monto;
            
            const li = document.createElement("li");
            li.innerHTML = `<span>${gasto.descripcion}</span> <strong>${gasto.monto} Bs</strong>`;
            lista.appendChild(li);
        });
        document.getElementById("total-gastos").innerText = sumaGastos.toFixed(2);
    });

    // Escuchar "Metas"
    onValue(ref(db, 'finanzas/metas'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            mesesAhorrados = data.meses;
            document.getElementById("meses-cumplidos").innerText = data.meses;
            document.getElementById("total-ahorrado").innerText = data.total.toFixed(2);
        }
    });

    // Escuchar "Vacaciones"
    onValue(ref(db, 'finanzas/vacaciones'), (snapshot) => {
        const data = snapshot.val();
        if(data) {
            document.getElementById("fondos-vacaciones").value = data.fondos;
            document.getElementById("pasaje-lis-car").value = data.pasaje1;
            document.getElementById("pasaje-car-val").value = data.pasaje2;
            document.getElementById("total-vacaciones").innerText = data.totalGastado;
            document.getElementById("quedan-vacaciones").innerText = data.quedan;
        }
    });
            }
