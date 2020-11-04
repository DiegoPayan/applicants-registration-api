import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('historial_aspirantes')
export class HistorialAspirantes {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  idUsuario: number

  @Column()
  tipo: string

  @Column()
  idAspirante: number

  @Column()
  dato: string
  
  @Column()
  antes: string

  @Column()
  despues: string

  @Column()
  fecha: Date = new Date();

}