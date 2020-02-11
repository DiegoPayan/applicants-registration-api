import { getManager } from 'typeorm';
import { Usuarios } from '../entity/usuarios.entity';

export class UsuariosRepository {

    async getAll(): Promise<Usuarios[]> {
        return await getManager().getRepository(Usuarios).find();
    }

    async getByClave(clave): Promise<Usuarios> {
        return await getManager().getRepository(Usuarios).findOne({ clave: clave, estatus: 'ACTIVO' });
    }

}