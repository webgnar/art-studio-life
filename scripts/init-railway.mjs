import 'dotenv-flow/config'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '../')
const worldDir = path.join(rootDir, process.env.WORLD || 'world')

console.log('🔧 Initializing Railway environment...')

try {
  // Ensure world directory exists
  await fs.ensureDir(worldDir)
  
  // Set proper permissions on world directory
  const dbPath = path.join(worldDir, 'db.sqlite')
  
  if (await fs.exists(dbPath)) {
    // Make database writable
    await fs.chmod(dbPath, 0o664)
    console.log('✅ Database permissions fixed')
  }
  
  // Ensure assets directory is writable
  const assetsDir = path.join(worldDir, 'assets')
  if (await fs.exists(assetsDir)) {
    await fs.chmod(assetsDir, 0o755)
    console.log('✅ Assets directory permissions fixed')
  }
  
  console.log('✅ Railway environment initialized')
  
} catch (error) {
  console.error('❌ Failed to initialize Railway environment:', error)
  process.exit(1)
}
