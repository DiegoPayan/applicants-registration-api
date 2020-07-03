import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity('puntaje')
export class Puntaje {
  
  @PrimaryGeneratedColumn()
  id: Number;

  @Column()
  idAspirante: Number

  @Column()
  escolaridad: Number = 0

  @Column()
  parentesco: Number = 0

  @Column()
  tiempoServicio: Number = 0

  @Column()
  tiempoRegistro: Number = 0

  @Column()
  total: Number = 0

}