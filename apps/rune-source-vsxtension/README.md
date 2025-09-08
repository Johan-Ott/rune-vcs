# Rune VCS Extension

En VS Code extension för integration med rune-vcs version control system. Denna extension fungerar som en Source Control Provider, precis som Git-integrationen i VS Code.

## Funktioner

- Source Control Provider för rune-vcs
- Real-time repository status via HTTP API
- Stage/unstage filer med inline-knappar
- Commit functionality med meddelande input
- Branch management och växling
- File change decorations och ikoner

## Installation

1. Kontrollera att rune-vcs är installerat
2. Starta rune-vcs API servern på port 7420
3. Öppna en mapp med `.rune` directory i VS Code
4. Extensionen aktiveras automatiskt

## Användning

Extensionen skapar en Source Control Provider som fungerar precis som Git:

- **Source Control Panel**: Visa ändringar, staged filer
- **Input Box**: Skriv commit-meddelanden
- **Inline-knappar**: Stage, unstage, discard ändringar
- **Branch Management**: Skapa och växla branches

## Krav

- VS Code 1.103.0+
- Rune-vcs med API server
- `.rune` directory i workspace

## API Integration

Använder rune-vcs HTTP API på http://127.0.0.1:7420 för snabb integration.
