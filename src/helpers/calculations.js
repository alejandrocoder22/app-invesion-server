const calculateCagrFromArrayAndGivenYears = (years, metric) => {
  return (Math.pow(metric[9] / metric[9 - years], 1 / years) - 1) * 100
}

const verifyNumber = (data) => {
  const parsed = JSON.stringify(data)
  return Number(parsed.trim()
    .replace(/"/g, '')
    .replace(/,/g, '')
    .replace(/(,])/gm, ']')
    .replace(/\)/g, '')
    .replace(/\$/g, '')
    .replace(/[A-Z]/g, '')
    .replace(/[a-z]/g, '')
    .replace(/(-,)/, 0 + ',')
    .trim()
    .replace(/\s/g, ''))
}

module.exports = { calculateCagrFromArrayAndGivenYears, verifyNumber }
