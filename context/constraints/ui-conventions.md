# Conventions UI — Règles de développement

## Scope
- Toutes les pages et composants du frontend

## Règles critiques

### 1. Réutilisation obligatoire des composants existants

**JAMAIS créer un composant s'il existe déjà dans `src/shared/ui/`.**

Composants de layout de page (obligatoires sur chaque page) :
- `PageContainer` — wraper principal de page (`maxWidth="7xl"`, `padding="lg"`)
- `PageHeader` — en-tête standardisé (title, description, icon, actions, badge)
- `PageSection` — section avec espacement

Composants de données :
- `DataTable` + helpers (`createSelectionColumn`, `createDateColumn`, `createActionsColumn`) — pour TOUTES les tables de données
- `FilterBar` + `SearchInput` + `FilterButton` + `FilterSort` — pour les filtres
- `Tabs` + `TabItem` — pour les onglets actifs/supprimés

Composants de formulaire :
- `Modal` — pour les popups de création/édition
- `FormField` — pour chaque champ de formulaire
- `Input`, `Select`, `Button`, `Textarea`
- `UniversalModal` + `useUniversalModal` — pour les confirmations/succès/erreurs

### 2. Pattern de page standard

```tsx
<PageContainer maxWidth="7xl" padding="lg">
  <PageHeader
    title={t('namespace:page.title')}
    description={t('namespace:page.description')}
    icon={IconComponent}
    actions={<Button>Action</Button>}
  />
  <PageSection spacing="lg">
    <FilterBar resultCount={total} resultLabel={t('...')}>
      <SearchInput ... />
      <FilterButton ... />
    </FilterBar>
  </PageSection>
  <Card>
    <DataTable columns={columns} data={data} ... />
  </Card>
</PageContainer>
```

### 3. Internationalisation (i18n)

- Chaque texte affiché utilise `t('namespace:cle')` via `useTranslation`
- Fichiers de traduction dans `src/shared/lib/i18n/locales/{fr,en}/`
- Namespace = nom du fichier JSON (ex: `common`, `events`)
- Interpolation : `t('key', { count: 5 })` → `{{count}}`

### 4. State management

- **RTK Query** pour toutes les données serveur (pas React Query, pas fetch brut)
- API slices dans `src/features/{module}/api/`
- Tags pour invalidation automatique du cache
- Redux slices pour l'état client (filtres, pagination)

### 5. Routing & Guards

- Routes dans `src/app/routes/index.tsx`
- `GuardedRoute` pour les permissions RBAC : `<GuardedRoute action="read" subject="X">`
- Constants dans `src/app/config/constants.ts` (`ROUTES`)

### 6. Conventions de nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Page component | `{Name}Page` | `PartnersPage` |
| API file | `{module}Api.ts` | `partnersApi.ts` |
| Modal component | `{Action}{Entity}Modal` | `InvitePartnerModal` |
| i18n namespace | kebab-case ou existant | `common:partners.xxx` |
| Feature folder | kebab-case | `features/partners/` |
| Page folder | PascalCase | `pages/Partners/` |

## Types de comptes

Il existe deux profils distincts qui affectent l'affichage :
- **Compte Partner (PARTNER)** — voit uniquement ses propres données (scans, événements assignés)
- **Comptes non-Partner (ADMIN, MANAGER, etc.)** — voient les données de tous les partenaires

Le module "Partenaires" (sidebar) affiche :
- Pour un PARTNER : "Mes Contacts" → ses propres scans
- Pour un non-PARTNER : "Partenaires" → liste des partenaires de l'org, avec drill-down sur leurs scans
