// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersController } from './users.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { UserIdentity } from '../auth/entities/user-identity.entity';
// import { LoginDTO } from 'src/auth/dto/login.dto';
// import { AuthController } from 'src/auth/auth.controller';

// describe('UsersController', () => {
//   let controller: AuthController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [UsersController],
//     }).compile();

//     controller = module.get<AuthController>(UsersController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   it('should return success', () => {
//     const id = '123';
//     const usernameDTO: LoginDTO = new LoginDTO();
//     usernameDTO.identifier = 'vincentramaputra123@gmail.com';
//     usernameDTO.password = 'vincent123';

//     expect(controller.login(usernameDTO));
//   })

//   it('should return success', () => {
//     const emailDTO: LoginDTO = {
//       identifier: 'vincentramaputra123@gmail.com',
//       password: 'vincent123'
//     };

//     expect(controller.login(emailDTO));
//   })
// });
