# NIA Compta

Logiciel de comptabilité SYSCOHADA / RDC (USD + CDF) — NIA Holding SARL.

## Installer (utilisateurs)
1. Ouvrir la page **Releases** de ce dépôt (colonne de droite sur GitHub).
2. Télécharger `NIA-Compta-Setup-x.y.z.exe` et l'exécuter (Windows peut afficher « éditeur inconnu » : Informations complémentaires → Exécuter quand même, l'installateur n'est pas signé).
3. L'application se met ensuite à jour toute seule (vérification au démarrage, menu Aide → Rechercher une mise à jour).
Les données restent dans `%APPDATA%\NIA Compta` : une mise à jour ou une réinstallation n'y touche pas.

## Publier une mise à jour (administrateur)
1. Modifier `app/index.html` (nouvelle version du logiciel) et augmenter `"version"` dans `package.json` (ex. 1.1.0 → 1.2.0).
2. `git commit`, puis `git tag v1.2.0` et `git push --tags`.
3. GitHub Actions construit l'installateur et crée la Release automatiquement (onglet Actions, ~5 min).

## Mise en place unique
- Créer un dépôt GitHub **public** (les mises à jour automatiques d'un dépôt privé nécessitent un jeton : à éviter). Les données comptables ne sont jamais dans le dépôt.
- Dépôt → Settings → Actions → General → Workflow permissions → **Read and write permissions**.
- Envoyer le contenu de ce dossier, puis `git tag v1.1.0` et `git push --tags`.
