class CapacidadLaboral extends Capacidad{
    constructor(maxEmpleados){
        super();
        this.maxEmpleados = maxEmpleados;
    }
    puedeAgregar(rol,ocupantes){
        if (rol !== "empleado") return false;
        
        return this.getDisponibles(rol,ocupantes) > 0;
    }
    getCapacidad(rol){
        if (rol!=="empleado") return 0;
        return this.maxEmpleados;
    }
    getDisponibles(rol,ocupantes){
        if (!Array.isArray(ocupantes)) return 0;
        if (rol !== "empleado") return 0;
        const totalEmpleados = ocupantes.filter(o => o.rol === "empleado").length;
        return this.maxEmpleados - totalEmpleados;

    }
}