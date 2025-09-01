-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_contratos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME,
    "salario" REAL NOT NULL,
    "beneficios" TEXT NOT NULL,
    "clausulas" TEXT NOT NULL,
    "arquivo" TEXT,
    "status" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contratos_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_contratos" ("arquivo", "beneficios", "clausulas", "createdAt", "dataFim", "dataInicio", "funcionarioId", "id", "salario", "status", "tipo", "updatedAt") SELECT "arquivo", "beneficios", "clausulas", "createdAt", "dataFim", "dataInicio", "funcionarioId", "id", "salario", "status", "tipo", "updatedAt" FROM "contratos";
DROP TABLE "contratos";
ALTER TABLE "new_contratos" RENAME TO "contratos";
CREATE TABLE "new_equipamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "numeroSerie" TEXT,
    "dataEmprestimo" DATETIME,
    "dataDevolucao" DATETIME,
    "status" TEXT NOT NULL,
    "observacoes" TEXT,
    "funcionarioId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "equipamentos_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_equipamentos" ("createdAt", "dataDevolucao", "dataEmprestimo", "descricao", "funcionarioId", "id", "marca", "modelo", "numeroSerie", "observacoes", "status", "tipo", "updatedAt") SELECT "createdAt", "dataDevolucao", "dataEmprestimo", "descricao", "funcionarioId", "id", "marca", "modelo", "numeroSerie", "observacoes", "status", "tipo", "updatedAt" FROM "equipamentos";
DROP TABLE "equipamentos";
ALTER TABLE "new_equipamentos" RENAME TO "equipamentos";
CREATE TABLE "new_ferias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ano" INTEGER NOT NULL,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME NOT NULL,
    "diasSolicitados" INTEGER NOT NULL,
    "diasDisponiveis" INTEGER NOT NULL,
    "motivo" TEXT,
    "status" TEXT NOT NULL,
    "observacoes" TEXT,
    "motivoRecusa" TEXT,
    "motivoRenovacao" TEXT,
    "dataAprovacao" DATETIME,
    "dataRecusa" DATETIME,
    "aprovadoPor" TEXT,
    "recusadoPor" TEXT,
    "funcionarioId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ferias_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ferias" ("ano", "aprovadoPor", "createdAt", "dataAprovacao", "dataFim", "dataInicio", "dataRecusa", "diasDisponiveis", "diasSolicitados", "funcionarioId", "id", "motivo", "motivoRecusa", "motivoRenovacao", "observacoes", "recusadoPor", "status", "updatedAt") SELECT "ano", "aprovadoPor", "createdAt", "dataAprovacao", "dataFim", "dataInicio", "dataRecusa", "diasDisponiveis", "diasSolicitados", "funcionarioId", "id", "motivo", "motivoRecusa", "motivoRenovacao", "observacoes", "recusadoPor", "status", "updatedAt" FROM "ferias";
DROP TABLE "ferias";
ALTER TABLE "new_ferias" RENAME TO "ferias";
CREATE TABLE "new_funcionarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cpf" TEXT NOT NULL,
    "cnpj" TEXT,
    "nome" TEXT NOT NULL,
    "emailCorporativo" TEXT NOT NULL,
    "emailPessoal" TEXT,
    "telefone" TEXT NOT NULL,
    "telefoneCorporativo" TEXT,
    "teams" TEXT,
    "dataAdmissao" DATETIME NOT NULL,
    "dataDemissao" DATETIME,
    "status" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "salario" REAL NOT NULL,
    "chavePix" TEXT,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_funcionarios" ("cargo", "chavePix", "cnpj", "cpf", "createdAt", "dataAdmissao", "dataDemissao", "departamento", "emailCorporativo", "emailPessoal", "id", "nome", "observacoes", "salario", "status", "teams", "telefone", "telefoneCorporativo", "updatedAt") SELECT "cargo", "chavePix", "cnpj", "cpf", "createdAt", "dataAdmissao", "dataDemissao", "departamento", "emailCorporativo", "emailPessoal", "id", "nome", "observacoes", "salario", "status", "teams", "telefone", "telefoneCorporativo", "updatedAt" FROM "funcionarios";
DROP TABLE "funcionarios";
ALTER TABLE "new_funcionarios" RENAME TO "funcionarios";
CREATE UNIQUE INDEX "funcionarios_cpf_key" ON "funcionarios"("cpf");
CREATE UNIQUE INDEX "funcionarios_emailCorporativo_key" ON "funcionarios"("emailCorporativo");
CREATE TABLE "new_projetos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "cliente" TEXT,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_projetos" ("cliente", "createdAt", "dataFim", "dataInicio", "descricao", "id", "nome", "status", "updatedAt") SELECT "cliente", "createdAt", "dataFim", "dataInicio", "descricao", "id", "nome", "status", "updatedAt" FROM "projetos";
DROP TABLE "projetos";
ALTER TABLE "new_projetos" RENAME TO "projetos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
