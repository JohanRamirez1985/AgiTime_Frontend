
export function esHoy(fecha: Date):boolean {
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() &&
            fecha.getMonth() === hoy.getMonth() &&
            fecha.getFullYear() === hoy.getFullYear();
}

