"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const usuarios_controller_1 = require("./usuarios.controller");
const usuario_service_service_1 = require("./usuario.service.service");
let UsuariosModule = class UsuariosModule {
};
UsuariosModule = __decorate([
    common_1.Module({
        providers: [usuario_service_service_1.UsuarioService],
        controllers: [usuarios_controller_1.UsuariosController],
    })
], UsuariosModule);
exports.UsuariosModule = UsuariosModule;
//# sourceMappingURL=usuarios.module.js.map