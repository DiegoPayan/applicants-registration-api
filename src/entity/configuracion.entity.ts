import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity('configuracion_firmas')
export class Configuracion {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orden: number; 
  
  @Column()
  nombre: string;

  @Column()
  puesto: string;

  @Column()
  fecha: Date = new Date();

}