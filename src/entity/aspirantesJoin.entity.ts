import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';

import { Estudios } from './estudios.entity';
import { Rama } from './rama.entity';
import { Puesto } from './puesto.entity';
import { Zona } from './zona.entity';
import { Aspirantes } from './aspirantes.entity';
import { Puntaje } from './puntaje.entity';

@Entity('aspirantes')
export class AspirantesJoin extends Aspirantes {

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

}