# Database Migration to CloudNativePG

## 📅 Migration Date

**Planned**: [INSERT DATE]

## 🔄 Breaking Changes

### Database Connection String

**OLD (External PostgreSQL):**

```
postgresql://onesac:1!onesac@@rland.co.kr:5432/onesacdb?schema=public
```

**NEW (CloudNativePG in k3s):**

```
postgresql://ssemtle_user:${PASSWORD}@ssemtle-db-rw.apps.svc.cluster.local:5432/ssemtle?schema=public
```

### What Changed:

| Component | Old Value     | New Value                              | Impact       |
| --------- | ------------- | -------------------------------------- | ------------ |
| Host      | `rland.co.kr` | `ssemtle-db-rw.apps.svc.cluster.local` | 🔴 Breaking  |
| Port      | `5432`        | `5432`                                 | ✅ No change |
| Database  | `onesacdb`    | `ssemtle`                              | 🔴 Breaking  |
| User      | `onesac`      | `ssemtle_user`                         | 🔴 Breaking  |
| Password  | `1!onesac@`   | [New password from secret]             | 🔴 Breaking  |
| Schema    | `public`      | `public`                               | ✅ No change |

### Service Endpoints Available:

```
ssemtle-db-rw    # Read-Write (primary) - Use this for app
ssemtle-db-ro    # Read-Only (replicas)
ssemtle-db-r     # Read service (any instance)
```

## 📋 Migration Process

### 1. Data Migration

- **Method**: CloudNativePG built-in import
- **Source**: `rland.co.kr:5432/onesacdb`
- **Destination**: `ssemtle-db` cluster in `apps` namespace
- **Migration Type**: Full database import (schema + data)

### 2. Environment Variable Updates

**Update the following in your Kubernetes Secret (`ssemtle-env`):**

```bash
# Before
DATABASE_URL="postgresql://onesac:1!onesac@@rland.co.kr:5432/onesacdb?schema=public"

# After
DATABASE_URL="postgresql://ssemtle_user:<PASSWORD>@ssemtle-db-rw.apps.svc.cluster.local:5432/ssemtle?schema=public"
```

**Get the new password:**

```bash
kubectl get secret ssemtle-db-app -n apps -o jsonpath='{.data.password}' | base64 -d
```

### 3. Update Secret

```bash
# Get current password
PASSWORD=$(kubectl get secret ssemtle-db-app -n apps -o jsonpath='{.data.password}' | base64 -d)

# Update DATABASE_URL in your .env file
DATABASE_URL="postgresql://ssemtle_user:${PASSWORD}@ssemtle-db-rw.apps.svc.cluster.local:5432/ssemtle?schema=public"

# Recreate the secret
kubectl delete secret ssemtle-env -n apps
kubectl create secret generic ssemtle-env --from-env-file=.env -n apps
```

### 4. Deployment Rollout

After updating the secret:

```bash
kubectl rollout restart deployment/ssemtle -n apps
```

## ✅ Verification Checklist

- [ ] Database imported successfully
- [ ] All tables present
- [ ] Row counts match source database
- [ ] Secret updated with new DATABASE_URL
- [ ] App deployment restarted
- [ ] Health checks passing (`/healthz`, `/readyz`)
- [ ] Application can query database
- [ ] No connection errors in logs

## 🔙 Rollback Plan

If migration fails, revert to old database:

1. Update secret back to old DATABASE_URL:

   ```bash
   DATABASE_URL="postgresql://onesac:1!onesac@@rland.co.kr:5432/onesacdb?schema=public"
   ```

2. Restart deployment:
   ```bash
   kubectl rollout restart deployment/ssemtle -n apps
   ```

## 📞 Contact

Questions? Contact: Ori

## 🗑️ Cleanup (After Successful Migration)

After confirming everything works for 1+ week:

- [ ] Remove old database access from firewall
- [ ] Archive old database backup
- [ ] Update team documentation
- [ ] Remove this file from the repo
