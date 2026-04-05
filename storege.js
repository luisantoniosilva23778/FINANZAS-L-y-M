export function guardar(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

export function cargar(key) {
    return JSON.parse(localStorage.getItem(key));
}
