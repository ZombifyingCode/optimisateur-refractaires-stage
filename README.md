# Optimisateurs pour Matériaux Réfractaires

##  Description

Ce projet rassemble deux outils d'optimisation développés lors d'un stage ingénieur pour améliorer la gestion du stock de matériaux réfractaires dans l'industrie verrière. Ces outils automatisent des processus manuels chronophages et optimisent l'utilisation des matériaux.

##  Outils Développés

### 1. Optimisateur de Découpe
- **Fonction** : Recherche automatique du bloc optimal pour produire une ou plusieurs pièces
- **Algorithme** : Multi-pièces avec minimisation des chutes ou du nombre de découpes
- **Interface** : Visualisation 3D comparative, plan de découpe détaillé
- **Export** : Fiche PDF complète

### 2. Optimisateur de Murs Réfractaires  
- **Fonction** : Assemblage automatique de blocs pour construire un mur
- **Contraintes** : Jointures décalées (minimum 50mm), respect des techniques métier
- **Interface** : Visualisation 2D avec détection des violations
- **Export** : Plan de disposition avec données techniques

## Accès aux Outils

- **[Page d'accueil](https://zombifying-code.github.io/optimisateur-refractaires-stage/)**
- **[Optimiseur de Découpe](https://zombifying-code.github.io/optimisateur-refractaires-stage/decoupe/)**
- **[Optimiseur de Murs](https://zombifying-code.github.io/optimisateur-refractaires-stage/murs/)**

##  Fonctionnalités Principales

- Import automatique des fichiers Excel (format "Inventaire BE Fours")
- Filtrage par famille de matériaux (8 familles : électrofondus, silice, zircon, etc.)
- Algorithmes d'optimisation multicritères
- Visualisation interactive (3D pour découpe, 2D pour murs)
- Export PDF des solutions
- Interface responsive compatible tous navigateurs

##  Technologies

- **JavaScript natif** (sans framework pour simplicité de déploiement)
- **CSS 3D Transforms** (visualisation 3D)
- **SheetJS** (parsing Excel)
- **jsPDF** (export PDF)
- **HTML5/CSS3** (interface utilisateur)

##  Impact

- Automatisation des recherches manuelles dans le stock
- Optimisation de l'utilisation des matériaux réfractaires
- Réduction des chutes et des coûts
- Standardisation des processus de découpe et construction
- Génération automatique de documentation technique

##  Contexte

Projet développé lors d'un stage au Bureau d'Études Fours pour répondre aux besoins d'optimisation de la gestion du stock de matériaux réfractaires. Les outils s'intègrent dans le workflow existant et respectent les contraintes techniques métier.


---

Développé dans le cadre d'un stage ingénieur - [2025]
