Base de datos 
Diagrama de base de datos

Script de la base de datos
Table empleados {
  id              serial [pk]
  numero          varchar(20) [unique, not null]
  nombre          text [not null]
  rol             enum('CHOFER','CARGADOR','AUXILIAR') [not null]
  tipo            enum('INTERNO','EXTERNO') [not null]
  activo          boolean [not null, default: true]
  creado_en       timestamp
  actualizado_en  timestamp
}
Table movimientos {
  id              serial [pk]
  empleado_id     int [ref: > empleados.id, not null]
  fecha           date [not null]
  entregas        int [not null]
  cubrio_turno    boolean [default: false]
  rol_cubierto    enum('CHOFER','CARGADOR')
  horas           int [default: 8]
  creado_en       timestamp
  actualizado_en  timestamp
}
Table parametros_nomina {
  id                      serial [pk]
  vigente_desde           date [not null]
  base_por_hora           numeric(12,2) [default: 30.00]
  bono_hora_chofer        numeric(12,2) [default: 10.00]
  bono_hora_cargador      numeric(12,2) [default: 5.00]
  bono_hora_auxiliar      numeric(12,2) [default: 0.00]
  pago_por_entrega        numeric(12,2) [default: 5.00]
  isr_base                numeric(5,4)  [default: 0.09]
  isr_extra_umbral_bruto  numeric(12,2) [default: 16000.00]
  isr_extra_adicional     numeric(5,4)  [default: 0.03]
  vales_pct               numeric(5,4)  [default: 0.04]
  activo                  boolean [default: true]
}
Table nominas {
  id            serial [pk]
  periodo       char(7) [not null, unique] // YYYY-MM
  generado_en   timestamp
  parametros_id int [ref: > parametros_nomina.id, not null]
  estado        varchar(20) [default: "BORRADOR"] // BORRADOR o CERRADA
}
Table nomina_detalles {
  id               serial [pk]
  nomina_id        int [ref: > nominas.id, not null]
  empleado_id      int [ref: > empleados.id, not null]
  dias_trabajados  int [not null]
  horas_totales    int [not null]
  entregas_totales int [not null]
  base             numeric(12,2) [not null]
  bono             numeric(12,2) [not null]
  pago_entregas    numeric(12,2) [not null]
  bruto            numeric(12,2) [not null]
  vales            numeric(12,2) [not null]
  isr              numeric(12,2) [not null]
  neto             numeric(12,2) [not null]
}
Ref: movimientos.empleado_id > empleados.id
Ref: nomina_detalles.nomina_id > nominas.id
Ref: nomina_detalles.empleado_id > empleados.id
Ref: nominas.parametros_id > parametros_nomina.id
