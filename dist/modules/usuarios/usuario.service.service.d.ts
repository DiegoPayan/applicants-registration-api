import { UsuarioEntity } from './usuario.entity';
import { Repository } from 'typeorm';
export declare class UsuarioService {
    private readonly usuarioRepository;
    constructor(usuarioRepository: Repository<UsuarioEntity>);
    saveUsuario(usuario: any): Promise<any>;
    updateUsuario(id: number, usuario: any): Promise<void>;
    findAll(): Promise<void>;
    findOne(id: number): Promise<void>;
}
