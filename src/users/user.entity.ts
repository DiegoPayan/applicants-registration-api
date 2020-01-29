import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity('usuarios')
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    nombre: string;

    @Column()
    apellidoPaterno: string;

    @Column()
    apellidoMaterno: string;

    @Column()
    status: string;

    @Column({name: 'created_at'})
    fechaCreacion: Date;
}
