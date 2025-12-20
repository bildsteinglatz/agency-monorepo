# Sanity Data Backup Guide

## How to Backup
We have added a convenient script to `package.json` for backing up your Sanity content.

### Using the Command Line
Run the following command in your terminal:

```bash
npm run backup
```

This will:
1. Create a `backups/` directory if it doesn't exist.
2. Export your entire `production` dataset (all content, assets, and documents).
3. Save it as a compressed file like `backups/backup-2024-12-16T10-00-00.tar.gz`.

### Restoring Data
To restore data from a backup, use the Sanity CLI:

```bash
npx sanity dataset import backups/YOUR_BACKUP_FILE.tar.gz production
```
*Note: This will add to existing data. To overwrite, you might need to clean the dataset first, which is a dangerous operation. Proceed with caution.*

## Manual Backup
You can always run the standard Sanity export command manually:
```bash
npx sanity dataset export production my-backup.tar.gz
```
