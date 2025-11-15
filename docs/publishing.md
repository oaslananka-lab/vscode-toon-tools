# Publishing Guide

## GitHub Publishing Checklist

```bash
git init
git add .
git commit -m "Initial TOON VS Code extension"
git branch -M main
git remote add origin git@github.com:oaslananka/vscode-toon-tools.git
# or
# git remote add origin https://github.com/oaslananka/vscode-toon-tools.git
git push -u origin main
```

## VS Code Marketplace (Placeholder)

1. Install `vsce` and ensure `publisher` is `oaslananka`.
2. Create a Personal Access Token with the `Marketplace` scope.
3. Package locally:

   ```bash
   vsce package
   ```

4. Publish once credentials are configured:

   ```bash
   vsce publish
   ```
