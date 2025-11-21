// jest.config.js
export default {
  transform: {
    '^.+\\.(js|ts)$': 'babel-jest' // Transforma archivos .js y .ts si usas TypeScript
  },
  testEnvironment: 'node', // Especifica que el entorno de prueba es Node.js
  extensionsToTreatAsEsm: ['.js'] // Indica a Jest que trate .js como módulos ESM
}
