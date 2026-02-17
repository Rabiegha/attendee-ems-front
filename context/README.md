# Context Local — Web (attendee-ems-front)

## Principe

Ce dossier contient le contexte **spécifique au frontend Web**.
Le contexte **transversal** (auth globale, contrats API, format d'erreurs, règles métier invariantes) se trouve dans le **Context Hub**.

> 🔗 Hub : `../context-hub/context/` (ou le chemin configuré via `--hub`)

## Ce qui va ici (local)
- Structure du frontend (routing, state management, composants)
- Conventions UI/UX spécifiques au Web
- Décisions techniques propres au frontend (choix de libs, patterns React)
- Playbooks de déploiement Web

## Ce qui va dans le Hub (transversal)
- Format de réponse API (data-contracts)
- Stratégie auth (ADR-001)
- Format d'erreurs (ADR-002)
- Règles métier invariantes
- Baseline sécurité

## Règle PR
> Si ta PR contient une décision non triviale → crée un ADR ou mets le contexte à jour.
> Utilise le template de PR avec la section "Context / Decisions".

## Utilisation

```bash
# Voir le contexte Web (hub + local)
node scripts/get-context.js "web/*" --hub ../context-hub/context

# Scope ciblé
node scripts/get-context.js web/auth --hub ../context-hub/context --format bundle
```
