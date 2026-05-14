.PHONY: setup install uninstall doctor init init-gitignore init-track refresh progress compact help

help:
	@echo "fur-skills Makefile"
	@echo ""
	@echo "Setup & Install:"
	@echo "  make setup            One-time repo setup (chmod +x, git init)"
	@echo "  make install          Symlink skills + CLI to user directories"
	@echo "  make uninstall         Remove all skill + CLI symlinks"
	@echo "  make doctor            Verify installation status"
	@echo ""
	@echo "Project Planning (requires fur init first):"
	@echo "  make init-gitignore    Init .fur.planning + add to .gitignore"
	@echo "  make init-track        Init .fur.planning (trackable by git)"
	@echo "  make refresh           Create a progress snapshot"
	@echo "  make progress          Show current progress summary"
	@echo "  make compact           Archive old progress snapshots"

setup:
	@./setup-fur-skills.sh

install:
	@./scripts/install.sh

uninstall:
	@./scripts/uninstall.sh

doctor:
	@./scripts/doctor.sh

init-gitignore:
	@fur init --gitignore

init-track:
	@fur init --no-gitignore

refresh:
	@fur refresh

progress:
	@fur progress

compact:
	@fur compact