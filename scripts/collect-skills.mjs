#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const skillNames = [
  'playwright-cli',
  'playwright-component-testing',
  'playwright-trace',
];
const sourceRoots = [
  join(repoRoot, '.agents', 'skills'),
  join(repoRoot, '.claude', 'skills'),
];
const destinationRoot = join(repoRoot, 'skills');

mkdirSync(destinationRoot, { recursive: true });

let copiedSkills = 0;

for (const skillName of skillNames) {
  const sourceRoot = sourceRoots.find((root) =>
    existsSync(join(root, skillName)),
  );

  if (!sourceRoot) {
    console.warn(`[collect-skills] Could not find generated skill: ${skillName}`);
    continue;
  }

  const sourcePath = join(sourceRoot, skillName);
  const destinationPath = join(destinationRoot, skillName);
  rmSync(destinationPath, { recursive: true, force: true });
  cpSync(sourcePath, destinationPath, { recursive: true });

  const fileCount = countFiles(destinationPath);
  copiedSkills += 1;
  console.log(
    `[collect-skills] Copied ${sourcePath} -> ${destinationPath} (${fileCount} file(s))`,
  );
}

if (copiedSkills === 0) {
  console.warn(
    '[collect-skills] No skills were copied. Verify that `playwright init-skills --loop=agents` ran successfully.',
  );
} else {
  console.log(
    `[collect-skills] Done. Copied ${copiedSkills} skill director${copiedSkills === 1 ? 'y' : 'ies'} into ${destinationRoot}`,
  );
}

function countFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).reduce(
    (count, entry) => {
      const entryPath = join(directory, entry.name);
      return count + (entry.isDirectory() ? countFiles(entryPath) : 1);
    },
    0,
  );
}
