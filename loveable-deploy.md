# Deploying Monorepo to Loveable.dev

## Overview
This guide covers deploying your Rhythm Sync monorepo with two applications (`main-app` and `organizers-app`) to loveable.dev.

## Deployment Options

### Option 1: Separate Loveable Projects (Recommended)
Deploy each app as a separate loveable.dev project:

#### Main App Deployment
1. Create new loveable.dev project for "Rhythm Sync Main"
2. Connect to your GitHub repository
3. Set build configuration:
   - **Build command**: `npm run build --filter=main-app`
   - **Output directory**: `dist/apps/main-app`
   - **Install command**: `npm ci`

#### Organizers App Deployment  
1. Create new loveable.dev project for "Rhythm Sync Organizers"
2. Connect to same GitHub repository
3. Set build configuration:
   - **Build command**: `npm run build --filter=organizers-app`
   - **Output directory**: `dist/apps/organizers-app`
   - **Install command**: `npm ci`

### Option 2: Single Project with Manual Switching
Deploy as one project and manually switch between apps:
- Use different branches for each app
- Configure build command to target specific app
- Less optimal for production use

## Environment Configuration

### Shared Environment Variables
Both apps can share common variables:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
NODE_ENV=production
```

### App-Specific Variables
Configure different variables per app:

**Main App:**
```
NEXT_PUBLIC_APP_NAME=Rhythm Sync
NEXT_PUBLIC_APP_URL=https://your-main-app.lovable.app
```

**Organizers App:**
```
NEXT_PUBLIC_APP_NAME=Rhythm Sync Organizers
NEXT_PUBLIC_APP_URL=https://your-organizers-app.lovable.app
```

## Custom Domains
1. In loveable.dev dashboard, go to "Domain settings"
2. Add your custom domains:
   - `rhythmsync.app` → main-app
   - `organizers.rhythmsync.app` → organizers-app

## Deployment Workflow

### Automatic Deployments
Configure GitHub webhooks to trigger deployments:
```yaml
# In your GitHub Actions workflow
deploy-main-app:
  if: contains(github.event.head_commit.modified, 'apps/main-app/')
  steps:
    - name: Deploy Main App
      # Trigger loveable.dev deployment

deploy-organizers-app:
  if: contains(github.event.head_commit.modified, 'apps/organizers-app/')
  steps:
    - name: Deploy Organizers App
      # Trigger loveable.dev deployment
```

### Manual Deployments
Use loveable.dev's dashboard to manually trigger deployments when needed.

## Database Considerations
Since both apps share the same Supabase database:
1. Use the same database connection for both deployments
2. Implement proper Row Level Security (RLS)
3. Consider using different schemas or prefixes if needed

## Monitoring and Analytics
- Set up separate analytics for each app
- Use different Supabase projects if you need isolated metrics
- Configure error tracking per application

## Best Practices
1. **Use preview deployments** for testing changes
2. **Configure branch-based deployments** (main → production, develop → staging)
3. **Set up health checks** for both applications
4. **Monitor performance** separately for each app
5. **Use feature flags** to control rollouts across apps

## Troubleshooting

### Build Issues
- Ensure all dependencies are in root `package.json`
- Verify Turborepo configuration is correct
- Check that build outputs are in expected directories

### Deployment Conflicts
- Stagger deployments if they share resources
- Use different deployment slots if available
- Monitor for database connection limits

### Environment Variables
- Double-check all required variables are set
- Use different prefixes for app-specific variables
- Test in preview environments first 