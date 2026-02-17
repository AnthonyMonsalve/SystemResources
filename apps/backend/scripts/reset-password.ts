import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function resetPassword() {
  // Configuración de conexión a la base de datos
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'system_resources',
    password: process.env.DB_PASSWORD || 'system_resources',
    database: process.env.DB_NAME || 'system_resources',
  });

  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    const email = '22anthony.monsalve@gmail.com';
    const newPassword = 'temporal123'; // Cambiar por la contraseña temporal que quieras

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    const result = await AppDataSource.query(
      `UPDATE "users" SET "passwordHash" = $1 WHERE email = $2`,
      [hashedPassword, email]
    );

    if (result[1] === 0) {
      console.log('❌ No se encontró ningún usuario con ese email');
    } else {
      console.log('✅ Contraseña actualizada exitosamente');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Nueva contraseña: ${newPassword}`);
      console.log('\n⚠️  Recuerda cambiar esta contraseña después de iniciar sesión');
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();
