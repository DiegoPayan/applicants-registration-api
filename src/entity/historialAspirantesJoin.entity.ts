import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { HistorialAspirantes } from './historialAspirantes.entity';
import { Usuarios } from './usuarios.entity';

@Entity('historial_aspirantes')
export class HistorialAspirantesJoin extends HistorialAspirantes {

  @OneToOne(() => Usuarios)
  @JoinColumn({ name: 'idUsuario' })
  usuarios: Usuarios

}