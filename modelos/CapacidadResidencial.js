class CapacidadResidencial extends Capacidad{
    constructor(maxResidentes){
        super();
        this.maxResidentes = maxResidentes;
    }
    puedeAgregar(rol,ocupantes){
        if (rol !== "residente") return false;
        return this.getDisponibles(rol,ocupantes) > 0;
    }
    getCapacidad(rol){
        if (rol !== "residente") return 0;
        return this.maxResidentes;
    }
    getDisponibles(rol,ocupantes){
        if (rol!=="residente") return 0;
        const totalResidentes = ocupantes.filter(o => o.rol === "residente").length;
        return this.maxResidentes-totalResidentes;
    }
}