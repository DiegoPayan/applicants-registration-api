import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Estudios } from '../entity/estudios.entity';
import { Rama } from '../entity/rama.entity';
import { Puesto } from '../entity/puesto.entity';
import { Zona } from '../entity/zona.entity';
import { Puntaje } from '../entity/puntaje.entity';

@Entity('aspirantes')
export class Aspirantes {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Estudios)
  @JoinColumn({ name: 'idEstudios' })
  estudios: Estudios

  @OneToOne(() => Rama)
  @JoinColumn({ name: 'idRama' })
  rama: Rama

  @OneToOne(() => Puesto)
  @JoinColumn({ name: 'idPuesto' })
  puesto: Puesto

  @OneToOne(() => Zona)
  @JoinColumn({ name: 'idZona' })
  zona: Zona

  @OneToOne(() => Puntaje)
  @JoinColumn({ name: 'idPuntaje' })
  puntaje: Puntaje

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

  @Column()
  total: number

  @Column()
  estatus: String

  @Column({ name: 'created_at' })
  fechaCreacion: Date;

}