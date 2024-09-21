import os

# Укажите правильный путь к вашему локальному репозиторию
repo_path = '/Users/willkeenbe/Local/git/figma-plugin-sync-notion'

structure = {}
for root, dirs, files in os.walk(repo_path):
    relative_path = os.path.relpath(root, repo_path)
    structure[relative_path] = files

print(structure)