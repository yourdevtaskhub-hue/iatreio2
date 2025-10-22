#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SRC_PATH = path.join(ROOT, 'src', 'assets', 'profile.png');
const TEMP_OPTIMIZED = path.join(ROOT, 'src', 'assets', 'profile.optimized.tmp');

async function optimize() {
  try {
    // Validate source exists
    const stat = await fs.stat(SRC_PATH);
    if (!stat.isFile()) {
      throw new Error('Δεν βρέθηκε έγκυρο αρχείο profile.png');
    }

    // Process image with sharp
    // - auto rotate based on EXIF
    // - remove metadata
    // - resize to max 1200px (keeping aspect ratio)
    // - encode to MozJPEG quality 85
    await sharp(SRC_PATH)
      .rotate()
      .withMetadata({ exif: undefined, icc: undefined })
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(TEMP_OPTIMIZED);

    // Replace original (keep backup)
    const backupPath = path.join(ROOT, 'src', 'assets', 'profile.backup.original.png');
    await fs.copyFile(SRC_PATH, backupPath);
    await fs.rename(TEMP_OPTIMIZED, SRC_PATH);

    const newStat = await fs.stat(SRC_PATH);
    const kb = Math.round(newStat.size / 1024);
    console.log(`✅ Ολοκληρώθηκε: profile.png => ${kb} KB (backup: profile.backup.original.png)`);
  } catch (err) {
    // Cleanup temp if exists
    try { await fs.rm(TEMP_OPTIMIZED, { force: true }); } catch {}
    console.error('❌ Αποτυχία βελτιστοποίησης:', err.message);
    process.exit(1);
  }
}

optimize();


