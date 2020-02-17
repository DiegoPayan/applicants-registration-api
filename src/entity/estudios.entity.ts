import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('estudios')
export class Estudios {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  estatus: string;

  @Column({ name: 'created_at' })
  fechaCreacion: Date;

}