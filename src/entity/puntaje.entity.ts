import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity('puntaje')
export class Puntaje {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  escolaridad: number

  @Column()
  parentesco: number

  @Column()
  tiempoServicio: number

  @Column()
  tiempoRegistro: number

}