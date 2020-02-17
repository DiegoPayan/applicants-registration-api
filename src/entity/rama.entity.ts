import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rama')
export class Rama {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  estatus: string;

  @Column({ name: 'created_at' })
  fechaCreacion: Date;

}