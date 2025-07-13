import fs from 'fs'
import path from 'path'
import { swaggerSpec } from '../shared/config/swagger'

const outputPath = path.join(__dirname, '../../docs/openapi.json')
const outputDir = path.dirname(outputPath)

// Create docs directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Write the OpenAPI spec to file
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2))

console.log('✅ OpenAPI specification generated successfully!')
console.log(`📄 File saved to: ${outputPath}`)
console.log(
  '🌐 Start the server and visit http://localhost:3001/api/docs to view the documentation'
)
