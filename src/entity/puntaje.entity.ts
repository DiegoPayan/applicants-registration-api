import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity('puntaje')
export class Puntaje {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  escolaridad: number = 0

  @Column()
  parentesco: number = 0

  @Column()
  tiempoServicio: number = 0

  @Column()
  tiempoRegistro: number = 0

  @Column()
  total: number = 0

}