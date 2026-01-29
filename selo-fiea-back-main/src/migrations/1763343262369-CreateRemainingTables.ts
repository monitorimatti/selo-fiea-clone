import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRemainingTables1763343262369 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Empresas
        await queryRunner.query(`
            CREATE TABLE "empresas" (
                "id" uniqueidentifier NOT NULL CONSTRAINT "DF_empresas_id" DEFAULT NEWSEQUENTIALID(),
                "cnpj" varchar(18) NOT NULL,
                "razaoSocial" varchar(255) NOT NULL,
                "nomeFantasia" varchar(255),
                "setor" varchar(100),
                "porte" varchar(50),
                "endereco" text,
                "contatos" text, -- JSON armazenado como texto
                "status" varchar(50) NOT NULL CONSTRAINT "DF_empresas_status" DEFAULT 'Ativo',
                "cnae" varchar(10),
                "cidade" varchar(100),
                "estado" varchar(2),
                "cep" varchar(10),
                "nomeResponsavel" varchar(100),
                "emailResponsavel" varchar(255),
                "telefoneResponsavel" varchar(20),
                "isActive" bit NOT NULL CONSTRAINT "DF_empresas_isActive" DEFAULT 1,
                "createdAt" datetime NOT NULL CONSTRAINT "DF_empresas_createdAt" DEFAULT GETDATE(),
                "updatedAt" datetime NOT NULL CONSTRAINT "DF_empresas_updatedAt" DEFAULT GETDATE(),
                CONSTRAINT "PK_empresas" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_empresas_cnpj" UNIQUE ("cnpj")
            )
        `);

        // 2. Selos
        await queryRunner.query(`
            CREATE TABLE "selos" (
                "id" int NOT NULL IDENTITY(1,1),
                "nome" varchar(255) NOT NULL,
                "descricao" text,
                "validade_meses" int NOT NULL,
                "dt_inicio_emissao" date,
                "dt_fim_emissao" date,
                "created_at" datetime NOT NULL CONSTRAINT "DF_selos_createdAt" DEFAULT GETDATE(),
                "updated_at" datetime NOT NULL CONSTRAINT "DF_selos_updatedAt" DEFAULT GETDATE(),
                CONSTRAINT "PK_selos" PRIMARY KEY ("id")
            )
        `);

        // 3. Criteria (Critérios)
        await queryRunner.query(`
            CREATE TABLE "criteria" (
                "id" int NOT NULL IDENTITY(1,1),
                "selo_id" int NOT NULL,
                "pilar" varchar(100) NOT NULL,
                "descricao" text NOT NULL,
                "peso" float NOT NULL,
                "setorial" bit NOT NULL CONSTRAINT "DF_criteria_setorial" DEFAULT 0,
                "created_at" datetime NOT NULL CONSTRAINT "DF_criteria_createdAt" DEFAULT GETDATE(),
                "updated_at" datetime NOT NULL CONSTRAINT "DF_criteria_updatedAt" DEFAULT GETDATE(),
                CONSTRAINT "PK_criteria" PRIMARY KEY ("id"),
                CONSTRAINT "FK_criteria_selos" FOREIGN KEY ("selo_id") REFERENCES "selos"("id")
            )
        `);

        // 4. Questions (Perguntas)
        await queryRunner.query(`
            CREATE TABLE "questions" (
                "id" int NOT NULL IDENTITY(1,1),
                "criterion_id" int NOT NULL,
                "enunciado" text NOT NULL,
                "tipo" varchar(50) NOT NULL,
                "obrigatoria" bit NOT NULL CONSTRAINT "DF_questions_obrigatoria" DEFAULT 1,
                "created_at" datetime NOT NULL CONSTRAINT "DF_questions_createdAt" DEFAULT GETDATE(),
                "updated_at" datetime NOT NULL CONSTRAINT "DF_questions_updatedAt" DEFAULT GETDATE(),
                CONSTRAINT "PK_questions" PRIMARY KEY ("id"),
                CONSTRAINT "FK_questions_criteria" FOREIGN KEY ("criterion_id") REFERENCES "criteria"("id")
            )
        `);

        // 5. Certification Cycles (Ciclos)
        await queryRunner.query(`
            CREATE TABLE "certification_cycles" (
                "id" int NOT NULL IDENTITY(1,1),
                "selo_id" int NOT NULL,
                "nome" varchar(100) NOT NULL,
                "dt_inicio" date NOT NULL,
                "dt_fim" date NOT NULL,
                "ativo" bit NOT NULL CONSTRAINT "DF_cycles_ativo" DEFAULT 1,
                "created_at" datetime NOT NULL CONSTRAINT "DF_cycles_createdAt" DEFAULT GETDATE(),
                "updated_at" datetime NOT NULL CONSTRAINT "DF_cycles_updatedAt" DEFAULT GETDATE(),
                CONSTRAINT "PK_certification_cycles" PRIMARY KEY ("id"),
                CONSTRAINT "FK_cycles_selos" FOREIGN KEY ("selo_id") REFERENCES "selos"("id")
            )
        `);

        // 6. Self Assessments (Autoavaliações)
        await queryRunner.query(`
            CREATE TABLE "self_assessments" (
                "id" int NOT NULL IDENTITY(1,1),
                "cycle_id" int NOT NULL,
                "created_by" uniqueidentifier NOT NULL, -- FK para User
                "dt_submissao" datetime,
                "created_at" datetime NOT NULL CONSTRAINT "DF_self_assessments_createdAt" DEFAULT GETDATE(),
                "updated_at" datetime NOT NULL CONSTRAINT "DF_self_assessments_updatedAt" DEFAULT GETDATE(),
                CONSTRAINT "PK_self_assessments" PRIMARY KEY ("id"),
                CONSTRAINT "FK_self_assessments_cycles" FOREIGN KEY ("cycle_id") REFERENCES "certification_cycles"("id"),
                CONSTRAINT "FK_self_assessments_users" FOREIGN KEY ("created_by") REFERENCES "users"("id")
            )
        `);

        // 7. Uploads (Evidências Arquivos)
        await queryRunner.query(`
            CREATE TABLE "uploads" (
                "id" int NOT NULL IDENTITY(1,1),
                "filename" varchar(255) NOT NULL,
                "originalname" varchar(255) NOT NULL,
                "mimetype" varchar(255) NOT NULL,
                "size" bigint NOT NULL,
                "path" varchar(255) NOT NULL,
                "created_at" datetime NOT NULL CONSTRAINT "DF_uploads_createdAt" DEFAULT GETDATE(),
                CONSTRAINT "PK_uploads" PRIMARY KEY ("id")
            )
        `);

        // 8. Evidences (Evidências Relacionadas)
        await queryRunner.query(`
            CREATE TABLE "evidences" (
                "id" int NOT NULL IDENTITY(1,1),
                "question_id" int,
                "self_assessment_id" int,
                "original_name" varchar(255) NOT NULL,
                "file_name" varchar(255) NOT NULL,
                "file_path" varchar(500) NOT NULL,
                "mime_type" varchar(100) NOT NULL,
                "file_size" bigint NOT NULL,
                "created_at" datetime NOT NULL CONSTRAINT "DF_evidences_createdAt" DEFAULT GETDATE(),
                "updated_at" datetime NOT NULL CONSTRAINT "DF_evidences_updatedAt" DEFAULT GETDATE(),
                CONSTRAINT "PK_evidences" PRIMARY KEY ("id"),
                CONSTRAINT "FK_evidences_questions" FOREIGN KEY ("question_id") REFERENCES "questions"("id"),
                CONSTRAINT "FK_evidences_self_assessments" FOREIGN KEY ("self_assessment_id") REFERENCES "self_assessments"("id")
            )
        `);

        // 9. Auditorias
        await queryRunner.query(`
            CREATE TABLE "auditorias" (
                "id" uniqueidentifier NOT NULL CONSTRAINT "DF_auditorias_id" DEFAULT NEWSEQUENTIALID(),
                "titulo" varchar(255) NOT NULL,
                "descricao" text,
                "empresa_id" uniqueidentifier NOT NULL,
                "auditor_responsavel_id" uniqueidentifier,
                "status" varchar(50) NOT NULL CONSTRAINT "DF_auditorias_status" DEFAULT 'em_analise',
                "pontuacaoTotal" float NOT NULL CONSTRAINT "DF_auditorias_pontuacaoTotal" DEFAULT 0,
                "pontuacaoMaxima" float NOT NULL CONSTRAINT "DF_auditorias_pontuacaoMaxima" DEFAULT 0,
                "percentualAtingido" float NOT NULL CONSTRAINT "DF_auditorias_percentualAtingido" DEFAULT 0,
                "created_at" datetime NOT NULL CONSTRAINT "DF_auditorias_createdAt" DEFAULT GETDATE(),
                "updated_at" datetime NOT NULL CONSTRAINT "DF_auditorias_updatedAt" DEFAULT GETDATE(),
                "dt_inicio" datetime,
                "dt_conclusao" datetime, 
                "dt_parecer" datetime,
                "parecer_final" text,
                CONSTRAINT "PK_auditorias" PRIMARY KEY ("id"),
                CONSTRAINT "FK_auditorias_empresas" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id"),
                CONSTRAINT "FK_auditorias_users" FOREIGN KEY ("auditor_responsavel_id") REFERENCES "users"("id")
            )
        `);
        
        // 10. Topicos Pontuacao
         await queryRunner.query(`
            CREATE TABLE "topicos_pontuacao" (
                "id" int NOT NULL IDENTITY(1,1),
                "titulo" varchar(255) NOT NULL,
                "descricao" text,
                "pontos_nivel_1" float NOT NULL DEFAULT 0,
                "pontos_nivel_2" float NOT NULL DEFAULT 0,
                "pontos_nivel_3" float NOT NULL DEFAULT 0,
                "pontos_nivel_4" float NOT NULL DEFAULT 0,
                "ordem" int NOT NULL DEFAULT 1,
                "isActive" bit NOT NULL DEFAULT 1,
                "created_at" datetime NOT NULL DEFAULT GETDATE(),
                "updated_at" datetime NOT NULL DEFAULT GETDATE(),
                CONSTRAINT "PK_topicos_pontuacao" PRIMARY KEY ("id")
            )
        `);


        // 11. Avaliacoes Topicos
        await queryRunner.query(`
            CREATE TABLE "avaliacoes_topicos" (
                "id" uniqueidentifier NOT NULL CONSTRAINT "DF_avaliacoes_id" DEFAULT NEWSEQUENTIALID(),
                "auditoria_id" uniqueidentifier NOT NULL,
                "topico_id" int NOT NULL,
                "nivel_atingido" int NOT NULL,
                "pontuacao_obtida" float NOT NULL DEFAULT 0,
                "observacoes" text,
                "avaliado_por_id" uniqueidentifier,
                "created_at" datetime NOT NULL CONSTRAINT "DF_avaliacoes_createdAt" DEFAULT GETDATE(),
                "updated_at" datetime NOT NULL CONSTRAINT "DF_avaliacoes_updatedAt" DEFAULT GETDATE(),
                CONSTRAINT "PK_avaliacoes_topicos" PRIMARY KEY ("id"),
                CONSTRAINT "FK_avaliacoes_auditorias" FOREIGN KEY ("auditoria_id") REFERENCES "auditorias"("id"),
                CONSTRAINT "FK_avaliacoes_topicos" FOREIGN KEY ("topico_id") REFERENCES "topicos_pontuacao"("id"),
                CONSTRAINT "FK_avaliacoes_users" FOREIGN KEY ("avaliado_por_id") REFERENCES "users"("id")
            )
        `);

        // 12. Audits (Auditorias Específicas de Autoavaliação)
        await queryRunner.query(`
            CREATE TABLE "audits" (
                "id" int NOT NULL IDENTITY(1,1),
                "self_assessment_id" int NOT NULL,
                "auditor_id" uniqueidentifier NOT NULL,
                "status" varchar(50) NOT NULL CONSTRAINT "DF_audits_status" DEFAULT 'em_andamento',
                "dt_inicio" datetime,
                "dt_conclusao" datetime,
                "observacoes" text,
                "parecer_final" text,
                "status_final" varchar(50),
                "dt_parecer" datetime,
                "pontuacao_total" float,
                "percentual_atingido" float,
                "created_at" datetime NOT NULL CONSTRAINT "DF_audits_createdAt" DEFAULT GETDATE(),
                "updated_at" datetime NOT NULL CONSTRAINT "DF_audits_updatedAt" DEFAULT GETDATE(),
                CONSTRAINT "PK_audits" PRIMARY KEY ("id"),
                CONSTRAINT "FK_audits_self_assessments" FOREIGN KEY ("self_assessment_id") REFERENCES "self_assessments"("id"),
                CONSTRAINT "FK_audits_users" FOREIGN KEY ("auditor_id") REFERENCES "users"("id")
            )
        `);

        // 13. Audit Findings (Pareceres/Achados)
        await queryRunner.query(`
            CREATE TABLE "audit_findings" (
                "id" int NOT NULL IDENTITY(1,1),
                "audit_id" int NOT NULL,
                "criterion_id" int NOT NULL,
                "tipo" varchar(50) NOT NULL,
                "descricao" text NOT NULL,
                "gravidade" varchar(50),
                "acao_recomendada" text,
                "created_at" datetime NOT NULL CONSTRAINT "DF_findings_createdAt" DEFAULT GETDATE(),
                "updated_at" datetime NOT NULL CONSTRAINT "DF_findings_updatedAt" DEFAULT GETDATE(),
                CONSTRAINT "PK_audit_findings" PRIMARY KEY ("id"),
                CONSTRAINT "FK_findings_audits" FOREIGN KEY ("audit_id") REFERENCES "audits"("id"),
                CONSTRAINT "FK_findings_criteria" FOREIGN KEY ("criterion_id") REFERENCES "criteria"("id")
            )
        `);

        // 14. Selos Emitidos
        await queryRunner.query(`
            CREATE TABLE "selos_emitidos" (
                "id" uniqueidentifier NOT NULL CONSTRAINT "DF_selos_emitidos_id" DEFAULT NEWSEQUENTIALID(),
                "empresa_id" uniqueidentifier NOT NULL,
                "selo_id" int NOT NULL,
                "auditoria_id" uniqueidentifier NOT NULL, -- Referência para auditoria do tipo 'auditorias'
                "data_emissao" date NOT NULL,
                "data_validade" date NOT NULL,
                "status" varchar(50) NOT NULL CONSTRAINT "DF_selos_emitidos_status" DEFAULT 'ativo',
                "pontuacao_obtida" float NOT NULL,
                "percentual_atingido" float NOT NULL,
                "qrCodeUrl" varchar(500),
                "certificadoUrl" varchar(500),
                "created_at" datetime NOT NULL CONSTRAINT "DF_selos_emitidos_createdAt" DEFAULT GETDATE(),
                "updated_at" datetime NOT NULL CONSTRAINT "DF_selos_emitidos_updatedAt" DEFAULT GETDATE(),
                CONSTRAINT "PK_selos_emitidos" PRIMARY KEY ("id"),
                CONSTRAINT "FK_selos_emitidos_empresas" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id"),
                CONSTRAINT "FK_selos_emitidos_selos" FOREIGN KEY ("selo_id") REFERENCES "selos"("id"),
                CONSTRAINT "FK_selos_emitidos_auditorias" FOREIGN KEY ("auditoria_id") REFERENCES "auditorias"("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "selos_emitidos"`);
        await queryRunner.query(`DROP TABLE "audit_findings"`);
        await queryRunner.query(`DROP TABLE "audits"`);
        await queryRunner.query(`DROP TABLE "avaliacoes_topicos"`);
        await queryRunner.query(`DROP TABLE "topicos_pontuacao"`);
        await queryRunner.query(`DROP TABLE "auditorias"`);
        await queryRunner.query(`DROP TABLE "evidences"`);
        await queryRunner.query(`DROP TABLE "uploads"`);
        await queryRunner.query(`DROP TABLE "self_assessments"`);
        await queryRunner.query(`DROP TABLE "certification_cycles"`);
        await queryRunner.query(`DROP TABLE "questions"`);
        await queryRunner.query(`DROP TABLE "criteria"`);
        await queryRunner.query(`DROP TABLE "selos"`);
        await queryRunner.query(`DROP TABLE "empresas"`);
    }
}