-- CreateTable
CREATE TABLE "auth_usuarios" (
    "id" TEXT NOT NULL,
    "usuario_email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "auth_usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_usuarios_usuario_email_key" ON "auth_usuarios"("usuario_email");
