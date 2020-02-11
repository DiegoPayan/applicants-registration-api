import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usuarios')
export class Usuarios {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    clave: string;

    @Column()
    nombre: string;

    @Column()
    apellidoPaterno: string;

    @Column()
    apellidoMaterno: string;

    @Column()
    estatus: string;

    @Column({ name: 'created_at' })
    fechaCreacion: Date;

}