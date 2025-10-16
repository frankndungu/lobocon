import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialBoqSchema1760600462919 implements MigrationInterface {
    name = 'InitialBoqSchema1760600462919'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "boq_items" DROP CONSTRAINT "FK_ced11504e423ce9edd44732370e"`);
        await queryRunner.query(`CREATE TYPE "public"."boq_collections_collection_type_enum" AS ENUM('PAGE_REFERENCE', 'ITEM_COLLECTION', 'DRAWING_REFERENCE', 'SPECIFICATION_REFERENCE')`);
        await queryRunner.query(`CREATE TABLE "boq_collections" ("id" SERIAL NOT NULL, "project_id" uuid NOT NULL, "section_id" integer NOT NULL, "parent_item_id" integer, "collection_title" character varying NOT NULL, "description" text NOT NULL, "page_reference" character varying NOT NULL, "document_reference" character varying, "total_amount" numeric(12,2) NOT NULL DEFAULT '0', "item_count" integer NOT NULL DEFAULT '0', "sort_order" integer NOT NULL DEFAULT '0', "notes" text, "collection_type" "public"."boq_collections_collection_type_enum" NOT NULL DEFAULT 'PAGE_REFERENCE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_29b9637c1bdb817d685d082f657" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "boq_sections" ("id" SERIAL NOT NULL, "project_id" uuid NOT NULL, "bill_id" integer NOT NULL, "section_code" character varying NOT NULL, "section_title" character varying NOT NULL, "preamble" text, "sort_order" integer NOT NULL DEFAULT '0', "total_amount" numeric(15,2) NOT NULL DEFAULT '0', "item_count" integer NOT NULL DEFAULT '0', "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_de26bd7aa90f72e216d49b2a4c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "boq_bills" ("id" SERIAL NOT NULL, "project_id" uuid NOT NULL, "bill_number" character varying NOT NULL, "bill_title" character varying NOT NULL, "description" text, "sort_order" integer NOT NULL DEFAULT '1', "subtotal_amount" numeric(15,2) NOT NULL DEFAULT '0', "contingency_percentage" numeric(5,2) NOT NULL DEFAULT '0', "contingency_amount" numeric(15,2) NOT NULL DEFAULT '0', "total_amount" numeric(15,2) NOT NULL DEFAULT '0', "section_count" integer NOT NULL DEFAULT '0', "item_count" integer NOT NULL DEFAULT '0', "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dc96bd5d56c798d73377b05a771" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "boq_items" DROP COLUMN "summary_id"`);
        await queryRunner.query(`ALTER TABLE "boq_items" DROP COLUMN "section_name"`);
        await queryRunner.query(`ALTER TABLE "boq_items" ADD "section_id" integer`);
        await queryRunner.query(`CREATE TYPE "public"."boq_items_item_type_enum" AS ENUM('MEASURED', 'LUMP_SUM', 'PRIME_COST', 'PROVISIONAL', 'ATTENDANT', 'COLLECTION')`);
        await queryRunner.query(`ALTER TABLE "boq_items" ADD "item_type" "public"."boq_items_item_type_enum" NOT NULL DEFAULT 'MEASURED'`);
        await queryRunner.query(`ALTER TABLE "boq_items" ADD "page_reference" character varying`);
        await queryRunner.query(`ALTER TABLE "boq_collections" ADD CONSTRAINT "FK_88c57dce18760b425ae49b6c3c5" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "boq_collections" ADD CONSTRAINT "FK_3c724360291a9d905020db2b1f5" FOREIGN KEY ("section_id") REFERENCES "boq_sections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "boq_collections" ADD CONSTRAINT "FK_bfe0820f77d9d0d7a2b154df66f" FOREIGN KEY ("parent_item_id") REFERENCES "boq_items"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "boq_items" ADD CONSTRAINT "FK_ab2467c22b45b5d36db6561a77c" FOREIGN KEY ("section_id") REFERENCES "boq_sections"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "boq_sections" ADD CONSTRAINT "FK_7158b773304c28db646acb00a0c" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "boq_sections" ADD CONSTRAINT "FK_a69d0cc79b398e6ae9619347e33" FOREIGN KEY ("bill_id") REFERENCES "boq_bills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "boq_bills" ADD CONSTRAINT "FK_48626e4824a24810d15b06ee107" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "boq_bills" DROP CONSTRAINT "FK_48626e4824a24810d15b06ee107"`);
        await queryRunner.query(`ALTER TABLE "boq_sections" DROP CONSTRAINT "FK_a69d0cc79b398e6ae9619347e33"`);
        await queryRunner.query(`ALTER TABLE "boq_sections" DROP CONSTRAINT "FK_7158b773304c28db646acb00a0c"`);
        await queryRunner.query(`ALTER TABLE "boq_items" DROP CONSTRAINT "FK_ab2467c22b45b5d36db6561a77c"`);
        await queryRunner.query(`ALTER TABLE "boq_collections" DROP CONSTRAINT "FK_bfe0820f77d9d0d7a2b154df66f"`);
        await queryRunner.query(`ALTER TABLE "boq_collections" DROP CONSTRAINT "FK_3c724360291a9d905020db2b1f5"`);
        await queryRunner.query(`ALTER TABLE "boq_collections" DROP CONSTRAINT "FK_88c57dce18760b425ae49b6c3c5"`);
        await queryRunner.query(`ALTER TABLE "boq_items" DROP COLUMN "page_reference"`);
        await queryRunner.query(`ALTER TABLE "boq_items" DROP COLUMN "item_type"`);
        await queryRunner.query(`DROP TYPE "public"."boq_items_item_type_enum"`);
        await queryRunner.query(`ALTER TABLE "boq_items" DROP COLUMN "section_id"`);
        await queryRunner.query(`ALTER TABLE "boq_items" ADD "section_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "boq_items" ADD "summary_id" integer`);
        await queryRunner.query(`DROP TABLE "boq_bills"`);
        await queryRunner.query(`DROP TABLE "boq_sections"`);
        await queryRunner.query(`DROP TABLE "boq_collections"`);
        await queryRunner.query(`DROP TYPE "public"."boq_collections_collection_type_enum"`);
        await queryRunner.query(`ALTER TABLE "boq_items" ADD CONSTRAINT "FK_ced11504e423ce9edd44732370e" FOREIGN KEY ("summary_id") REFERENCES "boq_summary"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
