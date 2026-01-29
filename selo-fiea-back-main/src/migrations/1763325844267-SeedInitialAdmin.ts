import { MigrationInterface, QueryRunner, Table, Repository } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/roles.enum';

export class SeedInitialAdmin1763325844267 implements MigrationInterface {
  // ATENÇÃO: Altere essas credenciais e a chave JWT_SECRET 
  // no seu ambiente de produção (se não usar um .env file)
  private ADMIN_EMAIL = 'admin@selofiea.com';
  private ADMIN_PASSWORD = 'SenhaSegura123'; 
  private ADMIN_NAME = 'Administrador Geral';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const userRepository = queryRunner.manager.getRepository(User);

    // 1. Verificar se o usuário já existe para evitar duplicidade
    const existingAdmin = await userRepository.findOne({
      where: { email: this.ADMIN_EMAIL },
    });

    if (existingAdmin) {
      console.log('Usuário admin já existe. Pulando seed.');
      return;
    }

    // 2. Criptografar a senha (usando um salt de 10 rounds)
    const hashedPassword = await bcrypt.hash(this.ADMIN_PASSWORD, 10);

    // 3. Criar e salvar o usuário admin
    const adminUser = userRepository.create({
      name: this.ADMIN_NAME,
      email: this.ADMIN_EMAIL,
      password: hashedPassword,
      role: UserRole.ADMIN, // Definido como 'admin'
      isActive: true,
      emailVerified: true, // Já considerado verificado
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await userRepository.save(adminUser);
    console.log('Usuário admin padrão criado com sucesso!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // A função down é opcional, mas recomendada.
    // Neste caso, removemos o usuário admin criado pelo seed.
    await queryRunner.manager.delete(User, {
        email: this.ADMIN_EMAIL
    });
  }
}