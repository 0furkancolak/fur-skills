.PHONY: help install uninstall repo-doctor test typecheck eval-meta init-gitignore init-track refresh progress compact

help:
	@echo "fur-skills (Bun)"
	@echo ""
	@echo "  make install          Symlink skills + CLI (fur install)"
	@echo "  make uninstall        Remove symlinks (fur uninstall)"
	@echo "  make repo-doctor      Validate repo quality"
	@echo "  make test             Run bun test"
	@echo "  make typecheck        Run tsc --noEmit"
	@echo "  make eval-meta        Core eval metadata checks"
	@echo "  make init-gitignore   fur init --gitignore"
	@echo "  make init-track       fur init --no-gitignore"
	@echo "  make refresh          fur refresh"
	@echo "  make progress         fur progress"
	@echo "  make compact          fur compact"

install:
	@bun src/cli.ts install

uninstall:
	@bun src/cli.ts uninstall

repo-doctor:
	@bun run repo-doctor

test:
	@bun test src/tests

typecheck:
	@bun run typecheck

eval-meta:
	@bun src/cli.ts eval meta fur-task fur-do fur-check fur-debug

init-gitignore:
	@bun src/cli.ts init --gitignore

init-track:
	@bun src/cli.ts init --no-gitignore

refresh:
	@bun src/cli.ts refresh

progress:
	@bun src/cli.ts progress

compact:
	@bun src/cli.ts compact
