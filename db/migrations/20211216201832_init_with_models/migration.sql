-- CreateTable
CREATE TABLE "GithubRepo" (
    "myId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "html_url" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "stargazers_count" INTEGER NOT NULL,
    "avatar_url" TEXT NOT NULL DEFAULT '',
    "latest_commit" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "GithubRepoTopics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "GithubRepoLanguage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "language" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "repoId" INTEGER NOT NULL,
    CONSTRAINT "GithubRepoLanguage_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "GithubRepo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_GithubRepoToGithubRepoTopics" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    FOREIGN KEY ("A") REFERENCES "GithubRepo" ("myId") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("B") REFERENCES "GithubRepoTopics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GithubRepo_id_key" ON "GithubRepo"("id");

-- CreateIndex
CREATE UNIQUE INDEX "GithubRepoTopics_value_key" ON "GithubRepoTopics"("value");

-- CreateIndex
CREATE UNIQUE INDEX "_GithubRepoToGithubRepoTopics_AB_unique" ON "_GithubRepoToGithubRepoTopics"("A", "B");

-- CreateIndex
CREATE INDEX "_GithubRepoToGithubRepoTopics_B_index" ON "_GithubRepoToGithubRepoTopics"("B");
