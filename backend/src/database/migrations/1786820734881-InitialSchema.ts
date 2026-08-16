import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1786820734881 implements MigrationInterface {
  name = 'InitialSchema1786820734881';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "super_admin_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fullName" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role_id" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "last_login_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_1e776fce1053148bb3813603638" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_910a1e8c847406c790b8906726" ON "super_admin_users" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying, "permissions" text array NOT NULL DEFAULT '{}', CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "token_hash" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "user_agent" character varying, "ip_address" character varying, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a7838d2ba25be1342091b6695f" ON "refresh_tokens" ("token_hash") `,
    );
    await queryRunner.query(
      `CREATE TABLE "tenant_branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenant_id" uuid NOT NULL, "name" character varying NOT NULL, "is_head_office" boolean NOT NULL DEFAULT false, "addressLine1" character varying, "addressLine2" character varying, "city" character varying, "state" character varying, "country" character varying, "postal_code" character varying, "phone" character varying, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_f17c6c3416e4433162c116ec01a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tenant_users_role_enum" AS ENUM('OWNER', 'ADMIN', 'HR_MANAGER', 'RECRUITER', 'VIEWER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tenant_users_status_enum" AS ENUM('INVITED', 'ACTIVE', 'SUSPENDED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tenant_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenant_id" uuid NOT NULL, "branch_id" uuid, "fullName" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying, "role" "public"."tenant_users_role_enum" NOT NULL DEFAULT 'VIEWER', "status" "public"."tenant_users_status_enum" NOT NULL DEFAULT 'INVITED', "invited_at" TIMESTAMP WITH TIME ZONE, "last_login_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_8ce1bc9e3a5887c234900365447" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fae37b5b2b62cbce0f173e77bd" ON "tenant_users" ("email") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscription_plans_billing_cycle_enum" AS ENUM('MONTHLY', 'YEARLY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "code" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'USD', "billing_cycle" "public"."subscription_plans_billing_cycle_enum" NOT NULL DEFAULT 'MONTHLY', "max_users" integer NOT NULL DEFAULT '5', "max_branches" integer NOT NULL DEFAULT '1', "features" text array NOT NULL DEFAULT '{}', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2d2df70a81d37c893ef216caf8" ON "subscription_plans" ("code") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tenant_subscriptions_status_enum" AS ENUM('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tenant_subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenant_id" uuid NOT NULL, "plan_id" uuid NOT NULL, "status" "public"."tenant_subscriptions_status_enum" NOT NULL DEFAULT 'TRIALING', "trial_ends_at" TIMESTAMP WITH TIME ZONE, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE, "auto_renew" boolean NOT NULL DEFAULT true, "cancelled_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_9455f2b3b10365e81538a079da3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tenant_plan_history_action_enum" AS ENUM('TRIAL_START', 'NEW_SUBSCRIPTION', 'UPGRADE', 'DOWNGRADE', 'RENEWAL', 'CANCELLATION')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tenant_plan_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenant_id" uuid NOT NULL, "from_plan_id" uuid, "to_plan_id" uuid NOT NULL, "action" "public"."tenant_plan_history_action_enum" NOT NULL, "effective_date" TIMESTAMP WITH TIME ZONE NOT NULL, "note" text, "changed_by_id" character varying, CONSTRAINT "PK_0d640352f8b592c2dc247912825" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invoices_status_enum" AS ENUM('DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'FAILED', 'REFUNDED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenant_id" uuid NOT NULL, "subscription_id" uuid, "invoice_number" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'USD', "status" "public"."invoices_status_enum" NOT NULL DEFAULT 'PENDING', "issue_date" TIMESTAMP WITH TIME ZONE NOT NULL, "due_date" TIMESTAMP WITH TIME ZONE NOT NULL, "paid_at" TIMESTAMP WITH TIME ZONE, "pdf_url" character varying, CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d8f8d3788694e1b3f96c42c36f" ON "invoices" ("invoice_number") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tenants_status_enum" AS ENUM('ONBOARDING', 'ACTIVE', 'SUSPENDED', 'CHURNED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tenants_onboarding_step_enum" AS ENUM('COMPANY_DETAILS', 'BRANCH_SETUP', 'ADMIN_USER', 'PLAN_SELECTION', 'COMPLETE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "industry" character varying, "contact_name" character varying, "contact_email" character varying NOT NULL, "contact_phone" character varying, "country" character varying, "logo_url" character varying, "status" "public"."tenants_status_enum" NOT NULL DEFAULT 'ONBOARDING', "onboarding_step" "public"."tenants_onboarding_step_enum" NOT NULL DEFAULT 'COMPANY_DETAILS', "notes" text, CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2310ecc5cb8be427097154b18f" ON "tenants" ("slug") `,
    );
    await queryRunner.query(
      `ALTER TABLE "super_admin_users" ADD CONSTRAINT "FK_5dcb598d6d91f8d62c8adf92ad6" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "super_admin_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_branches" ADD CONSTRAINT "FK_aef1d11ff35bd5e8c721f715e0d" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_users" ADD CONSTRAINT "FK_85a7f13b3f434940151fb44f4c1" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_users" ADD CONSTRAINT "FK_d912b55f6bd417bde89cb661e81" FOREIGN KEY ("branch_id") REFERENCES "tenant_branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "FK_c59c97d5c1343951e044c137f02" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "FK_cb2ac3bd398220d534c92db8b2e" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_plan_history" ADD CONSTRAINT "FK_8db02b3390b23a0b89bcebd1e64" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_plan_history" ADD CONSTRAINT "FK_3df30d33f929b00cb768c6085da" FOREIGN KEY ("from_plan_id") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_plan_history" ADD CONSTRAINT "FK_5ae6fb0329086080f17b300c772" FOREIGN KEY ("to_plan_id") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_440f531f452dcc4389d201b9d4b" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_5152c0aa0f851d9b95972b442e0" FOREIGN KEY ("subscription_id") REFERENCES "tenant_subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_5152c0aa0f851d9b95972b442e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_440f531f452dcc4389d201b9d4b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_plan_history" DROP CONSTRAINT "FK_5ae6fb0329086080f17b300c772"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_plan_history" DROP CONSTRAINT "FK_3df30d33f929b00cb768c6085da"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_plan_history" DROP CONSTRAINT "FK_8db02b3390b23a0b89bcebd1e64"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_subscriptions" DROP CONSTRAINT "FK_cb2ac3bd398220d534c92db8b2e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_subscriptions" DROP CONSTRAINT "FK_c59c97d5c1343951e044c137f02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_users" DROP CONSTRAINT "FK_d912b55f6bd417bde89cb661e81"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_users" DROP CONSTRAINT "FK_85a7f13b3f434940151fb44f4c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tenant_branches" DROP CONSTRAINT "FK_aef1d11ff35bd5e8c721f715e0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "super_admin_users" DROP CONSTRAINT "FK_5dcb598d6d91f8d62c8adf92ad6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2310ecc5cb8be427097154b18f"`,
    );
    await queryRunner.query(`DROP TABLE "tenants"`);
    await queryRunner.query(
      `DROP TYPE "public"."tenants_onboarding_step_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."tenants_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d8f8d3788694e1b3f96c42c36f"`,
    );
    await queryRunner.query(`DROP TABLE "invoices"`);
    await queryRunner.query(`DROP TYPE "public"."invoices_status_enum"`);
    await queryRunner.query(`DROP TABLE "tenant_plan_history"`);
    await queryRunner.query(
      `DROP TYPE "public"."tenant_plan_history_action_enum"`,
    );
    await queryRunner.query(`DROP TABLE "tenant_subscriptions"`);
    await queryRunner.query(
      `DROP TYPE "public"."tenant_subscriptions_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2d2df70a81d37c893ef216caf8"`,
    );
    await queryRunner.query(`DROP TABLE "subscription_plans"`);
    await queryRunner.query(
      `DROP TYPE "public"."subscription_plans_billing_cycle_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fae37b5b2b62cbce0f173e77bd"`,
    );
    await queryRunner.query(`DROP TABLE "tenant_users"`);
    await queryRunner.query(`DROP TYPE "public"."tenant_users_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tenant_users_role_enum"`);
    await queryRunner.query(`DROP TABLE "tenant_branches"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a7838d2ba25be1342091b6695f"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_910a1e8c847406c790b8906726"`,
    );
    await queryRunner.query(`DROP TABLE "super_admin_users"`);
  }
}
