import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenantClientCompanyCount1786825249155 implements MigrationInterface {
  name = 'AddTenantClientCompanyCount1786825249155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD "client_company_count" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tenants" DROP COLUMN "client_company_count"`,
    );
  }
}
