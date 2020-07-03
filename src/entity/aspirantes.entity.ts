import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity('aspirantes')
export class Aspirantes {

  @PrimaryGeneratedColumn()
  id: Number;

  @Column()
  idEstudios: Number

  @Column()
  idRama: Number

  @Column()
  idPuesto: Number

  @Column()
  idZona: Number

  @Column()
  folio: String

  @Column()
  nombre: String

  @Column()
  apellidoPaterno: String

  @Column()
  apellidoMaterno: String

  @Column()
  listado: String

  @Column({ name: 'fecha' })
  fecha: Date = new Date()

  @Column()
  total: Number = 0

  @Column()
  estatus: String = 'ACTIVO'

  @Column({ name: 'created_at' })
  fechaCreacion: Date = new Date()

}