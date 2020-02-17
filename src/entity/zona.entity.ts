import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('zona')
export class Zona {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  estatus: string;

  @Column({ name: 'created_at' })
  fechaCreacion: Date;

}